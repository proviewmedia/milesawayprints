import Script from 'next/script';

// Server-safe on purpose: beforeInteractive scripts must be rendered from
// the root layout, not from a client component.
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
const GOOGLE_TAG_ID = GA_ID ?? GOOGLE_ADS_ID;
const CONSENT_KEY = 'cookie-consent';

/**
 * Google Consent Mode v2 bootstrap. Rendered from the root layout with
 * strategy="beforeInteractive" so `window.gtag` exists before any page
 * code runs: events fired early (purchase on the success page, view_item)
 * queue in dataLayer instead of being dropped.
 *
 * Storage defaults to denied. Until the visitor accepts cookies, GA only
 * receives cookieless pings (no cookies set, no ad data). Choosing
 * "Accept all" in the cookie banner upgrades consent.
 */
export function GoogleTagBootstrap() {
  if (!GOOGLE_TAG_ID) return null;
  return (
    <Script id="gtag-consent" strategy="beforeInteractive">{`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      var granted = false;
      try { granted = localStorage.getItem('${CONSENT_KEY}') === 'all'; } catch (e) {}
      var state = granted ? 'granted' : 'denied';
      gtag('consent', 'default', {
        analytics_storage: state,
        ad_storage: state,
        ad_user_data: state,
        ad_personalization: state,
        wait_for_update: 500
      });
      gtag('js', new Date());
      ${GA_ID ? `gtag('config', '${GA_ID}');` : ''}
      ${GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}');` : ''}
    `}</Script>
  );
}

