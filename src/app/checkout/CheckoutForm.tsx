'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import Link from 'next/link';
import Image from 'next/image';
import { Lock } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { COUNTRIES } from '@/data/countries';

interface Props {
  initialCountry?: string;
}

const stripePromise: Promise<Stripe | null> = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

export default function CheckoutForm({ initialCountry = 'US' }: Props) {
  const { items } = useCart();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [orderToken, setOrderToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const itemsRef = useRef(items);

  useEffect(() => {
    if (itemsRef.current.length === 0) return;
    let cancelled = false;
    fetch('/api/payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: itemsRef.current, defaultCountry: initialCountry }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (!data.clientSecret) throw new Error(data.detail || data.error || 'Could not start checkout');
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
        setOrderToken(data.orderToken);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not start checkout');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-6 text-center pt-32 md:pt-40 pb-20">
        <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-ink mb-3">
          Your cart is empty
        </h1>
        <p className="text-mid mb-7">Add a print before checking out.</p>
        <Link href="/shop" className="btn-primary">
          Browse the shop
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-6 text-center pt-32 md:pt-40 pb-20">
        <p className="text-sm text-accent mb-4">{error}</p>
        <Link href="/shop" className="btn-secondary">
          Back to shop
        </Link>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="text-center pt-32 md:pt-40 pb-20 text-sm text-mid min-h-[60vh]">
        Loading secure payment…
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#0e0e0e',
            colorText: '#0e0e0e',
            fontFamily: 'Inter, system-ui, sans-serif',
            borderRadius: '8px',
          },
        },
      }}
    >
      <InnerForm
        paymentIntentId={paymentIntentId!}
        orderToken={orderToken!}
        initialCountry={initialCountry}
      />
    </Elements>
  );
}

interface InnerFormProps {
  paymentIntentId: string;
  orderToken: string;
  initialCountry: string;
}

interface AddressFields {
  name: string;
  email: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

function InnerForm({ paymentIntentId, orderToken, initialCountry }: InnerFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { items, subtotalCents } = useCart();

  const [address, setAddress] = useState<AddressFields>({
    name: '',
    email: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: initialCountry,
  });
  const [shippingCents, setShippingCents] = useState<number | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);
  const updateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasPhysical = useMemo(() => items.some((i) => i.format === 'physical'), [items]);
  const totalCents = subtotalCents + (shippingCents ?? 0);

  // Re-quote shipping whenever country + postal_code (and state for US/CA) change
  useEffect(() => {
    if (!hasPhysical) {
      setShippingCents(0);
      return;
    }
    if (!address.country || !address.postalCode) return;
    if ((address.country === 'US' || address.country === 'CA') && !address.state) return;

    if (updateTimer.current) clearTimeout(updateTimer.current);
    updateTimer.current = setTimeout(async () => {
      setUpdateError(null);
      try {
        const res = await fetch('/api/payment-intent/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId,
            address: {
              country: address.country,
              state: address.state,
              postalCode: address.postalCode,
              line1: address.line1,
              line2: address.line2,
              city: address.city,
              name: address.name,
            },
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Could not update shipping');
        setShippingCents(data.shippingCents ?? 0);
      } catch (err) {
        setUpdateError(err instanceof Error ? err.message : 'Could not update shipping');
      }
    }, 500);
    return () => {
      if (updateTimer.current) clearTimeout(updateTimer.current);
    };
  }, [
    hasPhysical,
    paymentIntentId,
    address.country,
    address.postalCode,
    address.state,
    address.line1,
    address.line2,
    address.city,
    address.name,
  ]);

  const setField = (k: keyof AddressFields, v: string) =>
    setAddress((prev) => ({ ...prev, [k]: v }));

  const addressReady = hasPhysical
    ? Boolean(
        address.name &&
          address.email &&
          address.line1 &&
          address.city &&
          address.postalCode &&
          address.country &&
          ((address.country !== 'US' && address.country !== 'CA') || address.state),
      )
    : Boolean(address.email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setSubmitError(null);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?token=${orderToken}`,
        receipt_email: address.email,
        payment_method_data: {
          billing_details: {
            name: address.name,
            email: address.email,
            address: {
              line1: address.line1 || undefined,
              line2: address.line2 || undefined,
              city: address.city || undefined,
              state: address.state || undefined,
              postal_code: address.postalCode || undefined,
              country: address.country || undefined,
            },
          },
        },
      },
    });
    if (error) {
      setSubmitError(error.message ?? 'Payment failed');
      setSubmitting(false);
    }
  };

  const needsState = address.country === 'US' || address.country === 'CA';
  const stateLabel = address.country === 'CA' ? 'Province' : 'State';

  return (
    <div className="max-w-[1200px] mx-auto px-6 pt-28 md:pt-32 pb-16">
      <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-ink leading-[1.05] py-6 md:py-7">
        Checkout
      </h1>

      <div className="grid md:grid-cols-[1fr_1.1fr] gap-10 lg:gap-14">
        {/* Order summary */}
        <div>
          <h2 className="text-[13px] font-medium text-ink uppercase tracking-wider pb-4 border-b border-border mb-1">
            Order
          </h2>
          {items.map((it) => (
            <div key={it.id} className="flex gap-5 py-5 border-b border-border">
              <div className="w-20 h-24 flex-shrink-0 bg-soft overflow-hidden flex items-center justify-center">
                {it.imageUrl ? (
                  <Image src={it.imageUrl} alt={it.name} width={160} height={200} className="w-full h-full object-cover" unoptimized />
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
              <span className="text-ink">
                {!hasPhysical ? 'Free (digital)' : shippingCents == null ? '—' : `$${(shippingCents / 100).toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-mid">
              <span>Tax</span>
              <span className="text-ink">Calculated at payment</span>
            </div>
            <div className="flex justify-between pt-3 mt-2 border-t border-border">
              <span className="text-ink">Total</span>
              <span className="text-ink text-lg">${(totalCents / 100).toFixed(2)}</span>
            </div>
            <p className="text-[12px] text-mid mt-2">
              {hasPhysical
                ? 'Shipping updates as you enter your address. Tax is added at payment.'
                : 'Tax (if applicable) added at payment.'}
            </p>
          </div>

          <Link href="/shop" className="inline-block text-sm text-mid hover:text-ink underline underline-offset-2 mt-8">
            ← Continue shopping
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-[13px] font-medium text-ink uppercase tracking-wider pb-4 border-b border-border">
            Contact
          </h2>
          <input
            type="email"
            required
            placeholder="Email"
            autoComplete="email"
            value={address.email}
            onChange={(e) => setField('email', e.target.value)}
            className="input-field"
          />

          {hasPhysical && (
            <>
              <h2 className="text-[13px] font-medium text-ink uppercase tracking-wider pb-4 border-b border-border pt-2">
                Shipping address
              </h2>
              <input
                type="text"
                required
                placeholder="Full name"
                autoComplete="name"
                value={address.name}
                onChange={(e) => setField('name', e.target.value)}
                className="input-field"
              />
              <select
                value={address.country}
                onChange={(e) => setField('country', e.target.value)}
                className="input-field"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                required
                placeholder="Address"
                autoComplete="address-line1"
                value={address.line1}
                onChange={(e) => setField('line1', e.target.value)}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Apt, suite, etc. (optional)"
                autoComplete="address-line2"
                value={address.line2}
                onChange={(e) => setField('line2', e.target.value)}
                className="input-field"
              />
              <div className={`grid gap-3 ${needsState ? 'grid-cols-3' : 'grid-cols-2'}`}>
                <input
                  type="text"
                  required
                  placeholder="City"
                  autoComplete="address-level2"
                  value={address.city}
                  onChange={(e) => setField('city', e.target.value)}
                  className="input-field"
                />
                {needsState && (
                  <input
                    type="text"
                    required
                    placeholder={stateLabel}
                    autoComplete="address-level1"
                    value={address.state}
                    onChange={(e) => setField('state', e.target.value.toUpperCase())}
                    maxLength={2}
                    className="input-field uppercase"
                  />
                )}
                <input
                  type="text"
                  required
                  placeholder={address.country === 'US' ? 'ZIP' : 'Postal code'}
                  autoComplete="postal-code"
                  value={address.postalCode}
                  onChange={(e) => setField('postalCode', e.target.value)}
                  className="input-field"
                />
              </div>
              {updateError && <p className="text-sm text-accent">{updateError}</p>}
            </>
          )}

          <h2 className="text-[13px] font-medium text-ink uppercase tracking-wider pb-4 border-b border-border pt-2">
            Payment
          </h2>
          <PaymentElement
            options={{
              layout: 'tabs',
              fields: { billingDetails: 'never' },
            }}
            onChange={(e) => setPaymentReady(e.complete)}
          />

          {submitError && <p className="text-sm text-accent">{submitError}</p>}

          <button
            type="submit"
            disabled={
              !stripe ||
              submitting ||
              !addressReady ||
              (hasPhysical && shippingCents == null) ||
              !paymentReady
            }
            className="w-full bg-ink text-paper py-4 rounded-full text-sm font-medium hover:bg-black transition-colors disabled:opacity-60"
          >
            {submitting
              ? 'Processing…'
              : !addressReady
              ? 'Enter your details to continue'
              : hasPhysical && shippingCents == null
              ? 'Calculating shipping…'
              : !paymentReady
              ? 'Add payment to continue'
              : `Place order · $${(totalCents / 100).toFixed(2)}`}
          </button>
          <p className="text-[12px] text-mid text-center">
            Sales tax (if applicable) is calculated and added when you place the order.
          </p>
          <p className="text-[12px] text-mid text-center flex items-center justify-center gap-1.5">
            <Lock size={12} strokeWidth={1.75} /> Secure payment powered by Stripe
          </p>
        </form>
      </div>
    </div>
  );
}
