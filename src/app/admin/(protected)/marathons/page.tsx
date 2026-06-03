import { createAdminClient } from '@/lib/supabase';
import OrdersTable from '../orders/OrdersTable';
import { type AdminOrder, needsMarathonAction, hasMarathonItem } from '../orders/types';

export const dynamic = 'force-dynamic';

async function getMarathonOrders(): Promise<AdminOrder[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('orders')
    .select(
      'id, order_number, token, status, customer_name, customer_email, print_type_slug, format, size, price_cents, printful_order_id, printful_error, tracking_number, cart_snapshot, shipping_name, shipping_address_line1, shipping_address_line2, shipping_city, shipping_state, shipping_zip, shipping_country, stripe_payment_intent_id, stripe_checkout_session_id, created_at, updated_at, fulfilled_at',
    )
    .order('created_at', { ascending: true })
    .limit(500);
  const all = (data ?? []) as AdminOrder[];
  return all.filter(hasMarathonItem);
}

export default async function AdminMarathonsPage() {
  const orders = await getMarathonOrders();
  const needsAction = orders.filter(needsMarathonAction);
  const done = orders.filter((o) => !needsMarathonAction(o));

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-10">
      <div>
        <h1 className="text-2xl font-medium tracking-tight text-ink">Marathon orders</h1>
        <p className="text-sm text-mid mt-1">
          Personalized prints — manually fulfilled. Newest action first.
        </p>
      </div>

      <section>
        <div className="flex items-baseline gap-3 mb-3">
          <h2 className="text-sm font-medium text-ink">Needs action</h2>
          <span className="text-xs text-mid">{needsAction.length}</span>
        </div>
        <OrdersTable
          orders={needsAction}
          hideFilters
          emptyLabel="All caught up — no marathon orders waiting on you."
        />
      </section>

      <section>
        <div className="flex items-baseline gap-3 mb-3">
          <h2 className="text-sm font-medium text-ink">Submitted / shipped</h2>
          <span className="text-xs text-mid">{done.length}</span>
        </div>
        <OrdersTable
          orders={done}
          hideFilters
          emptyLabel="No fulfilled marathon orders yet."
        />
      </section>
    </div>
  );
}
