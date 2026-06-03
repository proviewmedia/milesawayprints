'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X, ArrowRight, Check } from 'lucide-react';

const DISMISS_KEY = 'first-visit-popup-dismissed';
const DELAY_MS = 8000;

type Status = 'idle' | 'submitting' | 'success' | 'error';

/**
 * 10%-off lead capture popup that shows once per session after an 8-second
 * delay. Skipped on routes where conversion is in progress (checkout,
 * account) and on form-heavy pages so it doesn't interrupt high-intent
 * actions. Dismissal persists for the session.
 */
export default function FirstVisitPopup() {
  const pathname = usePathname() ?? '';
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const skipPaths = ['/checkout', '/account', '/sign-in', '/forgot-password', '/reset-password'];
  const shouldSkip = skipPaths.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (shouldSkip) return;
    try {
      if (sessionStorage.getItem(DISMISS_KEY)) return;
    } catch {}
    const t = window.setTimeout(() => setOpen(true), DELAY_MS);
    return () => window.clearTimeout(t);
  }, [shouldSkip]);

  // ESC key closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function dismiss() {
    setOpen(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {}
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('submitting');
    setMessage(null);
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'first-visit-popup' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sign up failed');
      setStatus('success');
      setMessage(
        data.alreadySubscribed
          ? "You're already on the list — we re-sent your code."
          : 'Check your inbox — your 10% off code is on the way.',
      );
      try {
        sessionStorage.setItem(DISMISS_KEY, '1');
      } catch {}
      // Auto-close after a short beat so the customer sees the success
      // state before the overlay vanishes.
      window.setTimeout(() => setOpen(false), 3000);
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Sign up failed');
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-visit-popup-title"
      className="fixed inset-0 z-[60] flex items-end md:items-center justify-center"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close offer"
        onClick={dismiss}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
      />

      {/* Card — bottom-sheet on mobile, centered modal on desktop */}
      <div className="relative bg-paper w-full md:w-[420px] md:rounded-2xl rounded-t-2xl border border-border shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.15)] md:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)] p-6 md:p-7 mb-0 md:mb-0 animate-[slideUp_280ms_ease-out]">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute top-3 right-3 w-9 h-9 rounded-full hover:bg-soft flex items-center justify-center text-mid hover:text-ink transition-colors"
        >
          <X size={16} strokeWidth={1.75} aria-hidden="true" />
        </button>

        {status === 'success' ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto rounded-full bg-mint/15 flex items-center justify-center mb-4">
              <Check size={20} strokeWidth={1.75} className="text-mint" aria-hidden="true" />
            </div>
            <h2
              id="first-visit-popup-title"
              className="text-lg font-medium text-ink mb-2"
            >
              You&apos;re in.
            </h2>
            <p className="text-sm text-mid">{message}</p>
          </div>
        ) : (
          <>
            <div className="text-[11px] font-medium tracking-widest uppercase text-mid mb-2">
              Welcome offer
            </div>
            <h2
              id="first-visit-popup-title"
              className="text-2xl md:text-[26px] font-medium tracking-tight text-ink leading-[1.15] mb-3"
            >
              10% off your first print.
            </h2>
            <p className="text-sm text-mid leading-relaxed mb-5">
              Drop your email and we&apos;ll send a code, plus first looks at new releases.
            </p>
            <form onSubmit={submit} className="space-y-3">
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field w-full"
                disabled={status === 'submitting'}
                aria-label="Email address"
              />
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full bg-ink text-paper py-3 rounded-full text-sm font-medium hover:bg-black transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {status === 'submitting' ? (
                  'Sending…'
                ) : (
                  <>
                    Get my 10% off code
                    <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
                  </>
                )}
              </button>
            </form>
            {status === 'error' && message && (
              <p className="text-[12px] text-coral mt-3" role="alert">
                {message}
              </p>
            )}
            <button
              type="button"
              onClick={dismiss}
              className="block w-full text-center text-[12px] text-mid hover:text-ink mt-4 transition-colors"
            >
              No thanks
            </button>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
