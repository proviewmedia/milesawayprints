'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, Trash2, X } from 'lucide-react';
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
  const { items, subtotalCents, removeItem } = useCart();
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const dismissPayment = () => {
    setStep('review');
    setClientSecret(null);
    setError(null);
  };

  const fetchClientSecret = useCallback(() => {
    return Promise.resolve(clientSecret ?? '');
  }, [clientSecret]);

  if (items.length === 0 && step === 'review') {
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
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-ink leading-[1.05] mb-2">
            Review your order
          </h1>
          <div className="flex items-center gap-2 text-sm mb-10">
            <span className={step === 'review' ? 'text-ink' : 'text-mid'}>1. Review</span>
            <span className="text-mid">·</span>
            <span className={step === 'paying' ? 'text-ink' : 'text-mid'}>2. Pay</span>
          </div>

          <div className="grid md:grid-cols-[1fr_1.1fr] gap-10 lg:gap-14 items-start">
            {/* Left — cart + summary, always visible */}
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
                      {step === 'review' && (
                        <button
                          onClick={() => removeItem(it.id)}
                          className="text-[12px] text-mid hover:text-ink underline underline-offset-2 mt-2 inline-flex items-center gap-1"
                        >
                          <Trash2 size={11} strokeWidth={1.75} /> Remove
                        </button>
                      )}
                    </div>
                    <div className="text-sm text-ink whitespace-nowrap">
                      ${(it.priceCents / 100).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-2.5 text-sm">
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

              <Link
                href="/shop"
                className="inline-block text-sm text-mid hover:text-ink underline underline-offset-2 mt-8"
              >
                ← Continue shopping
              </Link>
            </div>

            {/* Right — review CTA OR embedded payment */}
            <aside className="md:sticky md:top-32 md:self-start">
              {step === 'review' && (
                <>
                  <h2 className="text-[13px] font-medium text-ink uppercase tracking-wider mb-4">
                    Payment
                  </h2>
                  <div className="border-t border-border pt-6">
                    {error && (
                      <p className="text-sm text-accent mb-3">{error}</p>
                    )}
                    <button
                      onClick={handleCheckout}
                      disabled={submitting || items.length === 0}
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
                  </div>
                </>
              )}

              {step === 'paying' && clientSecret && (
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[13px] font-medium text-ink uppercase tracking-wider">
                      Payment
                    </h2>
                    <button
                      onClick={dismissPayment}
                      aria-label="Close payment form"
                      className="w-8 h-8 -mr-1 rounded-full hover:bg-soft flex items-center justify-center text-mid hover:text-ink transition-colors"
                    >
                      <X size={16} strokeWidth={1.75} />
                    </button>
                  </div>
                  <div className="border-t border-border pt-2">
                    <EmbeddedCheckoutProvider
                      stripe={stripePromise}
                      options={{ fetchClientSecret }}
                    >
                      <EmbeddedCheckout />
                    </EmbeddedCheckoutProvider>
                    <p className="text-[12px] text-mid text-center flex items-center justify-center gap-1.5 mt-4">
                      <Lock size={12} strokeWidth={1.75} /> Secure payment powered by Stripe
                    </p>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
