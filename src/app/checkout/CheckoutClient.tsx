'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
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
  const { items } = useCart();
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

      <section className="max-w-[900px] mx-auto px-6 pt-28 md:pt-32 pb-16">
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
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-sm text-accent mb-4">{error}</p>
            <Link href="/shop" className="btn-secondary">
              Back to shop
            </Link>
          </div>
        ) : !clientSecret ? (
          <div className="text-center py-20 text-sm text-mid">
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

        <p className="text-[12px] text-mid text-center mt-6">
          Sales tax (if applicable) is calculated by Stripe based on the
          shipping address you enter above.
        </p>

        <Link
          href="/shop"
          className="block text-center text-sm text-mid hover:text-ink underline underline-offset-2 mt-8"
        >
          ← Continue shopping
        </Link>
      </section>

      <Footer />
    </>
  );
}
