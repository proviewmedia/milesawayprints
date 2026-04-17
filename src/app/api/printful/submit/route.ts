import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { createOrder, PrintfulOrderRequest } from '@/lib/printful';

/**
 * POST /api/printful/submit
 * Body: { orderId: string; confirm?: boolean }
 *
 * Looks up the order in Supabase, maps our gallery item + size to the
 * Printful variant id, and creates a Printful order. On success, stores
 * the Printful order ID + status on our order row.
 *
 * By default creates a DRAFT (confirm=false) so you can review in
 * Printful dashboard before fulfillment. Pass `confirm:true` to auto-submit.
 */
export async function POST(req: Request) {
  try {
    const { orderId, confirm = false } = await req.json();
    if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

    const admin = createAdminClient();

    const { data: order, error: orderErr } = await admin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.format !== 'physical') {
      return NextResponse.json(
        { error: 'Only physical orders can be submitted to Printful' },
        { status: 400 },
      );
    }

    if (order.printful_order_id) {
      return NextResponse.json(
        { error: 'Order already submitted to Printful', printful_order_id: order.printful_order_id },
        { status: 409 },
      );
    }

    // Find gallery item by customization.name/location if we have it, else fail.
    // For custom orders where there's no gallery item, admin must handle manually.
    const designName = order.customization?.name;
    const { data: gi } = await admin
      .from('gallery_items')
      .select('id, name, slug, printful_product_id, printful_variants, image_url')
      .eq('print_type_slug', order.print_type_slug)
      .ilike('name', designName ?? '')
      .maybeSingle();

    if (!gi || !gi.printful_variants) {
      return NextResponse.json(
        {
          error:
            'No matching gallery item or Printful variants configured. Set printful_product_id and printful_variants on the gallery_items row first.',
        },
        { status: 400 },
      );
    }

    const variantId = (gi.printful_variants as Record<string, number | string>)[order.size];
    if (!variantId) {
      return NextResponse.json(
        { error: `No Printful variant configured for size "${order.size}" on design "${gi.name}"` },
        { status: 400 },
      );
    }

    if (!order.shipping_address_line1 || !order.shipping_city) {
      return NextResponse.json(
        { error: 'Order missing shipping address. Collect shipping info before submitting.' },
        { status: 400 },
      );
    }

    const payload: PrintfulOrderRequest = {
      external_id: order.token,
      recipient: {
        name: order.shipping_name ?? order.customer_name,
        address1: order.shipping_address_line1,
        address2: order.shipping_address_line2 ?? null,
        city: order.shipping_city,
        state_code: order.shipping_state ?? '',
        country_code: order.shipping_country ?? 'US',
        zip: order.shipping_zip ?? '',
        email: order.customer_email,
      },
      items: [
        {
          sync_variant_id: Number(variantId),
          quantity: 1,
          name: `${gi.name} — ${order.size}`,
          ...(gi.image_url ? { files: [{ url: gi.image_url }] } : {}),
        },
      ],
      confirm,
      retail_costs: {
        currency: 'USD',
        subtotal: (order.price_cents / 100).toFixed(2),
        total: (order.price_cents / 100).toFixed(2),
      },
    };

    const pf = await createOrder(payload);

    if (pf.code && pf.code >= 400) {
      await admin
        .from('orders')
        .update({
          printful_error: pf.error?.message ?? 'Unknown Printful error',
          printful_submitted_at: new Date().toISOString(),
        })
        .eq('id', order.id);
      return NextResponse.json({ error: pf.error?.message ?? 'Printful rejected the order' }, { status: 502 });
    }

    await admin
      .from('orders')
      .update({
        printful_order_id: String(pf.result?.id ?? ''),
        printful_status: pf.result?.status ?? 'draft',
        printful_submitted_at: new Date().toISOString(),
        printful_error: null,
        status: 'in_progress',
      })
      .eq('id', order.id);

    return NextResponse.json({
      ok: true,
      printful: pf.result,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
