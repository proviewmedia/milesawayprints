'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CONSENT_KEY, readConsent } from '@/lib/analytics';

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (readConsent() == null) setShow(true);
  }, []);

  const setConsent = (value: 'all' | 'essentials') => {
    try {
      localStorage.setItem(CONSENT_KEY, value);
      window.dispatchEvent(new Event('cookie-consent-change'));
    } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-[420px] bg-paper border border-border shadow-lg p-5 z-[80]"
    >
      <p className="text-sm text-ink mb-2">Cookies, briefly.</p>
      <p className="text-[13px] text-mid leading-relaxed mb-4">
        We use a few essential cookies to keep the site working, plus optional
        Google Analytics cookies to understand site usage. See our{' '}
        <Link href="/privacy" className="text-ink underline underline-offset-2">
          privacy policy
        </Link>
        .
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => setConsent('all')}
          className="bg-ink text-paper px-5 py-2.5 rounded-full text-sm font-medium hover:bg-black transition-colors flex-1"
        >
          Accept all
        </button>
        <button
          onClick={() => setConsent('essentials')}
          className="bg-paper text-ink border border-border px-5 py-2.5 rounded-full text-sm font-medium hover:bg-soft transition-colors flex-1"
        >
          Essentials only
        </button>
      </div>
    </div>
  );
}
