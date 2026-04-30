import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';
import { CartItem } from '@/contexts/CartContext';
import { getShippingRates } from '@/lib/printful';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://milesawayprints.com';
// Stripe accepts ISO 3166-1 alpha-2 codes. This list intentionally
// covers Printful's main delivery markets; expand as needed.
const STRIPE_ALLOWED_COUNTRIES = [
  'US','CA','GB','IE','FR','DE','IT','ES','PT','NL','BE','LU','AT','CH','SE','NO','DK','FI','IS','PL','CZ','SK','HU','RO','BG','GR','HR','SI','EE','LV','LT','MT','CY','AU','NZ','JP','SG','HK','MX','BR','AR','CL','CO','PE',
] as const;

interface CheckoutBody {
  items: CartItem[];
  shipping?: {
    country: string;
    state?: string;
    zip?: string;
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CheckoutBody;
    const items: CartItem[] = body.items ?? [];

    if (items.length === 0) {
      return NextResponse.json({ error: 'Empty cart' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Block digital purchase for items that don't have a digital file uploaded
    // yet, and for custom-design items (no source file exists at order time).
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
          {
            error: `Digital download isn't ready for ${missing.map((m) => m.name).join(', ')}. Please choose the Physical option, or pick a different print.`,
          },
          { status: 400 },
        );
      }
    }

    const stripe = getStripe();

    const hasPhysical = items.some((it) => it.format === 'physical');

    // Stripe Tax codes:
    //   txcd_99999999 — General Tangible Personal Property (physical goods)
    //   txcd_10000000 — Electronically Supplied Services (digital downloads)
    const line_items = items.map((it) => ({
      quantity: 1,
      price_data: {
        currency: 'usd',
        unit_amount: it.priceCents,
        // tax_behavior 'unspecified' uses the Stripe Dashboard default
        // (Automatic: exclusive in USD/CAD, inclusive in EU/UK currencies).
        tax_behavior: 'unspecified' as const,
        product_data: {
          name: `${it.name} — ${it.format === 'digital' ? 'Digital' : it.size}`,
          description: it.location || undefined,
          tax_code: it.format === 'digital' ? 'txcd_10000000' : 'txcd_99999999',
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

    // Compute live shipping cost from Printful for physical orders.
    // Falls back to a flat $5 USD if the rate call fails (so checkout
    // still proceeds — we'd rather charge a guess than block the sale).
    let shippingCents = 0;
    let shippingDeliveryEstimate: { min: number; max: number } | null = null;
    let shippingMethodName = 'Standard shipping';

    if (hasPhysical) {
      const physical = items.filter((it) => it.format === 'physical');
      const slugs = Array.from(new Set(physical.map((it) => it.slug)));
      const { data: designs } = await admin
        .from('gallery_items')
        .select('slug, printful_catalog_variants, printful_variants')
        .in('slug', slugs);
      // Use catalog variant_id for shipping rates (Printful requirement);
      // fall back to sync_variant_id if catalog hasn't been backfilled yet.
      const variantMap = new Map<string, Record<string, number>>(
        (designs ?? []).map((d) => [d.slug as string, (d.printful_catalog_variants ?? d.printful_variants ?? {}) as Record<string, number>]),
      );
      const printfulItems: Array<{ variant_id: number; quantity: number }> = [];
      for (const it of physical) {
        const v = variantMap.get(it.slug)?.[it.size];
        if (v) printfulItems.push({ variant_id: v, quantity: 1 });
      }

      if (printfulItems.length > 0 && body.shipping?.country) {
        try {
          const rates = await getShippingRates({
            recipient: {
              country_code: body.shipping.country.toUpperCase(),
              state_code: body.shipping.state?.toUpperCase(),
              zip: body.shipping.zip,
            },
            items: printfulItems,
          });
          if (rates.length > 0) {
            const cheapest = rates
              .map((r) => ({ ...r, n: parseFloat(r.rate) }))
              .sort((a, b) => a.n - b.n)[0];
            shippingCents = Math.round(cheapest.n * 100);
            shippingMethodName = cheapest.name || 'Standard shipping';
            if (cheapest.minDeliveryDays && cheapest.maxDeliveryDays) {
              shippingDeliveryEstimate = {
                min: cheapest.minDeliveryDays,
                max: cheapest.maxDeliveryDays,
              };
            }
          } else {
            shippingCents = 500;
          }
        } catch {
          shippingCents = 500;
        }
      } else {
        shippingCents = 500;
      }
    }

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
        price_cents: totalCents + shippingCents,
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
      ui_mode: 'embedded',
      mode: 'payment',
      line_items,
      // Stripe Tax: automatically calculates VAT (EU/UK), GST (CA/AU/NZ),
      // and US state sales tax based on the customer's billing/shipping
      // address. Make sure Tax is enabled in Stripe Dashboard → Tax with
      // Wyoming as head office and a physical-goods preset product
      // category, otherwise this will fail.
      automatic_tax: { enabled: true },
      return_url: `${APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      ...(hasPhysical
        ? {
            shipping_address_collection: {
              allowed_countries: STRIPE_ALLOWED_COUNTRIES as unknown as string[] as never,
            },
            shipping_options: [
              {
                shipping_rate_data: {
                  type: 'fixed_amount',
                  fixed_amount: { amount: shippingCents, currency: 'usd' },
                  display_name: shippingMethodName,
                  // Let Stripe decide based on dashboard default (Determine
                  // automatically) — shipping is taxable in most US states +
                  // EU when goods are taxable.
                  tax_behavior: 'unspecified' as const,
                  delivery_estimate: shippingDeliveryEstimate
                    ? {
                        minimum: { unit: 'business_day', value: shippingDeliveryEstimate.min },
                        maximum: { unit: 'business_day', value: shippingDeliveryEstimate.max },
                      }
                    : {
                        minimum: { unit: 'business_day', value: 5 },
                        maximum: { unit: 'business_day', value: 14 },
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

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (err) {
    return NextResponse.json(
      { error: 'Checkout failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
