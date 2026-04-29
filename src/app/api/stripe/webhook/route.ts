import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase';
import { createOrder as createPrintfulOrder, PrintfulOrderItem } from '@/lib/printful';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CartSnapshotItem {
  slug: string;
  type: string;
  format: 'digital' | 'physical';
  size: string;
  priceCents: number;
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
        .select('id, token, cart_snapshot, status')
        .eq('stripe_checkout_session_id', session.id)
        .single();

      if (!order) {
        return NextResponse.json({ error: 'Order not found for session' }, { status: 404 });
      }

      if (order.status === 'paid' || order.status === 'in_production' || order.status === 'shipped') {
        return NextResponse.json({ received: true, note: 'already processed' });
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

      let printfulOrderId: string | null = null;

      if (physicalItems.length > 0 && shipping?.address) {
        const slugs = Array.from(new Set(physicalItems.map((it) => it.slug)));
        const { data: designs } = await admin
          .from('gallery_items')
          .select('slug, printful_variants')
          .in('slug', slugs);

        const variantMap = new Map<string, Record<string, number>>(
          (designs ?? []).map((d) => [d.slug as string, (d.printful_variants ?? {}) as Record<string, number>]),
        );

        const printfulItems: PrintfulOrderItem[] = [];
        for (const it of physicalItems) {
          const variants = variantMap.get(it.slug);
          const syncVariantId = variants?.[it.size];
          if (!syncVariantId) continue;
          printfulItems.push({
            sync_variant_id: syncVariantId,
            quantity: 1,
            name: `${it.name} ${it.size}`,
          });
        }

        if (printfulItems.length > 0) {
          const printfulRes = await createPrintfulOrder({
            external_id: order.token,
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
