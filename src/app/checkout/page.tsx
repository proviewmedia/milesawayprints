'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Lock } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';

const SHIPPING_FLAT_CENTS = 500;

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

export default function CheckoutPage() {
  const { items, subtotalCents, clear } = useCart();
  const [step, setStep] = useState<'review' | 'paying'>('review');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasPhysical = useMemo(() => items.some((i) => i.format === 'physical'), [items]);
  const shippingCents = hasPhysical ? SHIPPING_FLAT_CENTS : 0;
  const totalCents = subtotalCents + shippingCents;

  const handleCheckout = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok || !data.clientSecret) throw new Error(data.detail || data.error || 'Checkout failed');
      setClientSecret(data.clientSecret);
      setStep('paying');
      clear();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchClientSecret = useCallback(() => {
    return Promise.resolve(clientSecret ?? '');
  }, [clientSecret]);

  if (step === 'paying' && clientSecret) {
    return (
      <>
        <Navbar />
        <section className="pt-28 md:pt-32 pb-20 min-h-screen">
          <div className="max-w-[900px] mx-auto px-6">
            <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-ink leading-[1.05] mb-2">
              Payment
            </h1>
            <p className="text-mid mb-8 flex items-center gap-1.5">
              <Lock size={12} strokeWidth={1.75} /> Secure payment powered by Stripe
            </p>

            <div id="checkout">
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{ fetchClientSecret }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <section className="pt-32 md:pt-40 pb-20 min-h-[60vh]">
          <div className="max-w-md mx-auto px-6 text-center">
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-ink mb-3">
              Your cart is empty
            </h1>
            <p className="text-mid mb-7">Add a print before checking out.</p>
            <Link href="/shop" className="btn-primary">
              Browse the shop
            </Link>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <section className="pt-28 md:pt-32 pb-20 min-h-screen">
        <div className="max-w-[960px] mx-auto px-6">
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-ink leading-[1.05] mb-2">
            Review your order
          </h1>
          <p className="text-mid mb-10">
            Confirm the items below, then continue to secure payment.
          </p>

          <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-10">
            <div>
              <h2 className="text-[13px] font-medium text-ink uppercase tracking-wider mb-4">
                Items
              </h2>
              <div className="border-t border-border">
                {items.map((it) => (
                  <div key={it.id} className="flex gap-5 py-5 border-b border-border">
                    <div className="w-20 h-24 flex-shrink-0 bg-soft overflow-hidden flex items-center justify-center">
                      {it.imageUrl ? (
                        <Image
                          src={it.imageUrl}
                          alt={it.name}
                          width={160}
                          height={200}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-ink">{it.name}</div>
                      <div className="text-[12px] text-mid mt-0.5">
                        {it.format === 'digital' ? 'Digital' : it.size}
                        {it.isGift && ' · Gift'}
                        {it.isCustom && ' · Custom'}
                      </div>
                    </div>
                    <div className="text-sm text-ink whitespace-nowrap">
                      ${(it.priceCents / 100).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="md:sticky md:top-32 md:self-start">
              <h2 className="text-[13px] font-medium text-ink uppercase tracking-wider mb-4">
                Summary
              </h2>
              <div className="border-t border-border py-5 space-y-2.5 text-sm">
                <div className="flex justify-between text-mid">
                  <span>Subtotal</span>
                  <span className="text-ink">${(subtotalCents / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-mid">
                  <span>Shipping</span>
                  <span className="text-ink">
                    {hasPhysical ? `$${(shippingCents / 100).toFixed(2)}` : 'Free (digital)'}
                  </span>
                </div>
                <div className="flex justify-between pt-3 mt-2 border-t border-border">
                  <span className="text-ink">Total</span>
                  <span className="text-ink text-lg">${(totalCents / 100).toFixed(2)}</span>
                </div>
              </div>

              {error && (
                <p className="text-sm text-accent mb-3">{error}</p>
              )}

              <button
                onClick={handleCheckout}
                disabled={submitting}
                className="w-full bg-ink text-paper py-4 rounded-full text-sm font-medium hover:bg-black transition-colors disabled:opacity-60 mb-3"
              >
                {submitting ? 'Loading payment…' : `Continue to payment · $${(totalCents / 100).toFixed(2)}`}
              </button>
              <p className="text-[12px] text-mid text-center flex items-center justify-center gap-1.5">
                <Lock size={12} strokeWidth={1.75} /> Secure checkout via Stripe
              </p>
              <p className="text-[12px] text-mid text-center mt-3">
                Email and shipping address are collected on the next step.
              </p>
            </aside>
          </div>

          <Link
            href="/shop"
            className="inline-block text-sm text-mid hover:text-ink underline underline-offset-2 mt-12"
          >
            ← Continue shopping
          </Link>
        </div>
      </section>
      <Footer />
    </>
  );
}
