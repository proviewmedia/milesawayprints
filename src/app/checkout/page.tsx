'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
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
  const { items, subtotalCents } = useCart();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasPhysical = useMemo(() => items.some((i) => i.format === 'physical'), [items]);
  const shippingCents = hasPhysical ? SHIPPING_FLAT_CENTS : 0;
  const totalCents = subtotalCents + shippingCents;

  // Snapshot the cart on mount so subsequent edits don't keep refetching.
  // The cart drawer is the place to edit items; this page just pays.
  const itemsRef = useRef(items);
  useEffect(() => {
    if (itemsRef.current.length === 0) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: itemsRef.current }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (!data.clientSecret) {
          throw new Error(data.detail || data.error || 'Could not start checkout');
        }
        setClientSecret(data.clientSecret);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Something went wrong');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchClientSecret = useCallback(() => {
    return Promise.resolve(clientSecret ?? '');
  }, [clientSecret]);

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
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-ink leading-[1.05] mb-10">
            Checkout
          </h1>

          <div className="grid md:grid-cols-[1fr_1.1fr] gap-10 lg:gap-14 items-start">
            {/* Left — order summary */}
            <div>
              <h2 className="sticky top-28 md:top-32 z-10 bg-paper text-[13px] font-medium text-ink uppercase tracking-wider pb-4 border-b border-border">
                Order
              </h2>
              <div className="pt-1">
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
                <p className="text-[12px] text-mid mt-3">
                  Need to change your order? Open the cart from the navbar to edit items.
                </p>
              </div>
            </div>

            {/* Right — embedded payment */}
            <aside>
              <h2 className="sticky top-28 md:top-32 z-10 bg-paper text-[13px] font-medium text-ink uppercase tracking-wider pb-4 border-b border-border">
                Payment
              </h2>
              <div className="pt-6">
                {error && (
                  <p className="text-sm text-accent mb-4">{error}</p>
                )}
                {loading && !clientSecret && (
                  <div className="py-16 text-center text-sm text-mid">
                    Loading secure payment…
                  </div>
                )}
                {clientSecret && (
                  <>
                    <EmbeddedCheckoutProvider
                      stripe={stripePromise}
                      options={{ fetchClientSecret }}
                    >
                      <EmbeddedCheckout />
                    </EmbeddedCheckoutProvider>
                    <p className="text-[12px] text-mid text-center flex items-center justify-center gap-1.5 mt-4">
                      <Lock size={12} strokeWidth={1.75} /> Secure payment powered by Stripe
                    </p>
                  </>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
