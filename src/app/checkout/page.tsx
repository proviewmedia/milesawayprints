'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
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

const COUNTRIES: Array<{ code: string; name: string; needsState?: boolean }> = [
  { code: 'US', name: 'United States', needsState: true },
  { code: 'CA', name: 'Canada', needsState: true },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IE', name: 'Ireland' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'PT', name: 'Portugal' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'AT', name: 'Austria' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'PL', name: 'Poland' },
  { code: 'CZ', name: 'Czechia' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'JP', name: 'Japan' },
  { code: 'SG', name: 'Singapore' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'MX', name: 'Mexico' },
  { code: 'BR', name: 'Brazil' },
];

export default function CheckoutPage() {
  const { items, subtotalCents } = useCart();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Address fields (only shown / required for physical carts)
  const [country, setCountry] = useState('US');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  // Live-fetched shipping rate
  const [shippingCents, setShippingCents] = useState<number | null>(null);
  const [shippingLabel, setShippingLabel] = useState<string>('Standard shipping');
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [rateLoading, setRateLoading] = useState(false);

  const hasPhysical = useMemo(() => items.some((i) => i.format === 'physical'), [items]);
  const totalCents = subtotalCents + (hasPhysical ? (shippingCents ?? 0) : 0);

  const countryEntry = COUNTRIES.find((c) => c.code === country);
  const needsState = !!countryEntry?.needsState;

  // Recalculate shipping when address changes (debounced)
  useEffect(() => {
    if (!hasPhysical) {
      setShippingCents(0);
      return;
    }
    if (!country || !zip || (needsState && !state)) {
      setShippingCents(null);
      setShippingError(null);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setRateLoading(true);
      setShippingError(null);
      try {
        const res = await fetch('/api/shipping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items, country, state, zip }),
          signal: ctrl.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Could not get shipping rate');
        setShippingCents(data.rateCents ?? 0);
        setShippingLabel(data.name || 'Standard shipping');
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setShippingCents(null);
        setShippingError(err instanceof Error ? err.message : 'Could not get shipping rate');
      } finally {
        setRateLoading(false);
      }
    }, 500);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [hasPhysical, items, country, state, zip, needsState]);

  const canContinue = !hasPhysical || (shippingCents != null && !rateLoading && !shippingError);

  const handleContinue = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shipping: hasPhysical ? { country, state, zip } : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.clientSecret) throw new Error(data.detail || data.error || 'Could not start checkout');
      setClientSecret(data.clientSecret);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchClientSecret = useCallback(() => {
    return Promise.resolve(clientSecret ?? '');
  }, [clientSecret]);

  // Digital-only carts skip the address step and load Stripe immediately
  useEffect(() => {
    if (items.length === 0) return;
    if (hasPhysical) return;
    if (clientSecret || submitting) return;
    handleContinue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, hasPhysical]);

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
      <section className="pt-28 pb-10 md:pt-[96px] md:pb-0 md:h-[calc(100vh)] md:overflow-hidden">
        <div className="h-full max-w-[1200px] mx-auto px-6 flex flex-col">
          <h1 className="flex-shrink-0 text-3xl md:text-4xl font-medium tracking-tight text-ink leading-[1.05] py-6 md:py-7">
            Checkout
          </h1>

          <div className="grid md:grid-cols-[1fr_1.1fr] gap-10 lg:gap-14 md:flex-1 md:min-h-0 md:pb-6">
            {/* Left — order summary */}
            <div className="md:flex md:flex-col md:h-full md:min-h-0">
              <h2 className="md:flex-shrink-0 text-[13px] font-medium text-ink uppercase tracking-wider pb-4 border-b border-border">
                Order
              </h2>
              <div className="md:flex-1 md:min-h-0 md:overflow-y-auto md:pr-4 pt-1">
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
                      {!hasPhysical
                        ? 'Free (digital)'
                        : shippingCents == null
                        ? rateLoading
                          ? 'Calculating…'
                          : '—'
                        : `$${(shippingCents / 100).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 mt-2 border-t border-border">
                    <span className="text-ink">Total</span>
                    <span className="text-ink text-lg">${(totalCents / 100).toFixed(2)}</span>
                  </div>
                  {hasPhysical && shippingCents != null && (
                    <p className="text-[11px] text-mid">
                      Shipping calculated for your destination. Tax (if applicable) added at payment.
                    </p>
                  )}
                </div>

                <Link
                  href="/shop"
                  className="inline-block text-sm text-mid hover:text-ink underline underline-offset-2 mt-8"
                >
                  ← Continue shopping
                </Link>
                <p className="text-[12px] text-mid mt-3 mb-2">
                  Need to change your order? Open the cart from the navbar to edit items.
                </p>
              </div>
            </div>

            {/* Right — address form OR embedded payment */}
            <aside className="md:flex md:flex-col md:h-full md:min-h-0">
              <h2 className="md:flex-shrink-0 text-[13px] font-medium text-ink uppercase tracking-wider pb-4 border-b border-border">
                {clientSecret ? 'Payment' : hasPhysical ? 'Where to?' : 'Payment'}
              </h2>
              <div className="md:flex-1 md:min-h-0 md:overflow-y-auto pt-6 md:pr-1">
                {error && <p className="text-sm text-accent mb-4">{error}</p>}

                {/* Address step (physical, before Stripe loads) */}
                {hasPhysical && !clientSecret && (
                  <div className="space-y-4">
                    <p className="text-[13px] text-mid">
                      We&apos;ll calculate exact shipping for your destination before you pay.
                    </p>
                    <div>
                      <label className="block text-[13px] font-medium text-ink mb-2">Country</label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="input-field"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {needsState && (
                        <div>
                          <label className="block text-[13px] font-medium text-ink mb-2">State</label>
                          <input
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            placeholder={country === 'US' ? 'e.g. NV' : 'e.g. ON'}
                            maxLength={2}
                            className="input-field uppercase"
                          />
                        </div>
                      )}
                      <div className={needsState ? '' : 'col-span-2'}>
                        <label className="block text-[13px] font-medium text-ink mb-2">
                          {country === 'GB' ? 'Postcode' : 'ZIP / Postal code'}
                        </label>
                        <input
                          value={zip}
                          onChange={(e) => setZip(e.target.value)}
                          placeholder={country === 'US' ? '90210' : 'SW1A 1AA'}
                          className="input-field"
                        />
                      </div>
                    </div>

                    {shippingError && (
                      <p className="text-sm text-accent">{shippingError}</p>
                    )}

                    <button
                      onClick={handleContinue}
                      disabled={!canContinue || submitting}
                      className="w-full bg-ink text-paper py-4 rounded-full text-sm font-medium hover:bg-black transition-colors disabled:opacity-60 mt-4"
                    >
                      {submitting
                        ? 'Loading payment…'
                        : rateLoading
                        ? 'Calculating shipping…'
                        : shippingCents == null
                        ? 'Enter address to continue'
                        : `Continue to payment · $${(totalCents / 100).toFixed(2)}`}
                    </button>
                    <p className="text-[12px] text-mid text-center flex items-center justify-center gap-1.5">
                      <Lock size={12} strokeWidth={1.75} /> Secure checkout via Stripe
                    </p>
                  </div>
                )}

                {/* Loading state for digital-only flow */}
                {!hasPhysical && !clientSecret && (
                  <div className="py-16 text-center text-sm text-mid">Loading secure payment…</div>
                )}

                {/* Embedded Stripe payment */}
                {clientSecret && (
                  <>
                    <EmbeddedCheckoutProvider
                      stripe={stripePromise}
                      options={{ fetchClientSecret }}
                    >
                      <EmbeddedCheckout />
                    </EmbeddedCheckoutProvider>
                    <p className="text-[12px] text-mid text-center flex items-center justify-center gap-1.5 mt-4 mb-2">
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
