import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { verifyWebhookSecret } from '@/lib/printful';
import { sendShippingEmail } from '@/lib/email';

/**
 * POST /api/webhooks/printful?secret=<PRINTFUL_WEBHOOK_SECRET>
 *
 * Printful sends events like:
 *   - package_shipped   — order.shipments[0].tracking_number becomes available
 *   - package_returned
 *   - order_failed
 *   - order_canceled
 *   - order_put_hold
 *   - order_remove_hold
 *   - order_refunded
 *
 * We match the incoming event.order.external_id (our order token) or
 * event.order.id (Printful order id) to our orders row and update status.
 *
 * Configure in Printful:
 *   Printful dashboard → Settings → Stores → MilesAwayPrints → Webhooks
 *   URL: https://milesawayprints.com/api/webhooks/printful?secret=<your-random-secret>
 *   Events: all (or at minimum package_shipped, order_failed, order_canceled,
 *           product_synced, product_updated, product_deleted)
 *
 * Add PRINTFUL_WEBHOOK_SECRET to .env.local / Vercel env.
 */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get('secret');

  if (!verifyWebhookSecret(secret)) {
    return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 401 });
  }

  let event;
  try {
    event = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const type: string = event?.type ?? '';

  // Catalog events — re-run the product sync so the site catalog matches
  // Printful within seconds of any add / change / remove.
  if (
    type === 'product_synced' ||
    type === 'product_updated' ||
    type === 'product_deleted'
  ) {
    try {
      const res = await fetch(`${url.origin}/api/printful/sync`, { method: 'POST' });
      const data = await res.json();
      return NextResponse.json({ ok: true, triggered: 'sync', event: type, sync: data });
    } catch (err) {
      return NextResponse.json(
        { ok: false, event: type, error: err instanceof Error ? err.message : String(err) },
        { status: 500 },
      );
    }
  }

  const pfOrder = event?.data?.order ?? event?.data?.shipment?.order ?? event?.data ?? {};
  const externalId: string | undefined = pfOrder?.external_id;
  const pfOrderId: string | number | undefined = pfOrder?.id;

  if (!externalId && !pfOrderId) {
    return NextResponse.json({ ok: true, note: 'No order ref in event; ignored' });
  }

  const admin = createAdminClient();

  // Look up our order
  const q = admin
    .from('orders')
    .select('id, token, order_number, status, customer_email, customer_name, cart_snapshot, tracking_number')
    .limit(1);
  const { data: matches } = externalId
    ? await q.eq('token', externalId)
    : await q.eq('printful_order_id', String(pfOrderId));

  const order = matches?.[0];
  if (!order) {
    return NextResponse.json({ ok: true, note: 'Order not found locally; ignored' });
  }

  const update: Record<string, unknown> = {};

  switch (type) {
    case 'package_shipped': {
      const tracking =
        event?.data?.shipment?.tracking_number ??
        event?.data?.tracking_number ??
        null;
      const trackingUrl =
        event?.data?.shipment?.tracking_url ??
        event?.data?.tracking_url ??
        null;
      const carrier =
        event?.data?.shipment?.carrier ??
        event?.data?.carrier ??
        null;
      update.tracking_number = tracking;
      update.printful_status = 'fulfilled';
      update.status = 'fulfilled';
      update.fulfilled_at = new Date().toISOString();

      // Email the customer that their print has shipped. Don't block
      // the webhook on Resend failures — the order page still shows
      // tracking and the customer can self-serve from /order/<token>.
      if (
        order.customer_email &&
        order.customer_email !== 'pending@placeholder.local' &&
        tracking
      ) {
        const cart = (order.cart_snapshot ?? []) as Array<{ name: string; size?: string; format?: string }>;
        const itemSummary = cart
          .map((it) => (it.format === 'physical' ? `${it.name} (${it.size})` : it.name))
          .join(', ')
          .slice(0, 200);
        try {
          await sendShippingEmail({
            to: order.customer_email,
            customerName: order.customer_name ?? 'there',
            orderNumber: (order.order_number ?? order.token) as string | number,
            orderToken: order.token as string,
            trackingNumber: tracking,
            trackingUrl,
            carrier,
            itemSummary: itemSummary || 'Your order',
          });
        } catch (err) {
          console.error('[printful webhook] sendShippingEmail failed', err);
        }
      }
      break;
    }
    case 'package_returned':
      update.printful_status = 'returned';
      break;
    case 'order_failed':
      update.printful_status = 'failed';
      update.printful_error = event?.data?.reason ?? 'Printful marked order failed';
      break;
    case 'order_canceled':
      update.printful_status = 'canceled';
      update.status = 'cancelled';
      break;
    case 'order_put_hold':
      update.printful_status = 'onhold';
      break;
    case 'order_remove_hold':
      update.printful_status = 'inprocess';
      break;
    case 'order_refunded':
      update.printful_status = 'refunded';
      break;
    default:
      // Unknown event — acknowledge without changing state
      return NextResponse.json({ ok: true, ignored: type });
  }

  if (Object.keys(update).length > 0) {
    await admin.from('orders').update(update).eq('id', order.id);
  }

  return NextResponse.json({ ok: true, applied: type, orderId: order.id });
}
