'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Lock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useCart } from '@/contexts/CartContext';

export default function CheckoutPage() {
  const { items, subtotalCents, clear } = useCart();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customer: { email, name },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      clear();
      router.push(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <section className="pt-32 pb-20 min-h-[60vh]">
          <div className="max-w-lg mx-auto px-6 text-center">
            <h1 className="text-2xl font-extrabold text-ink mb-2">Your cart is empty</h1>
            <p className="text-mid mb-6">Add a print before checking out.</p>
            <Link href="/shop" className="btn-primary">
              Browse the Shop <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <section className="pt-28 pb-20 bg-soft min-h-screen">
        <div className="max-w-5xl mx-auto px-6">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-mid hover:text-ink mb-6"
          >
            <ArrowLeft size={12} /> Continue shopping
          </Link>

          <h1 className="text-3xl md:text-4xl font-extrabold text-ink tracking-tight mb-8">
            Checkout
          </h1>

          <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-8">
            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 border border-border space-y-5">
              <div>
                <div className="text-xs font-bold tracking-wider uppercase text-primary mb-3">
                  1. Your Info
                </div>
                <label className="block mb-3">
                  <span className="block text-xs font-semibold text-ink mb-1.5">Email</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field"
                  />
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold text-ink mb-1.5">Full name</span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="input-field"
                  />
                </label>
              </div>

              <div className="pt-5 border-t border-border">
                <div className="text-xs font-bold tracking-wider uppercase text-primary mb-3">
                  2. Payment
                </div>
                <div className="p-4 rounded-xl bg-soft border border-border text-center">
                  <Lock size={16} className="text-mid mx-auto mb-2" />
                  <p className="text-xs text-mid leading-relaxed">
                    Stripe checkout integration pending.
                    <br />
                    <span className="font-semibold text-ink">
                      Clicking below will save your order as pending
                    </span>{' '}
                    — you&apos;ll be contacted to complete payment until Stripe is live.
                  </p>
                </div>
              </div>

              {error && (
                <div className="text-sm text-coral bg-coral-light p-3 rounded-lg">{error}</div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full justify-center disabled:opacity-60"
              >
                {submitting ? 'Placing order…' : (
                  <>
                    Place Order · ${(subtotalCents / 100).toFixed(2)} <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            {/* Summary */}
            <aside className="bg-white rounded-2xl p-6 border border-border h-fit md:sticky md:top-24">
              <div className="font-bold text-ink mb-4">Order Summary</div>
              <div className="space-y-3 mb-5 pb-5 border-b border-border">
                {items.map((it) => (
                  <div key={it.id} className="flex justify-between text-sm">
                    <div className="min-w-0 pr-3">
                      <div className="font-semibold text-ink truncate">{it.name}</div>
                      <div className="text-xs text-mid">
                        {it.format} · {it.size}
                      </div>
                    </div>
                    <div className="font-semibold text-ink">
                      ${(it.priceCents / 100).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm text-mid mb-2">
                <span>Subtotal</span>
                <span>${(subtotalCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-mid mb-3">
                <span>Shipping</span>
                <span>Calculated after checkout</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-border">
                <span className="font-bold text-ink">Total</span>
                <span className="font-extrabold text-ink text-lg">
                  ${(subtotalCents / 100).toFixed(2)}
                </span>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
