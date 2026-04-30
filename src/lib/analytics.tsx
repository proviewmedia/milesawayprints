'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
export const CONSENT_KEY = 'cookie-consent';

export type ConsentValue = 'all' | 'essentials' | null;

export function readConsent(): ConsentValue {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem(CONSENT_KEY);
  return v === 'all' || v === 'essentials' ? v : null;
}

/** Loads Google Analytics only if the user has consented to all cookies
 *  AND the GA measurement ID is configured. No-op otherwise. */
export default function Analytics() {
  const [consent, setConsent] = useState<ConsentValue>(null);

  useEffect(() => {
    setConsent(readConsent());
    // Re-read when the cookie banner sets a value
    const onStorage = () => setConsent(readConsent());
    window.addEventListener('storage', onStorage);
    window.addEventListener('cookie-consent-change', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('cookie-consent-change', onStorage);
    };
  }, []);

  if (!GA_ID || consent !== 'all') return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_ID}', { anonymize_ip: true });
      `}</Script>
    </>
  );
}
