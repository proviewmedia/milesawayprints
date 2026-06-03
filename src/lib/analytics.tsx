'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

export const CONSENT_KEY = 'cookie-consent';

export type ConsentValue = 'all' | 'essentials' | null;

export function readConsent(): ConsentValue {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem(CONSENT_KEY);
  return v === 'all' || v === 'essentials' ? v : null;
}

/**
 * Loads all configured ad/analytics platforms only if the user has
 * consented to all cookies AND the platform's env var is set. Each
 * platform is independently gated — if you only set GA_ID, only GA
 * loads.
 */
export default function Analytics() {
  const [consent, setConsent] = useState<ConsentValue>(null);

  useEffect(() => {
    setConsent(readConsent());
    const onStorage = () => setConsent(readConsent());
    window.addEventListener('storage', onStorage);
    window.addEventListener('cookie-consent-change', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('cookie-consent-change', onStorage);
    };
  }, []);

  if (consent !== 'all') return null;

  return (
    <>
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { anonymize_ip: true });
            ${GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}');` : ''}
          `}</Script>
        </>
      )}

      {/* Google Ads tag — piggybacks on the gtag.js GA loader above,
          but if GA isn't configured we need our own loader. */}
      {!GA_ID && GOOGLE_ADS_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
            strategy="afterInteractive"
          />
          <Script id="gads-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ADS_ID}');
          `}</Script>
        </>
      )}

      {META_PIXEL_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){
          n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window,document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
        `}</Script>
      )}
    </>
  );
}
