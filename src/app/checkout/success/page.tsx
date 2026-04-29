import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createAdminClient } from '@/lib/supabase';
import AccountCallToAction from './AccountCallToAction';

export const dynamic = 'force-dynamic';

async function getOrderBySession(sessionId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from('orders')
    .select('token, customer_email, customer_name')
    .eq('stripe_checkout_session_id', sessionId)
    .single();
  return data;
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

  if (sessionId) {
    const order = await getOrderBySession(sessionId);
    token = token ?? order?.token ?? null;
    customerEmail = order?.customer_email ?? null;
    customerName = order?.customer_name ?? null;
  }

  return (
    <>
      <Navbar />
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
    </>
  );
}
