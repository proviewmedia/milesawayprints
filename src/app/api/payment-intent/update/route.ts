import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';
import { getShippingRates } from '@/lib/printful';
import { STRIPE_ALLOWED_COUNTRIES } from '@/data/countries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface UpdateBody {
  paymentIntentId: string;
  address: {
    country: string;
    state?: string;
    postalCode?: string;
    line1?: string;
    line2?: string;
    city?: string;
    name?: string;
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as UpdateBody;
    if (!body.paymentIntentId || !body.address?.country) {
      return NextResponse.json({ error: 'Missing paymentIntentId or address.country' }, { status: 400 });
    }
    if (!STRIPE_ALLOWED_COUNTRIES.includes(body.address.country.toUpperCase())) {
      return NextResponse.json({ error: 'We do not currently ship to that country.' }, { status: 400 });
    }

    const stripe = getStripe();
    const admin = createAdminClient();

    // Pull the order via the PaymentIntent's order_id metadata
    const pi = await stripe.paymentIntents.retrieve(body.paymentIntentId);
    const orderId = pi.metadata?.order_id;
    if (!orderId) {
      return NextResponse.json({ error: 'PaymentIntent has no order_id metadata' }, { status: 400 });
    }

    const { data: order } = await admin
      .from('orders')
      .select('id, cart_snapshot, price_cents')
      .eq('id', orderId)
      .single();
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const cart = (order.cart_snapshot as Array<{ slug: string; size: string; format: string; priceCents: number }> | null) ?? [];
    const subtotalCents = cart.reduce((acc, it) => acc + (it.priceCents || 0), 0);

    let shippingCents = 0;
    let shippingMethodName = 'Standard shipping';
    let shippingDeliveryEstimate: { min: number; max: number } | null = null;

    const physical = cart.filter((it) => it.format === 'physical');
    if (physical.length > 0) {
      const slugs = Array.from(new Set(physical.map((it) => it.slug)));
      const { data: designs } = await admin
        .from('gallery_items')
        .select('slug, printful_catalog_variants, printful_variants')
        .in('slug', slugs);
      const variantMap = new Map<string, Record<string, number>>(
        (designs ?? []).map((d) => [d.slug as string, (d.printful_catalog_variants ?? d.printful_variants ?? {}) as Record<string, number>]),
      );
      const items = physical
        .map((it) => ({ variant_id: variantMap.get(it.slug)?.[it.size], quantity: 1 }))
        .filter((i): i is { variant_id: number; quantity: number } => typeof i.variant_id === 'number');

      if (items.length > 0) {
        try {
          const rates = await getShippingRates({
            recipient: {
              country_code: body.address.country.toUpperCase(),
              state_code: body.address.state?.toUpperCase(),
              zip: body.address.postalCode,
              city: body.address.city,
            },
            items,
          });
          if (rates.length > 0) {
            const cheapest = rates
              .map((r) => ({ ...r, n: parseFloat(r.rate) }))
              .sort((a, b) => a.n - b.n)[0];
            shippingCents = Math.round(cheapest.n * 100);
            shippingMethodName = cheapest.name || shippingMethodName;
            if (cheapest.minDeliveryDays && cheapest.maxDeliveryDays) {
              shippingDeliveryEstimate = {
                min: cheapest.minDeliveryDays,
                max: cheapest.maxDeliveryDays,
              };
            }
          }
        } catch {
          // Fall through with shippingCents=0; UI surfaces the error
        }
      }
    }

    const newAmount = subtotalCents + shippingCents;

    const updated = await stripe.paymentIntents.update(body.paymentIntentId, {
      amount: newAmount,
      shipping: {
        name: body.address.name || 'Pending',
        address: {
          country: body.address.country.toUpperCase(),
          state: body.address.state ?? undefined,
          postal_code: body.address.postalCode ?? undefined,
          line1: body.address.line1 || '',
          line2: body.address.line2 ?? undefined,
          city: body.address.city ?? undefined,
        },
      },
    });

    await admin
      .from('orders')
      .update({
        price_cents: newAmount,
        shipping_country: body.address.country.toUpperCase(),
        shipping_state: body.address.state ?? null,
        shipping_zip: body.address.postalCode ?? null,
        shipping_city: body.address.city ?? null,
        shipping_name: body.address.name ?? null,
        shipping_address_line1: body.address.line1 ?? null,
        shipping_address_line2: body.address.line2 ?? null,
      })
      .eq('id', order.id);

    return NextResponse.json({
      amount: updated.amount,
      subtotalCents,
      shippingCents,
      shippingMethodName,
      shippingDeliveryEstimate,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Could not update payment', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
