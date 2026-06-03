import { createAdminClient } from '@/lib/supabase';
import OrdersTable from './OrdersTable';
import type { AdminOrder } from './types';

export const dynamic = 'force-dynamic';

async function getOrders(): Promise<AdminOrder[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('orders')
    .select(
      'id, order_number, token, status, customer_name, customer_email, print_type_slug, format, size, price_cents, printful_order_id, printful_error, tracking_number, cart_snapshot, shipping_name, shipping_address_line1, shipping_address_line2, shipping_city, shipping_state, shipping_zip, shipping_country, stripe_payment_intent_id, stripe_checkout_session_id, created_at, updated_at, fulfilled_at',
    )
    .order('created_at', { ascending: false })
    .limit(500);
  return (data ?? []) as AdminOrder[];
}

export default async function AdminOrdersPage() {
  const orders = await getOrders();
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-medium tracking-tight text-ink">Orders</h1>
        <p className="text-sm text-mid mt-1">All orders, newest first. Click a row for details.</p>
      </div>
      <OrdersTable orders={orders} />
    </div>
  );
}
