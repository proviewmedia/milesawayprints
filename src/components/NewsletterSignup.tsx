'use client';

import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

interface Props {
  source: 'footer' | 'gift-page' | 'checkout-success' | 'home';
  /** Render variant. Compact = single inline row; banner = larger card. */
  variant?: 'compact' | 'banner';
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function NewsletterSignup({ source, variant = 'compact' }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('submitting');
    setMessage(null);
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sign up failed');
      setStatus('success');
      setMessage(
        data.alreadySubscribed
          ? "You're already on the list — we re-sent your code."
          : "Check your inbox — 10% off code is on its way.",
      );
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Sign up failed');
    }
  };

  if (status === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="flex items-center gap-2 text-sm text-mint"
      >
        <Check size={16} strokeWidth={1.75} aria-hidden="true" /> {message}
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <form
        onSubmit={submit}
        className="bg-paper border border-border rounded-2xl p-5 md:p-6 max-w-2xl"
      >
        <h3 className="text-lg md:text-xl font-medium text-ink mb-1">
          10% off your first print
        </h3>
        <p className="text-sm text-mid mb-4">
          Get the discount code in your inbox, plus first looks at new prints.
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input-field flex-1"
            disabled={status === 'submitting'}
          />
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="bg-ink text-paper px-5 py-3 rounded-full text-sm font-medium hover:bg-black transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {status === 'submitting' ? 'Sending…' : 'Get my code'}
          </button>
        </div>
        <div role="status" aria-live="polite" aria-atomic="true">
          {status === 'error' && message && (
            <p className="text-[12px] text-coral mt-2">{message}</p>
          )}
        </div>
        <p className="text-[11px] text-light-mid mt-3">
          No spam — just occasional emails when we add new prints or run a promotion.
        </p>
      </form>
    );
  }

  // Compact (footer) variant
  return (
    <form onSubmit={submit}>
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="bg-paper border border-border rounded-full px-4 py-2.5 text-sm flex-1 focus:outline-none focus:border-ink"
          disabled={status === 'submitting'}
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          aria-label={status === 'submitting' ? 'Submitting…' : 'Subscribe to newsletter'}
          className="bg-ink text-paper w-10 h-10 rounded-full flex items-center justify-center hover:bg-black transition-colors disabled:opacity-50 flex-shrink-0"
        >
          {status === 'submitting' ? (
            <span className="text-[10px]" aria-hidden="true">…</span>
          ) : (
            <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
          )}
        </button>
      </div>
      {status === 'error' && message && (
        <p className="text-[11px] text-coral mt-2">{message}</p>
      )}
    </form>
  );
}
