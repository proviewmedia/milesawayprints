import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { CartItem } from '@/contexts/CartContext';

/**
 * POST /api/checkout
 * Accepts a cart payload and (eventually) creates a Stripe Checkout session.
 *
 * TODO for final build (waiting on Stripe keys):
 *  - Initialize Stripe SDK with process.env.STRIPE_SECRET_KEY
 *  - Map cart items to line_items (one per cart entry)
 *  - Create checkout session with success_url + cancel_url
 *  - Persist order row in Supabase with status='new' and session ID
 *  - Return session.url for client redirect
 *
 * For now: persist a pending order and return a placeholder success URL
 * so the client flow is testable end-to-end without Stripe.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items: CartItem[] = body.items ?? [];
    const customer = body.customer ?? {};

    if (items.length === 0) {
      return NextResponse.json({ error: 'Empty cart' }, { status: 400 });
    }

    const totalCents = items.reduce((acc, it) => acc + it.priceCents, 0);

    // Single consolidated order for v1 (one line per cart item is richer — defer)
    const admin = createAdminClient();

    const first = items[0];
    const { data: order, error } = await admin
      .from('orders')
      .insert({
        customer_email: customer.email ?? 'pending@placeholder.local',
        customer_name: customer.name ?? 'Pending Checkout',
        print_type_slug: first.type,
        format: first.format,
        size: first.size,
        customization: first.customization ?? { name: first.name, location: first.location },
        is_gift: first.isGift ?? false,
        gift_message: first.giftMessage ?? null,
        price_cents: totalCents,
        status: 'new',
      })
      .select('token, id')
      .single();

    if (error || !order) {
      return NextResponse.json(
        { error: 'Failed to create order', detail: error?.message },
        { status: 500 },
      );
    }

    // Placeholder success URL — will be replaced with Stripe session URL
    const url = `/checkout/success?token=${order.token}`;
    return NextResponse.json({ url, orderToken: order.token });
  } catch (err) {
    return NextResponse.json(
      { error: 'Checkout failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
