import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { getShippingRates } from '@/lib/printful';
import { CartItem } from '@/contexts/CartContext';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ShippingRequest {
  items: CartItem[];
  country: string;     // ISO 2-letter
  state?: string;      // 2-letter for US/CA, optional otherwise
  zip?: string;
  city?: string;
}

export async function POST(req: Request) {
  let body: ShippingRequest;
  try {
    body = (await req.json()) as ShippingRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const items = (body.items ?? []).filter((it) => it.format === 'physical');
  if (items.length === 0) {
    // Digital-only carts have no shipping
    return NextResponse.json({ rateCents: 0, name: 'No shipping (digital)' });
  }
  if (!body.country || body.country.length !== 2) {
    return NextResponse.json({ error: 'Country required (ISO 2-letter)' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Resolve sync_variant_id for each cart item
  const slugs = Array.from(new Set(items.map((it) => it.slug)));
  const { data: designs } = await admin
    .from('gallery_items')
    .select('slug, printful_variants')
    .in('slug', slugs);

  const variantMap = new Map<string, Record<string, number>>(
    (designs ?? []).map((d) => [d.slug as string, (d.printful_variants ?? {}) as Record<string, number>]),
  );

  const printfulItems: Array<{ sync_variant_id: number; quantity: number }> = [];
  for (const it of items) {
    const variants = variantMap.get(it.slug);
    const syncVariantId = variants?.[it.size];
    if (!syncVariantId) {
      return NextResponse.json(
        { error: `No Printful variant for ${it.name} ${it.size}` },
        { status: 400 },
      );
    }
    printfulItems.push({ sync_variant_id: syncVariantId, quantity: 1 });
  }

  try {
    const rates = await getShippingRates({
      recipient: {
        country_code: body.country.toUpperCase(),
        state_code: body.state?.toUpperCase(),
        zip: body.zip,
        city: body.city,
        address1: undefined,
      },
      items: printfulItems,
    });
    if (rates.length === 0) {
      return NextResponse.json(
        { error: "We can't ship to that destination yet — try a different country or contact us." },
        { status: 400 },
      );
    }
    // Cheapest first
    const cheapest = rates
      .map((r) => ({ ...r, rateNum: parseFloat(r.rate) }))
      .sort((a, b) => a.rateNum - b.rateNum)[0];

    return NextResponse.json({
      rateCents: Math.round(cheapest.rateNum * 100),
      name: cheapest.name,
      currency: cheapest.currency,
      minDeliveryDays: cheapest.minDeliveryDays,
      maxDeliveryDays: cheapest.maxDeliveryDays,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not fetch shipping rates' },
      { status: 502 },
    );
  }
}
