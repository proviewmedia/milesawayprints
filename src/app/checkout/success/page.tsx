import Link from 'next/link';
import Script from 'next/script';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';
import { createAdminClient } from '@/lib/supabase';
import AccountCallToAction from './AccountCallToAction';
import ClearCartOnMount from './ClearCartOnMount';

export const dynamic = 'force-dynamic';

const GOOGLE_MERCHANT_ID = 5790411058;
const PLACEHOLDER_EMAIL = 'pending@placeholder.local';

async function getOrderBySession(sessionId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from('orders')
    .select('id, token, customer_email, customer_name, shipping_country, cart_snapshot, price_cents, order_number')
    .eq('stripe_checkout_session_id', sessionId)
    .single();
  return data;
}

interface SnapshotItem {
  slug: string;
  type?: string;
  size?: string;
  priceCents: number;
  quantity?: number;
  name: string;
}

function buildPurchasePayload(order: {
  id?: string;
  order_number?: number;
  cart_snapshot?: SnapshotItem[] | null;
  price_cents?: number | null;
} | null) {
  if (!order?.cart_snapshot?.length || typeof order.price_cents !== 'number') return undefined;
  return {
    orderId: order.order_number ? String(order.order_number) : String(order.id ?? ''),
    items: order.cart_snapshot.map((it) => ({
      id: it.slug,
      name: it.name,
      category: it.type,
      variant: it.size,
      price: it.priceCents / 100,
      quantity: it.quantity ?? 1,
    })),
    valueUsd: order.price_cents / 100,
  };
}

/** Today + N business days (skip Sat/Sun). Used for Google's estimated
 *  delivery date — we promise 3–5 day production + 3–5 day transit, so
 *  10 business days is the conservative outer bound. */
function addBusinessDays(start: Date, days: number): Date {
  const d = new Date(start);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return d;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string; token?: string };
}) {
  const sessionId = searchParams.session_id;
  let token = searchParams.token ?? null;
  let customerEmail: string | null = null;
  let customerName: string | null = null;
  let shippingCountry: string | null = null;
  let purchasePayload: ReturnType<typeof buildPurchasePayload> = undefined;

  if (sessionId) {
    const order = await getOrderBySession(sessionId);
    token = token ?? order?.token ?? null;
    customerEmail = order?.customer_email ?? null;
    customerName = order?.customer_name ?? null;
    shippingCountry = order?.shipping_country ?? null;
    purchasePayload = buildPurchasePayload(order);
  } else if (token) {
    // New Stripe Elements flow — order looked up by token directly
    const admin = createAdminClient();
    const { data: order } = await admin
      .from('orders')
      .select('id, customer_email, customer_name, shipping_country, cart_snapshot, price_cents, order_number')
      .eq('token', token)
      .maybeSingle();
    customerEmail = order?.customer_email ?? null;
    customerName = order?.customer_name ?? null;
    shippingCountry = order?.shipping_country ?? null;
    purchasePayload = buildPurchasePayload(order);
  }

  // Google Customer Reviews opt-in — only render when we have a real
  // customer email + shipping country (so Google can survey them about
  // the delivery experience). Skips the placeholder email used pre-payment.
  const canShowGoogleOptIn =
    !!customerEmail &&
    customerEmail !== PLACEHOLDER_EMAIL &&
    !!shippingCountry &&
    !!token;

  const estimatedDeliveryDate = canShowGoogleOptIn
    ? addBusinessDays(new Date(), 10).toISOString().slice(0, 10)
    : null;

  return (
    <>
      <ClearCartOnMount purchase={purchasePayload} />
      <NavbarShell />
      <section className="pt-32 md:pt-40 pb-24 min-h-[70vh]">
        <div className="max-w-[520px] mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-ink leading-[1.05] mb-4">
            Your order<br />is in.
          </h1>
          <p className="text-mid leading-relaxed mb-10">
            {customerName && customerName !== 'Pending Checkout'
              ? `Thanks, ${customerName.split(' ')[0]}.`
              : 'Thanks.'}{' '}
            A confirmation email is on its way with your order details. Physical prints ship in 3–5 business days; digital files are ready immediately.
          </p>

          {token && (
            <Link
              href={`/order/${token}`}
              className="btn-primary mb-10"
            >
              View your order
            </Link>
          )}

          {customerEmail && customerEmail !== 'pending@placeholder.local' && (
            <AccountCallToAction email={customerEmail} />
          )}

          <Link
            href="/shop"
            className="inline-block text-sm text-mid hover:text-ink underline underline-offset-2 mt-10"
          >
            Keep browsing
          </Link>
        </div>
      </section>
      <Footer />

      {/* Google Customer Reviews opt-in. Renders a small overlay that
          asks the customer if they want to receive a survey by email
          about their purchase. After ~100 verified responses, the
          store-level seller rating ("4.7 ★ Google Customer Reviews")
          becomes eligible to show on Shopping listings. The widget is
          silent if the customer is already opted in or out. */}
      {canShowGoogleOptIn && (
        <>
          <Script
            id="gcr-platform"
            src="https://apis.google.com/js/platform.js?onload=renderOptIn"
            strategy="afterInteractive"
            async
            defer
          />
          <Script
            id="gcr-optin"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.renderOptIn = function() {
                  window.gapi.load('surveyoptin', function() {
                    window.gapi.surveyoptin.render({
                      "merchant_id": ${GOOGLE_MERCHANT_ID},
                      "order_id": ${JSON.stringify(token)},
                      "email": ${JSON.stringify(customerEmail)},
                      "delivery_country": ${JSON.stringify(shippingCountry)},
                      "estimated_delivery_date": "${estimatedDeliveryDate}",
                      "opt_in_style": "CENTER_DIALOG"
                    });
                  });
                };
              `,
            }}
          />
        </>
      )}
    </>
  );
}
