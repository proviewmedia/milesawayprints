import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';
import { CartItem } from '@/contexts/CartContext';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CreatePIBody {
  items: CartItem[];
  defaultCountry?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreatePIBody;
    const items = body.items ?? [];
    if (items.length === 0) {
      return NextResponse.json({ error: 'Empty cart' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Same digital-availability guard as /api/checkout
    const digitalItems = items.filter((it) => it.format === 'digital');
    if (digitalItems.length > 0) {
      const customDigital = digitalItems.find((it) => it.isCustom);
      if (customDigital) {
        return NextResponse.json(
          { error: 'Digital format is not available for custom prints yet. Please choose Physical for custom designs.' },
          { status: 400 },
        );
      }
      const slugs = Array.from(new Set(digitalItems.map((it) => it.slug)));
      const { data: digitalDesigns } = await admin
        .from('gallery_items')
        .select('slug, name, digital_file_path')
        .in('slug', slugs);
      const missing = digitalItems.filter((it) => {
        const row = digitalDesigns?.find((d) => d.slug === it.slug);
        return !row?.digital_file_path;
      });
      if (missing.length > 0) {
        return NextResponse.json(
          { error: `Digital download isn't ready for ${missing.map((m) => m.name).join(', ')}. Please choose Physical, or pick a different print.` },
          { status: 400 },
        );
      }
    }

    const stripe = getStripe();

    const subtotalCents = items.reduce((acc, it) => acc + it.priceCents, 0);
    const first = items[0];

    // Create the order row up-front so the webhook can find it via PI metadata
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
        price_cents: subtotalCents, // shipping added on update
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

    const pi = await stripe.paymentIntents.create({
      amount: subtotalCents, // shipping/tax added when address is known
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      shipping: body.defaultCountry
        ? {
            name: 'Pending',
            address: {
              country: body.defaultCountry,
              line1: '',
              city: '',
              postal_code: '',
            },
          }
        : undefined,
      metadata: {
        order_id: order.id,
        order_token: order.token,
        cart_snapshot: JSON.stringify(cartSnapshot).slice(0, 500),
      },
    });

    await admin
      .from('orders')
      .update({
        stripe_payment_intent_id: pi.id,
        cart_snapshot: cartSnapshot,
      })
      .eq('id', order.id);

    return NextResponse.json({
      clientSecret: pi.client_secret,
      paymentIntentId: pi.id,
      orderToken: order.token,
      subtotalCents,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Could not start payment', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
