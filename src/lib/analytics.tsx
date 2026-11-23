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
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === 'all' || v === 'essentials' ? v : null;
  } catch {
    return null;
  }
}

const GOOGLE_TAG_ID = GA_ID ?? GOOGLE_ADS_ID;

/**
 * Loads gtag.js for everyone (consent mode keeps it cookieless until
 * accepted), relays banner choices to Google, and loads the Meta pixel
 * only after "Accept all".
 */
export default function Analytics() {
  const [consent, setConsent] = useState<ConsentValue>(null);

  useEffect(() => {
    const sync = () => {
      const next = readConsent();
      setConsent(next);
      const state = next === 'all' ? 'granted' : 'denied';
      window.gtag?.('consent', 'update', {
        analytics_storage: state,
        ad_storage: state,
        ad_user_data: state,
        ad_personalization: state,
      });
    };
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('cookie-consent-change', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('cookie-consent-change', sync);
    };
  }, []);

  return (
    <>
      {GOOGLE_TAG_ID && (
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}`} strategy="afterInteractive" />
      )}

      {consent === 'all' && META_PIXEL_ID && (
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
