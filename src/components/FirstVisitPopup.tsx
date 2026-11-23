'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X, ArrowRight, Check } from 'lucide-react';
import { trackSignUp } from '@/lib/track';

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
  const cardRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  // The offer is for the print shop, so it only appears on shop pages. It
  // would interrupt the custom-quote flow everywhere else.
  const shopPaths = ['/shop', '/prints', '/gifts', '/marathons'];
  const shouldSkip = !shopPaths.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (shouldSkip) return;
    try {
      if (sessionStorage.getItem(DISMISS_KEY)) return;
    } catch {}
    const t = window.setTimeout(() => setOpen(true), DELAY_MS);
    return () => window.clearTimeout(t);
  }, [shouldSkip]);

  // Focus management while open: remember what was focused, trap Tab inside
  // the dialog (so keyboard focus can't wander to the background behind an
  // aria-modal overlay), close on ESC, and restore focus on close.
  useEffect(() => {
    if (!open) return;
    lastFocused.current = (document.activeElement as HTMLElement) ?? null;

    const focusables = () => {
      const card = cardRef.current;
      if (!card) return [] as HTMLElement[];
      return Array.from(
        card.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismiss();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      lastFocused.current?.focus?.();
    };
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
      if (!data.alreadySubscribed) trackSignUp('first-visit-popup');
      setStatus('success');
      setMessage(
        data.alreadySubscribed
          ? "You're already on the list. We re-sent your code."
          : 'Check your inbox. Your 10% off code is on the way.',
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
        className="absolute inset-0 bg-ink/60"
      />

      {/* Card: bottom sheet on mobile, centered modal on desktop. Square, ink-bordered, like the rest of the INQ site */}
      <div ref={cardRef} className="relative bg-paper w-full md:w-[440px] border-2 border-ink animate-[slideUp_280ms_ease-out]">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full hover:bg-paper/15 flex items-center justify-center text-paper/70 hover:text-paper transition-colors"
        >
          <X size={16} strokeWidth={1.75} aria-hidden="true" />
        </button>

        {status === 'success' ? (
          <div className="bg-ink text-paper px-6 md:px-8 pt-12 pb-10">
            <Check size={28} strokeWidth={2.25} className="mb-5" aria-hidden="true" />
            <h2 id="first-visit-popup-title" className="display text-5xl mb-3">
              You&apos;re in.
            </h2>
            <p className="text-sm text-paper/75 leading-relaxed">{message}</p>
          </div>
        ) : (
          <>
            <div className="bg-ink text-paper px-6 md:px-8 pt-10 pb-8">
              <p className="eyebrow text-paper/60 mb-4">Welcome offer</p>
              <h2 id="first-visit-popup-title" className="display text-5xl">
                10% off
                <br />
                your first print
              </h2>
            </div>
            <div className="px-6 md:px-8 pt-6 pb-6">
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
                className="w-full bg-ink text-paper py-3.5 rounded-full text-sm font-bold hover:bg-black transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
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
            </div>
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
