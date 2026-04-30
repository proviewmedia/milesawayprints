'use client';

import { useEffect, useRef, useState } from 'react';
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

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

interface CheckoutClientProps {
  initialCountry?: string;
  navbarCountry?: string;
}

export default function CheckoutClient({
  initialCountry = 'US',
  navbarCountry,
}: CheckoutClientProps) {
  const { items, subtotalCents } = useCart();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    if (items.length === 0) return;
    fetched.current = true;

    fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items,
        // Pre-quote shipping based on the visitor's geo'd country.
        // Stripe Tax recomputes per the address the customer types in
        // the embedded panel; shipping stays at the geo'd rate.
        shipping: { country: initialCountry },
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.clientSecret) {
          throw new Error(data.detail || data.error || 'Could not start checkout');
        }
        setClientSecret(data.clientSecret);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Could not start checkout');
      });
  }, [items, initialCountry]);

  return (
    <>
      <Navbar defaultCountry={navbarCountry} />

      <section className="max-w-[1200px] mx-auto px-6 pt-28 md:pt-32 pb-16">
        <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-ink leading-[1.05] py-6 md:py-7">
          Checkout
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-mid mb-6">Your cart is empty.</p>
            <Link href="/shop" className="btn-primary">
              Browse the shop
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-[1fr_1.1fr] gap-10 lg:gap-14">
            {/* Order summary — left column */}
            <div>
              <h2 className="text-[13px] font-medium text-ink uppercase tracking-wider pb-4 border-b border-border mb-1">
                Order
              </h2>
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
                  <span className="text-ink">Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-mid">
                  <span>Tax</span>
                  <span className="text-ink">Calculated at checkout</span>
                </div>
              </div>

              <p className="text-[12px] text-mid mt-6 leading-relaxed">
                Final shipping and tax appear in the secure payment panel
                once you enter your address.
              </p>

              <Link
                href="/shop"
                className="inline-block text-sm text-mid hover:text-ink underline underline-offset-2 mt-8"
              >
                ← Continue shopping
              </Link>
            </div>

            {/* Stripe Embedded Checkout — right column */}
            <div>
              <h2 className="text-[13px] font-medium text-ink uppercase tracking-wider pb-4 border-b border-border mb-6">
                Shipping & payment
              </h2>

              {error ? (
                <div className="text-center py-12">
                  <p className="text-sm text-accent mb-4">{error}</p>
                  <Link href="/shop" className="btn-secondary">
                    Back to shop
                  </Link>
                </div>
              ) : !clientSecret ? (
                <div className="text-center py-12 text-sm text-mid">
                  Loading secure checkout…
                </div>
              ) : (
                <div id="checkout">
                  <EmbeddedCheckoutProvider
                    stripe={stripePromise}
                    options={{ clientSecret }}
                  >
                    <EmbeddedCheckout />
                  </EmbeddedCheckoutProvider>
                </div>
              )}

              <p className="text-[12px] text-mid text-center flex items-center justify-center gap-1.5 mt-6">
                <Lock size={12} strokeWidth={1.75} /> Secure payment powered by Stripe
              </p>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </>
  );
}
