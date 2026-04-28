import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';
import { CartItem } from '@/contexts/CartContext';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://milesawayprints.com';
const SHIPPING_FLAT_CENTS = 500;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items: CartItem[] = body.items ?? [];

    if (items.length === 0) {
      return NextResponse.json({ error: 'Empty cart' }, { status: 400 });
    }

    const stripe = getStripe();

    const hasPhysical = items.some((it) => it.format === 'physical');

    const line_items = items.map((it) => ({
      quantity: 1,
      price_data: {
        currency: 'usd',
        unit_amount: it.priceCents,
        product_data: {
          name: `${it.name} — ${it.format === 'digital' ? 'Digital' : it.size}`,
          description: it.location || undefined,
          metadata: {
            slug: it.slug,
            type: it.type,
            format: it.format,
            size: it.size,
            isGift: it.isGift ? '1' : '0',
          },
        },
      },
    }));

    const totalCents = items.reduce((acc, it) => acc + it.priceCents, 0);
    const first = items[0];

    const admin = createAdminClient();

    const { data: order, error: orderErr } = await admin
      .from('orders')
      .insert({
        customer_email: 'pending@placeholder.local',
        customer_name: 'Pending Checkout',
        print_type_slug: first.type,
        format: first.format,
        size: first.size,
        customization: first.customization ?? { name: first.name, location: first.location },
        is_gift: first.isGift ?? false,
        gift_message: first.giftMessage ?? null,
        price_cents: totalCents + (hasPhysical ? SHIPPING_FLAT_CENTS : 0),
        status: 'new',
      })
      .select('id, token')
      .single();

    if (orderErr || !order) {
      return NextResponse.json(
        { error: 'Failed to create order', detail: orderErr?.message },
        { status: 500 },
      );
    }

    const cartSnapshot = items.map((it) => ({
      slug: it.slug,
      type: it.type,
      format: it.format,
      size: it.size,
      priceCents: it.priceCents,
      name: it.name,
      location: it.location,
      isGift: it.isGift ?? false,
      giftMessage: it.giftMessage ?? null,
      customization: it.customization ?? null,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: `${APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/checkout?canceled=1`,
      ...(hasPhysical
        ? {
            shipping_address_collection: { allowed_countries: ['US'] },
            shipping_options: [
              {
                shipping_rate_data: {
                  type: 'fixed_amount',
                  fixed_amount: { amount: SHIPPING_FLAT_CENTS, currency: 'usd' },
                  display_name: 'Standard shipping',
                  delivery_estimate: {
                    minimum: { unit: 'business_day', value: 5 },
                    maximum: { unit: 'business_day', value: 10 },
                  },
                },
              },
            ],
          }
        : {}),
      phone_number_collection: { enabled: false },
      metadata: {
        order_id: order.id,
        order_token: order.token,
      },
      payment_intent_data: {
        metadata: {
          order_id: order.id,
          order_token: order.token,
        },
      },
    });

    await admin
      .from('orders')
      .update({ stripe_checkout_session_id: session.id, cart_snapshot: cartSnapshot })
      .eq('id', order.id);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json(
      { error: 'Checkout failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
