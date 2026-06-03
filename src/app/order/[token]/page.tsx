import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Check,
  Truck,
  Download,
  ExternalLink,
  CircleDashed,
  PackageCheck,
} from 'lucide-react';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { trackingUrlFor } from '@/lib/tracking';

const PLACEHOLDER_EMAIL = 'pending@placeholder.local';

interface CartSnapshotItem {
  type?: string;
  customization?: { marathon_slug?: string } & Record<string, unknown>;
}

function cartHasMarathonItem(cart: unknown): boolean {
  if (!Array.isArray(cart)) return false;
  return (cart as CartSnapshotItem[]).some(
    (it) => it?.type === 'marathon' && !!it?.customization?.marathon_slug,
  );
}

export default async function OrderPage({ params }: { params: { token: string } }) {
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('token', params.token)
    .maybeSingle();

  if (!order) notFound();

  // Placeholder leak guard: if the order was created but Stripe never
  // confirmed payment, the customer_email is still the placeholder and the
  // status is still 'new'. Surface a recovery CTA instead of leaking the
  // pending row's internals.
  const isAwaitingPayment =
    order.status === 'new' && order.customer_email === PLACEHOLDER_EMAIL;

  if (isAwaitingPayment) {
    return (
      <>
        <NavbarShell />
        <section className="pt-32 pb-20 bg-soft min-h-[60vh]">
          <div className="max-w-md mx-auto px-6 text-center">
            <div className="bg-white rounded-2xl p-8 border border-border">
              <h1 className="text-2xl font-medium tracking-tight text-ink mb-3">
                Checkout didn't finish
              </h1>
              <p className="text-sm text-mid leading-relaxed mb-6">
                It looks like the payment for this order wasn't completed. Your
                cart is still saved — head back and try again.
              </p>
              <Link
                href="/checkout"
                className="inline-flex items-center justify-center bg-ink text-paper px-6 py-3 rounded-full text-sm font-medium hover:bg-black transition-colors"
              >
                Return to checkout
              </Link>
              <div className="mt-5 flex flex-col gap-2">
                <Link
                  href="/shop"
                  className="text-xs text-mid hover:text-ink underline underline-offset-2"
                >
                  or keep browsing the shop
                </Link>
                <Link
                  href="/contact"
                  className="text-xs text-mid hover:text-ink underline underline-offset-2"
                >
                  or contact us if you ran into an issue
                </Link>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  const serverSupabase = createSupabaseServerClient();
  const {
    data: { user: viewer },
  } = await serverSupabase.auth.getUser();

  const showAccountCTA =
    !viewer &&
    !order.user_id &&
    order.customer_email &&
    order.customer_email !== PLACEHOLDER_EMAIL;

  const isDigital = order.format === 'digital';
  const isMarathon = cartHasMarathonItem(order.cart_snapshot);
  const hasTracking = !!order.tracking_number;
  const trackingHref = trackingUrlFor({
    tracking: order.tracking_number,
    carrier: order.tracking_carrier,
    trackingUrl: order.tracking_url,
  });

  // Stage 3 ("Arrived") lights up explicitly via status='delivered' (admin
  // sets it in the dashboard), or as a fallback when the carrier has had
  // 10+ business days since fulfilled_at. Better-than-nothing default since
  // most carriers don't report delivery back to Printful.
  const fulfilledAt = order.fulfilled_at ? new Date(order.fulfilled_at) : null;
  const businessDaysSinceShip = fulfilledAt
    ? Math.floor((Date.now() - fulfilledAt.getTime()) / (1000 * 60 * 60 * 24)) // calendar days good-enough for the heuristic
    : null;
  const isDelivered =
    order.status === 'delivered' ||
    (businessDaysSinceShip !== null && businessDaysSinceShip >= 10);

  return (
    <>
      <NavbarShell />
      <section className="pt-28 pb-20 bg-soft min-h-[70vh]">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-white rounded-3xl p-6 md:p-10 border border-border">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
              <div>
                <div className="text-xs font-medium tracking-widest uppercase text-mid mb-1">
                  Order #{order.order_number}
                </div>
                <h1 className="text-2xl md:text-3xl font-medium text-ink tracking-tight">
                  {order.customization?.name ?? order.print_type_slug}
                </h1>
                {order.customization?.location && (
                  <p className="text-sm text-mid mt-1">
                    {order.customization.location}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-xs text-mid">Total</div>
                <div className="text-2xl font-medium text-ink">
                  ${(order.price_cents / 100).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Status: digital orders skip the 3-dot pipeline since they're
                available instantly — they get a single "Available now" pill
                above the download button below. */}
            {isDigital ? (
              <DigitalStatusBadge />
            ) : (
              <OrderPipeline
                isMarathon={isMarathon}
                hasTracking={hasTracking}
                isDelivered={isDelivered}
                fulfilledAt={fulfilledAt}
              />
            )}

            {/* Details */}
            <div className="grid md:grid-cols-2 gap-6 p-5 bg-soft rounded-2xl">
              <div>
                <div className="text-xs font-medium tracking-widest uppercase text-mid mb-2">
                  Format
                </div>
                <div className="text-ink capitalize">
                  {order.format} · {order.size}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium tracking-widest uppercase text-mid mb-2">
                  Customer
                </div>
                <div className="text-ink">{order.customer_name}</div>
                <div className="text-xs text-mid">{order.customer_email}</div>
              </div>
              {order.is_gift && (
                <div className="md:col-span-2">
                  <div className="text-xs font-medium tracking-widest uppercase text-mid mb-2">
                    Gift message
                  </div>
                  <div className="text-sm text-ink italic">
                    &ldquo;{order.gift_message}&rdquo;
                  </div>
                </div>
              )}
              {hasTracking && (
                <div className="md:col-span-2 flex flex-wrap items-center gap-x-2 gap-y-1 pt-2 border-t border-border">
                  <Truck size={14} className="text-ink" />
                  <span className="text-sm text-ink">Tracking:</span>
                  <span className="text-sm text-mid font-mono">
                    {order.tracking_number}
                  </span>
                  {trackingHref && (
                    <a
                      href={trackingHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-ink underline underline-offset-2 hover:opacity-70"
                    >
                      Track package <ExternalLink size={12} strokeWidth={1.75} />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Save-to-account CTA — only for guest visitors viewing
                an unlinked order */}
            {showAccountCTA && (
              <div className="mt-6 border border-border p-5 rounded-2xl">
                <div className="text-sm text-ink mb-1">
                  Save this order to your account
                </div>
                <p className="text-[13px] text-mid leading-relaxed mb-4">
                  Create an account with{' '}
                  <strong className="text-ink">{order.customer_email}</strong>{' '}
                  to track this order, save your shipping address, and reorder
                  faster next time.
                </p>
                <Link
                  href={`/sign-in?email=${encodeURIComponent(order.customer_email)}`}
                  className="inline-block bg-ink text-paper py-2.5 px-5 rounded-full text-sm font-medium hover:bg-black transition-colors"
                >
                  Create account
                </Link>
              </div>
            )}

            {/* Digital download */}
            {isDigital && order.digital_download_token && (
              <div className="mt-6">
                <a
                  href={`/download/${order.digital_download_token}`}
                  className="btn-primary w-full justify-center"
                >
                  <Download size={14} /> Download your print
                </a>
                <p className="text-[12px] text-mid mt-3 text-center">
                  {order.digital_download_count ?? 0} of{' '}
                  {order.digital_download_max ?? 5} downloads used
                  {order.digital_download_expires_at && (
                    <>
                      {' · expires '}
                      {new Date(order.digital_download_expires_at).toLocaleDateString(
                        'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        },
                      )}
                    </>
                  )}
                </p>
              </div>
            )}
          </div>

          <div className="text-center mt-6">
            <Link
              href="/shop"
              className="text-xs text-mid hover:text-ink underline underline-offset-2"
            >
              Keep browsing the shop →
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

function DigitalStatusBadge() {
  return (
    <div className="mb-8 flex items-center justify-center">
      <div className="inline-flex items-center gap-2 bg-mint-light text-mint px-4 py-2 rounded-full text-[12px] font-medium tracking-wider uppercase">
        <Check size={14} /> Available now — download below
      </div>
    </div>
  );
}

interface PipelineProps {
  isMarathon: boolean;
  hasTracking: boolean;
  isDelivered: boolean;
  fulfilledAt: Date | null;
}

function OrderPipeline({
  isMarathon,
  hasTracking,
  isDelivered,
  fulfilledAt,
}: PipelineProps) {
  const orderedSub = isMarathon
    ? 'Personalizing your print by hand'
    : 'Order confirmed — preparing your print';

  const arrivedSub =
    isDelivered
      ? 'Delivered'
      : hasTracking
      ? 'Estimated arrival within 5–10 business days of shipping'
      : 'Once shipped, expect arrival within 5–10 business days';

  const steps: Stage[] = [
    {
      key: 'ordered',
      label: 'Ordered',
      sub: orderedSub,
      done: true,
      current: !hasTracking,
      Icon: Check,
    },
    {
      key: 'shipped',
      label: 'Shipped',
      sub: hasTracking
        ? fulfilledAt
          ? `Shipped ${fulfilledAt.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })} — track below`
          : 'On its way — track below'
        : 'You’ll get a tracking email here',
      done: hasTracking,
      current: hasTracking && !isDelivered,
      Icon: Truck,
    },
    {
      key: 'arrived',
      label: 'Arrived',
      sub: arrivedSub,
      done: isDelivered,
      current: isDelivered,
      Icon: isDelivered ? PackageCheck : CircleDashed,
    },
  ];

  return (
    <div className="mb-8">
      <div className="text-xs font-medium tracking-widest uppercase text-mid mb-4">
        Status
      </div>
      <div className="relative grid grid-cols-3 gap-2">
        {/* connecting line */}
        <div className="absolute top-[18px] left-[16.66%] right-[16.66%] h-0.5 bg-border" />
        <div
          className="absolute top-[18px] left-[16.66%] h-0.5 bg-ink transition-all"
          style={{
            width: isDelivered ? '66.66%' : hasTracking ? '33.33%' : '0%',
          }}
        />
        {steps.map((s) => (
          <Step key={s.key} stage={s} />
        ))}
      </div>
    </div>
  );
}

interface Stage {
  key: string;
  label: string;
  sub: string;
  done: boolean;
  current: boolean;
  Icon: typeof Check;
}

function Step({ stage }: { stage: Stage }) {
  const { label, sub, done, current, Icon } = stage;
  return (
    <div className="flex flex-col items-center relative z-10 px-1">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 transition-all ${
          done
            ? 'bg-ink text-paper'
            : 'bg-paper text-mid border border-border'
        } ${current ? 'ring-4 ring-soft' : ''}`}
      >
        <Icon size={14} strokeWidth={1.75} />
      </div>
      <span
        className={`text-[11px] md:text-xs font-medium text-center ${
          done ? 'text-ink' : 'text-mid'
        }`}
      >
        {label}
      </span>
      <span className="text-[10px] md:text-[11px] text-mid text-center mt-1 leading-tight max-w-[140px]">
        {sub}
      </span>
    </div>
  );
}
