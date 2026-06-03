'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Lock, Minus, Plus, Trash2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { trackBeginCheckout } from '@/lib/track';

const WELCOME_CODE_KEY = 'welcome-code';

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
  const { items, setQuantity, removeItem, subtotalCents } = useCart();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const searchParams = useSearchParams();
  const beginTrackedRef = useRef(false);

  // Discount code resolution priority: ?code= URL param > stored welcome
  // code in localStorage (saved by the first-visit popup) > none.
  const promoCode = useMemo(() => {
    const fromUrl = searchParams?.get('code')?.trim();
    if (fromUrl) {
      try {
        localStorage.setItem(WELCOME_CODE_KEY, fromUrl);
      } catch {}
      return fromUrl;
    }
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(WELCOME_CODE_KEY) || null;
    } catch {
      return null;
    }
  }, [searchParams]);

  /**
   * Stripe Checkout sessions are created per `(items, country)` combo.
   * If the customer edits quantities or removes items right here on the
   * checkout page, the existing session is stale — we recreate it. The
   * key below changes whenever the cart shape changes, which triggers
   * the effect to refetch.
   */
  const cartKey = useMemo(
    () =>
      items
        .map((it) => `${it.id}x${it.quantity}`)
        .sort()
        .join('|'),
    [items],
  );

  useEffect(() => {
    if (items.length === 0) return;
    setRefreshing(true);
    setError(null);

    // Fire begin_checkout once per session-of-items, not per refetch
    // (refetches happen on quantity edits).
    if (!beginTrackedRef.current) {
      trackBeginCheckout(
        items.map((it) => ({
          id: it.slug,
          name: it.name,
          category: it.type,
          variant: it.size,
          price: it.priceCents / 100,
          quantity: it.quantity,
        })),
        subtotalCents / 100,
      );
      beginTrackedRef.current = true;
    }

    let cancelled = false;
    fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items,
        // Pre-quote shipping based on the visitor's geo'd country.
        // Stripe Tax recomputes per the address the customer types in
        // the embedded panel; shipping stays at the geo'd rate.
        shipping: { country: initialCountry },
        promoCode: promoCode || undefined,
      }),
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
        setError(err instanceof Error ? err.message : 'Could not start checkout');
      })
      .finally(() => {
        if (!cancelled) setRefreshing(false);
      });

    return () => {
      cancelled = true;
    };
    // We deliberately depend on cartKey (a derived string) rather than the
    // items array reference so we don't refetch when nothing meaningful
    // changed. eslint disabled for the same reason.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartKey, initialCountry, promoCode]);

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
            {/* Cart preview — left column, rendered as a card. Stripe's
                panel on the right shows the full totals breakdown so we
                deliberately don't repeat subtotal/shipping/tax/total. */}
            <div className="border border-border rounded-2xl p-5 md:p-7 bg-paper min-w-0">
              <h2 className="text-[13px] font-medium text-ink uppercase tracking-wider pb-4 border-b border-border mb-1">
                Your order
              </h2>
              {items.map((it) => (
                <div key={it.id} className="flex gap-4 md:gap-5 py-5 border-b border-border last:border-b-0">
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
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm text-ink truncate">{it.name}</div>
                        <div className="text-[12px] text-mid mt-0.5">
                          {it.format === 'digital' ? 'Digital' : it.size}
                          {it.isGift && ' · Gift'}
                          {it.isCustom && ' · Custom'}
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(it.id)}
                        aria-label={`Remove ${it.name}`}
                        className="text-mid hover:text-ink transition-colors w-8 h-8 flex items-center justify-center flex-shrink-0"
                      >
                        <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      {it.isCustom ? (
                        <span className="text-[12px] text-mid">Qty 1</span>
                      ) : (
                        <div className="inline-flex items-center border border-border rounded-full">
                          <button
                            onClick={() => setQuantity(it.id, it.quantity - 1)}
                            disabled={it.quantity <= 1 || refreshing}
                            aria-label={`Decrease quantity of ${it.name}`}
                            className="w-8 h-8 flex items-center justify-center text-ink hover:bg-soft disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Minus size={12} strokeWidth={1.75} aria-hidden="true" />
                          </button>
                          <span
                            className="w-8 text-center text-[13px] text-ink tabular-nums"
                            aria-live="polite"
                          >
                            {it.quantity}
                          </span>
                          <button
                            onClick={() => setQuantity(it.id, it.quantity + 1)}
                            disabled={it.quantity >= 99 || refreshing}
                            aria-label={`Increase quantity of ${it.name}`}
                            className="w-8 h-8 flex items-center justify-center text-ink hover:bg-soft disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Plus size={12} strokeWidth={1.75} aria-hidden="true" />
                          </button>
                        </div>
                      )}
                      <div className="text-sm text-ink whitespace-nowrap">
                        ${((it.priceCents * it.quantity) / 100).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Link
                href="/shop"
                className="inline-block text-sm text-mid hover:text-ink underline underline-offset-2 mt-6"
              >
                ← Continue shopping
              </Link>
            </div>

            {/* Stripe Embedded Checkout — right column, rendered as a
                card. The h2 sits OUTSIDE the scroll area so it's always
                anchored at the top of the card (not just sticky), and
                the form scrolls in its own region below. This avoids the
                "content bleeds through the padding above the sticky
                header" bug that the previous overflow+padding combo had. */}
            <div className="border border-border rounded-2xl bg-paper md:sticky md:top-28 md:self-start md:max-h-[calc(100vh-7rem)] flex flex-col overflow-hidden min-w-0 max-w-full">
              <h2 className="flex-shrink-0 px-6 md:px-7 pt-6 md:pt-7 pb-4 border-b border-border text-[13px] font-medium text-ink uppercase tracking-wider">
                Shipping & payment
              </h2>

              <div className="flex-1 md:overflow-y-auto px-4 md:px-7 py-6 md:py-7">
                {/* Trust signal above the form — visible immediately
                    on first load so the blank space while Stripe
                    initializes doesn't read as broken. */}
                <p className="text-[12px] text-mid text-center flex items-center justify-center gap-1.5 mb-5">
                  <Lock size={12} strokeWidth={1.75} aria-hidden="true" /> Secure payment powered by Stripe
                </p>

                {error ? (
                  <div className="text-center py-12">
                    <p className="text-sm text-accent mb-4">{error}</p>
                    <Link href="/shop" className="btn-secondary">
                      Back to shop
                    </Link>
                  </div>
                ) : !clientSecret ? (
                  <div className="py-6">
                    {/* Skeleton blocks so the area doesn't read as empty
                        while Stripe initializes. */}
                    <div className="space-y-3" aria-hidden="true">
                      <div className="h-10 bg-soft rounded-lg animate-pulse" />
                      <div className="h-10 bg-soft rounded-lg animate-pulse" />
                      <div className="h-10 bg-soft rounded-lg animate-pulse" />
                      <div className="h-32 bg-soft rounded-lg animate-pulse" />
                    </div>
                    <p className="text-center text-[13px] text-mid mt-6">
                      Preparing your secure checkout…
                    </p>
                  </div>
                ) : (
                  <div id="checkout" className="min-w-0 w-full">
                    <EmbeddedCheckoutProvider
                      stripe={stripePromise}
                      options={{ clientSecret }}
                    >
                      <EmbeddedCheckout />
                    </EmbeddedCheckoutProvider>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </>
  );
}
