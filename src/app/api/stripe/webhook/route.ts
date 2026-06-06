import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase';
import { createOrder as createPrintfulOrder, PrintfulOrderItem } from '@/lib/printful';
import {
  sendOrderConfirmationEmail,
  type OrderConfirmationItem,
} from '@/lib/email';
import { notifyMarathonOrder, isMarathonCartItem } from '@/lib/marathon-fulfill';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DIGITAL_DOWNLOAD_EXPIRES_DAYS = 30;
const DIGITAL_DOWNLOAD_MAX = 5;

interface CartSnapshotItem {
  slug: string;
  type: string;
  format: 'digital' | 'physical';
  size: string;
  priceCents: number;
  /** Quantity per cart row. Legacy orders pre-dating this field default
   *  to 1. */
  quantity?: number;
  name: string;
  location: string;
  isGift?: boolean;
  giftMessage?: string | null;
  customization?: Record<string, string> | null;
}

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
  }

  const raw = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    return NextResponse.json(
      { error: 'Signature verification failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const { data: order } = await admin
        .from('orders')
        .select('id, token, cart_snapshot, status, order_number')
        .eq('stripe_checkout_session_id', session.id)
        .single();

      if (!order) {
        return NextResponse.json({ error: 'Order not found for session' }, { status: 404 });
      }

      if (order.status === 'paid' || order.status === 'in_production' || order.status === 'shipped') {
        return NextResponse.json({ received: true, note: 'already processed' });
      }

      // Atomically claim the order before doing any fulfillment work.
      // Stripe can deliver the same event more than once (retries / at-least-
      // once delivery); the in-memory guard above is read-then-write and races.
      // This compare-and-swap transitions only the exact status we just read,
      // so concurrent deliveries can't both reach the Printful call below —
      // exactly one wins the row, the rest short-circuit here.
      const { data: claimed } = await admin
        .from('orders')
        .update({ status: 'paid' })
        .eq('id', order.id)
        .eq('status', order.status)
        .select('id');
      if (!claimed || claimed.length === 0) {
        return NextResponse.json({ received: true, note: 'already claimed' });
      }

      const customerEmail = session.customer_details?.email ?? session.customer_email ?? 'unknown@placeholder.local';
      const customerName = session.customer_details?.name ?? 'Customer';
      const shipping = session.shipping_details ?? null;
      const paymentIntentId = typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id ?? null;

      const update: Record<string, unknown> = {
        customer_email: customerEmail,
        customer_name: customerName,
        stripe_payment_intent_id: paymentIntentId,
        status: 'paid',
      };

      // Reconcile the stored total with what Stripe actually charged. The row
      // was created at session-create time with the undiscounted total; if a
      // promo code applied, amount_total is lower. Without this the order page
      // and purchase analytics over-report (and disagree with the email, which
      // already uses amount_total).
      if (typeof session.amount_total === 'number') {
        update.price_cents = session.amount_total;
      }

      // If a Supabase auth user already exists for this email, link the order
      // to it now so /account immediately shows it. (If the customer creates
      // their account later via magic link, the link_orders_to_profile trigger
      // will back-fill instead.)
      const { data: existingProfile } = await admin
        .from('profiles')
        .select('id')
        .eq('email', customerEmail)
        .maybeSingle();
      if (existingProfile?.id) {
        update.user_id = existingProfile.id;
      }

      if (shipping?.address) {
        update.shipping_name = shipping.name ?? customerName;
        update.shipping_address_line1 = shipping.address.line1 ?? null;
        update.shipping_address_line2 = shipping.address.line2 ?? null;
        update.shipping_city = shipping.address.city ?? null;
        update.shipping_state = shipping.address.state ?? null;
        update.shipping_zip = shipping.address.postal_code ?? null;
        update.shipping_country = shipping.address.country ?? 'US';
      }

      const cart = (order.cart_snapshot as CartSnapshotItem[] | null) ?? [];
      const physicalItems = cart.filter((it) => it.format === 'physical');
      const digitalItems = cart.filter((it) => it.format === 'digital');

      // Digital delivery — generate per-customer access token + expiry.
      // The download link is folded into the unified order-confirmation
      // email below so the customer gets a single email for the order.
      let digitalToken: string | null = null;
      let digitalExpiresAt: Date | null = null;
      if (digitalItems.length > 0) {
        digitalToken = randomBytes(32).toString('hex');
        digitalExpiresAt = new Date(
          Date.now() + DIGITAL_DOWNLOAD_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
        );
        update.digital_download_token = digitalToken;
        update.digital_download_expires_at = digitalExpiresAt.toISOString();
        update.digital_download_max = DIGITAL_DOWNLOAD_MAX;
        update.digital_download_count = 0;
        // 'approved' is the existing enum value the order page uses to
        // reveal the download button.
        update.status = 'approved';
      }

      let printfulOrderId: string | null = null;

      if (physicalItems.length > 0 && shipping?.address) {
        const galleryPhysical = physicalItems.filter((it) => !isMarathonCartItem(it));
        const slugs = Array.from(new Set(galleryPhysical.map((it) => it.slug)));
        const { data: designs } = slugs.length
          ? await admin
              .from('gallery_items')
              .select('slug, printful_variants')
              .in('slug', slugs)
          : { data: [] as { slug: string; printful_variants: Record<string, number> | null }[] };

        const variantMap = new Map<string, Record<string, number>>(
          (designs ?? []).map((d) => [d.slug as string, (d.printful_variants ?? {}) as Record<string, number>]),
        );

        const printfulItems: PrintfulOrderItem[] = [];
        for (const it of galleryPhysical) {
          const variants = variantMap.get(it.slug);
          const syncVariantId = variants?.[it.size];
          if (!syncVariantId) continue;
          printfulItems.push({
            sync_variant_id: syncVariantId,
            quantity: Math.max(1, it.quantity ?? 1),
            name: `${it.name} ${it.size}`,
          });
        }

        // Marathon items are NOT submitted to Printful automatically.
        // Send the admin a notification email with all personalization
        // details — admin builds the print file by hand and submits the
        // job to Printful manually.
        const marathonNotify = await notifyMarathonOrder({
          admin,
          items: physicalItems,
          orderNumber: order.order_number ?? order.token,
          orderToken: order.token as string,
          customer: { name: customerName, email: customerEmail },
          shipping: shipping?.address
            ? {
                name: shipping.name ?? customerName,
                line1: shipping.address.line1 ?? '',
                line2: shipping.address.line2 ?? null,
                city: shipping.address.city ?? '',
                state: shipping.address.state ?? null,
                postalCode: shipping.address.postal_code ?? '',
                country: shipping.address.country ?? 'US',
              }
            : undefined,
        });
        if (marathonNotify.errors.length > 0) {
          update.printful_error = marathonNotify.errors.join('; ');
        }

        if (printfulItems.length > 0) {
          // Forward the gift note (if any item in the cart was tagged
          // as a gift with a message). Printful prints this on a slip
          // and hides retail prices on the packing slip.
          const giftItem = physicalItems.find((it) => it.isGift && it.giftMessage);
          const gift = giftItem?.giftMessage
            ? { subject: 'A note for you', message: giftItem.giftMessage }
            : undefined;

          const printfulRes = await createPrintfulOrder({
            // NB: do NOT send external_id = order.token here. Printful caps
            // external_id at 32 chars and our token is 64 hex, so it rejects
            // the whole order ("Invalid External ID specified") and nothing
            // gets fulfilled. We store printful_order_id below instead, and
            // the Printful shipping webhook matches on that.
            recipient: {
              name: shipping.name ?? customerName,
              address1: shipping.address.line1 ?? '',
              address2: shipping.address.line2 ?? null,
              city: shipping.address.city ?? '',
              state_code: shipping.address.state ?? '',
              country_code: shipping.address.country ?? 'US',
              zip: shipping.address.postal_code ?? '',
              email: customerEmail,
            },
            items: printfulItems,
            confirm: true,
            ...(gift && { gift }),
          });

          if (printfulRes.result?.id) {
            printfulOrderId = String(printfulRes.result.id);
            update.printful_order_id = printfulOrderId;
            update.status = 'in_production';
          } else {
            update.printful_error = printfulRes.error?.message ?? 'unknown printful error';
          }
        }
      }

      await admin.from('orders').update(update).eq('id', order.id);

      // Order confirmation email — single transactional send for every
      // paid order. For digital orders the download link is included
      // inline so the customer doesn't get two emails.
      try {
        const origin = new URL(req.url).origin;
        const subtotalCents = cart.reduce(
          (sum, it) => sum + (it.priceCents || 0) * (it.quantity ?? 1),
          0,
        );
        const shippingCents = session.shipping_cost?.amount_subtotal ?? 0;
        const totalCents = session.amount_total ?? subtotalCents + shippingCents;

        const emailItems: OrderConfirmationItem[] = cart.map((it) => ({
          name: it.name + ((it.quantity ?? 1) > 1 ? ` × ${it.quantity}` : ''),
          format: it.format,
          size: it.format === 'physical' ? it.size : undefined,
          priceCents: it.priceCents * (it.quantity ?? 1),
          isGift: it.isGift,
        }));

        await sendOrderConfirmationEmail({
          to: customerEmail,
          customerName: customerName || 'there',
          orderNumber: (order.order_number ?? order.token) as string | number,
          orderToken: order.token as string,
          items: emailItems,
          subtotalCents,
          shippingCents,
          totalCents,
          shipping: shipping?.address
            ? {
                name: shipping.name ?? customerName,
                line1: shipping.address.line1 ?? '',
                line2: shipping.address.line2,
                city: shipping.address.city ?? '',
                state: shipping.address.state,
                postalCode: shipping.address.postal_code ?? '',
                country: shipping.address.country ?? 'US',
              }
            : undefined,
          digital:
            digitalToken && digitalExpiresAt
              ? {
                  downloadUrl: `${origin}/download/${digitalToken}`,
                  expiresAt: digitalExpiresAt,
                  maxDownloads: DIGITAL_DOWNLOAD_MAX,
                }
              : undefined,
        });
      } catch (err) {
        // Don't fail the webhook — the customer still has /order/<token>
        // and Stripe's auto-receipt as a backstop.
        console.error('[stripe webhook] sendOrderConfirmationEmail failed', err);
      }
    } else if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;
      await admin
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('stripe_checkout_session_id', session.id);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json(
      { error: 'Webhook handler failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
