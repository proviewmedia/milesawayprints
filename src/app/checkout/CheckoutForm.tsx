'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Elements,
  AddressElement,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe, Stripe, StripeAddressElementChangeEvent } from '@stripe/stripe-js';
import Link from 'next/link';
import Image from 'next/image';
import { Lock } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

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
      <div className="max-w-md mx-auto px-6 text-center py-20">
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
      <div className="max-w-md mx-auto px-6 text-center py-20">
        <p className="text-sm text-accent mb-4">{error}</p>
        <Link href="/shop" className="btn-secondary">
          Back to shop
        </Link>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="text-center py-20 text-sm text-mid">Loading secure payment…</div>
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

function InnerForm({ paymentIntentId, orderToken, initialCountry }: InnerFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { items, subtotalCents } = useCart();

  const [shippingCents, setShippingCents] = useState<number | null>(null);
  const [shippingMethodName, setShippingMethodName] = useState<string>('Shipping');
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const updateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasPhysical = useMemo(() => items.some((i) => i.format === 'physical'), [items]);
  const totalCents = subtotalCents + (shippingCents ?? 0);

  const handleAddressChange = (event: StripeAddressElementChangeEvent) => {
    if (!event.complete) return;
    const a = event.value.address;
    if (!a?.country) return;

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
              country: a.country,
              state: a.state,
              postalCode: a.postal_code,
              line1: a.line1,
              line2: a.line2,
              city: a.city,
              name: event.value.name,
            },
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Could not update shipping');
        setShippingCents(data.shippingCents ?? 0);
        setShippingMethodName(data.shippingMethodName ?? 'Shipping');
      } catch (err) {
        setUpdateError(err instanceof Error ? err.message : 'Could not update shipping');
      }
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setSubmitError(null);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?token=${orderToken}`,
      },
    });
    if (error) {
      setSubmitError(error.message ?? 'Payment failed');
      setSubmitting(false);
    }
  };

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

        {/* Stripe Elements */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-[13px] font-medium text-ink uppercase tracking-wider pb-4 border-b border-border">
            Shipping & payment
          </h2>

          {hasPhysical && (
            <div>
              <AddressElement
                options={{
                  mode: 'shipping',
                  allowedCountries: undefined,
                  defaultValues: { address: { country: initialCountry } },
                  fields: { phone: 'auto' },
                }}
                onChange={handleAddressChange}
              />
              {updateError && (
                <p className="text-sm text-accent mt-2">{updateError}</p>
              )}
            </div>
          )}

          <PaymentElement options={{ layout: 'tabs' }} />

          {submitError && (
            <p className="text-sm text-accent">{submitError}</p>
          )}

          <button
            type="submit"
            disabled={!stripe || submitting || (hasPhysical && shippingCents == null)}
            className="w-full bg-ink text-paper py-4 rounded-full text-sm font-medium hover:bg-black transition-colors disabled:opacity-60"
          >
            {submitting
              ? 'Processing…'
              : hasPhysical && shippingCents == null
              ? 'Enter address to continue'
              : `Pay · $${(totalCents / 100).toFixed(2)}`}
          </button>
          <p className="text-[12px] text-mid text-center flex items-center justify-center gap-1.5">
            <Lock size={12} strokeWidth={1.75} /> Secure payment powered by Stripe
          </p>
        </form>
      </div>
    </div>
  );
}
