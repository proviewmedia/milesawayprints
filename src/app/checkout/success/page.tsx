import Link from 'next/link';
import { CheckCircle2, ArrowRight, Mail } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;

  return (
    <>
      <Navbar />
      <section className="pt-32 pb-24 min-h-[70vh]">
        <div className="max-w-xl mx-auto px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-mint-light flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={28} className="text-mint" />
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-ink tracking-tight mb-3">
            Your order is in.
          </h1>
          <p className="text-mid leading-relaxed mb-8">
            We&apos;re on it. You&apos;ll receive an email confirmation shortly
            with your order details and a link to your order page where you
            can track status, approve proofs, and download digital files.
          </p>

          {token && (
            <Link
              href={`/order/${token}`}
              className="btn-primary mb-4"
            >
              View your order <ArrowRight size={14} />
            </Link>
          )}

          <div className="mt-10 p-5 bg-soft rounded-2xl text-left">
            <div className="flex items-start gap-3">
              <Mail size={18} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-ink mb-1">What happens next</div>
                <ul className="text-xs text-mid space-y-1 list-disc list-inside">
                  <li>Confirmation email with order details</li>
                  <li>Digital orders: download link when ready</li>
                  <li>Physical orders: proof + ship notification</li>
                  <li>Custom orders: 3–5 business days for proof</li>
                </ul>
              </div>
            </div>
          </div>

          <Link
            href="/shop"
            className="inline-block text-xs font-semibold text-mid hover:text-primary mt-8"
          >
            ← Keep browsing the shop
          </Link>
        </div>
      </section>
      <Footer />
    </>
  );
}
