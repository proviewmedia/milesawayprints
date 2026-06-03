import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Trophy } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase';
import type { MarathonCustomization } from '@/data/marathons';
import type { AdminOrder, CartSnapshotItem } from '../types';
import { STATUS_STYLE, hasMarathonItem } from '../types';
import OrderEditPanel from './OrderEditPanel';
import CopyInline from './CopyInline';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { token: string };
}

async function getOrder(token: string): Promise<AdminOrder | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('orders')
    .select(
      'id, order_number, token, status, customer_name, customer_email, print_type_slug, format, size, price_cents, printful_order_id, printful_error, tracking_number, cart_snapshot, shipping_name, shipping_address_line1, shipping_address_line2, shipping_city, shipping_state, shipping_zip, shipping_country, stripe_payment_intent_id, stripe_checkout_session_id, created_at, updated_at, fulfilled_at',
    )
    .eq('token', token)
    .single();
  return (data as AdminOrder | null) ?? null;
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const order = await getOrder(params.token);
  if (!order) notFound();

  const cart = order.cart_snapshot ?? [];
  const marathonItems = cart.filter(
    (it): it is CartSnapshotItem & { customization: MarathonCustomization } =>
      it.type === 'marathon' &&
      !!it.customization &&
      typeof it.customization === 'object' &&
      'marathon_slug' in it.customization,
  );
  const isMarathon = hasMarathonItem(order);

  const stripeUrl = order.stripe_payment_intent_id
    ? `https://dashboard.stripe.com/payments/${order.stripe_payment_intent_id}`
    : order.stripe_checkout_session_id
    ? `https://dashboard.stripe.com/payments?status%5B%5D=successful`
    : null;
  const printfulUrl = order.printful_order_id
    ? `https://www.printful.com/dashboard/default/orders/${order.printful_order_id}`
    : null;

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm text-mid hover:text-ink mb-6"
      >
        <ArrowLeft size={14} /> Back to orders
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-medium tracking-tight text-ink">
              Order #{order.order_number}
            </h1>
            {isMarathon && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-warm bg-warm-light px-2 py-0.5 rounded-full uppercase tracking-wider">
                <Trophy size={10} /> Marathon
              </span>
            )}
            <span
              className={`inline-flex items-center text-[10px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wider ${
                STATUS_STYLE[order.status] ?? 'bg-soft text-mid'
              }`}
            >
              {order.status.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-sm text-mid mt-1">
            Placed{' '}
            {new Date(order.created_at).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {stripeUrl && (
            <a
              href={stripeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-mid hover:text-ink"
            >
              Stripe <ExternalLink size={12} />
            </a>
          )}
          {printfulUrl && (
            <a
              href={printfulUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-mid hover:text-ink"
            >
              Printful <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8">
        {/* Left: items + marathon personalization */}
        <div className="space-y-6">
          <Section title="Items">
            <div className="divide-y divide-border">
              {cart.length === 0 ? (
                <p className="text-sm text-mid py-4">
                  No cart snapshot — legacy order before snapshots were captured.
                </p>
              ) : (
                cart.map((it, i) => {
                  const qty = it.quantity ?? 1;
                  return (
                    <div key={i} className="py-4 flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-ink">
                          {it.name}
                          {qty > 1 && (
                            <span className="text-mid font-normal"> × {qty}</span>
                          )}
                        </div>
                        <div className="text-xs text-mid mt-0.5">
                          {it.format === 'digital' ? 'Digital download' : `Physical · ${it.size}`}
                          {it.type === 'marathon' && ' · Marathon (manual)'}
                          {it.isGift && ' · Gift'}
                        </div>
                        {it.giftMessage && (
                          <div className="text-xs text-mid italic mt-1 max-w-md">
                            “{it.giftMessage}”
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-ink whitespace-nowrap">
                        ${((it.priceCents * qty) / 100).toFixed(2)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Section>

          {marathonItems.length > 0 && (
            <Section title="Marathon personalization" emphasis>
              <div className="space-y-6">
                {marathonItems.map((it, i) => {
                  const c = it.customization;
                  const params = new URLSearchParams({
                    bib: c.bib ?? '',
                    firstName: c.first_name ?? '',
                    lastName: c.last_name ?? '',
                    raceDate: c.race_date ?? '',
                    finishTime: c.finish_time ?? '',
                    variant: c.variant ?? 'full',
                    size: it.size ?? '',
                  });
                  return (
                    <div key={i} className="bg-soft rounded-xl p-5 space-y-4">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="text-[11px] font-medium tracking-widest uppercase text-mid">
                            {c.marathon_slug?.replace(/-/g, ' ')} ·{' '}
                            {c.variant === 'half' ? 'Half Marathon' : 'Marathon'}
                          </div>
                          <div className="text-base text-ink mt-0.5">
                            {c.first_name} {c.last_name}
                          </div>
                        </div>
                        <a
                          href={`/marathons/${c.marathon_slug}?${params.toString()}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 bg-ink text-paper text-xs font-medium px-4 py-2 rounded-full hover:bg-black transition-colors"
                        >
                          Build print file <ExternalLink size={12} />
                        </a>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3 text-sm">
                        <Field label="Bib" value={c.bib ? `#${c.bib}` : '—'} />
                        <Field label="Race date" value={formatDate(c.race_date)} />
                        <Field label="Finish time" value={c.finish_time ?? '—'} />
                        <Field label="Size" value={it.size ?? '—'} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}
        </div>

        {/* Right: customer + shipping + edit panel */}
        <aside className="space-y-6">
          <Section title="Customer">
            <div className="space-y-1 text-sm">
              <div className="text-ink">{order.customer_name ?? '—'}</div>
              {order.customer_email && (
                <a
                  href={`mailto:${order.customer_email}`}
                  className="text-mid hover:text-ink underline underline-offset-2 break-all"
                >
                  {order.customer_email}
                </a>
              )}
            </div>
          </Section>

          {(order.shipping_address_line1 || order.shipping_city) && (
            <Section title="Shipping address" copyableContent={formatAddress(order)}>
              <address className="not-italic text-sm text-ink leading-relaxed">
                {order.shipping_name && (
                  <>
                    {order.shipping_name}
                    <br />
                  </>
                )}
                {order.shipping_address_line1}
                <br />
                {order.shipping_address_line2 && (
                  <>
                    {order.shipping_address_line2}
                    <br />
                  </>
                )}
                {order.shipping_city}
                {order.shipping_state && `, ${order.shipping_state}`} {order.shipping_zip}
                <br />
                {order.shipping_country}
              </address>
            </Section>
          )}

          <OrderEditPanel
            orderId={order.id}
            status={order.status}
            trackingNumber={order.tracking_number}
            printfulOrderId={order.printful_order_id}
            printfulError={order.printful_error}
            isMarathon={isMarathon}
            hasPhysicalNonMarathon={cart.some((it) => it.format === 'physical' && it.type !== 'marathon')}
          />
        </aside>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  emphasis,
  copyableContent,
}: {
  title: string;
  children: React.ReactNode;
  emphasis?: boolean;
  copyableContent?: string;
}) {
  return (
    <section
      className={`bg-paper border rounded-2xl p-5 ${
        emphasis ? 'border-warm/40' : 'border-border'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[11px] font-medium tracking-widest uppercase text-mid">
          {title}
        </h2>
        {copyableContent && <CopyButton text={copyableContent} />}
      </div>
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] tracking-widest uppercase text-mid font-medium">
        {label}
      </div>
      <div className="text-ink mt-0.5">{value}</div>
    </div>
  );
}

function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatAddress(o: AdminOrder): string {
  return [
    o.shipping_name,
    o.shipping_address_line1,
    o.shipping_address_line2,
    [o.shipping_city, o.shipping_state, o.shipping_zip].filter(Boolean).join(', '),
    o.shipping_country,
  ]
    .filter(Boolean)
    .join('\n');
}

function CopyButton({ text }: { text: string }) {
  return <CopyInline text={text} />;
}
