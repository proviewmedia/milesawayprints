import type { Metadata } from 'next';
import Script from 'next/script';
import { Suspense } from 'react';
import './globals.css';
import { CartProvider } from '@/contexts/CartContext';
import { SearchProvider } from '@/contexts/SearchContext';
import CartDrawer from '@/components/CartDrawer';
import SearchOverlay from '@/components/SearchOverlay';
import CookieBanner from '@/components/CookieBanner';
import SiteBanner from '@/components/SiteBanner';
import FirstVisitPopup from '@/components/FirstVisitPopup';
import WelcomeCodeStasher from '@/components/WelcomeCodeStasher';
import Analytics from '@/lib/analytics';

import { organizationJsonLd, websiteJsonLd } from '@/lib/seo';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Miles Away Prints | Custom Location Art Prints',
    template: '%s | Miles Away Prints',
  },
  description:
    'Custom art prints of stadiums, airports, marathon routes, city streets, and golf courses. Personalized with your location, name, and details. Digital downloads and museum-quality physical prints.',
  keywords: [
    'custom prints',
    'stadium art',
    'airport map print',
    'marathon print',
    'golf course print',
    'city map print',
    'skyline print',
    'F1 circuit print',
    'personalized art',
    'custom wall art',
  ],
  authors: [{ name: 'Miles Away Prints' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Miles Away Prints',
    title: 'Miles Away Prints | Custom Location Art Prints',
    description:
      'Custom art prints of stadiums, airports, marathon routes, city streets, and golf courses. Personalized and delivered your way.',
    images: [
      { url: '/api/og/home', width: 1200, height: 630, alt: 'Miles Away Prints' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Miles Away Prints | Custom Location Art Prints',
    description: 'Custom art prints of stadiums, airports, marathon routes, city streets, and golf courses.',
    images: ['/api/og/home'],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: 'o4iN1jfruzobn47dZjyPjGotL46-QNF_sSOTtylVb8k',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white min-h-screen">
        <Script
          id="org-jsonld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <Script
          id="website-jsonld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
        {/* Skip-to-content link — visually hidden until focused via
            keyboard. Required by WCAG 2.1 Level A so keyboard-only
            users can bypass the navbar + filter chips on every page. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-ink focus:text-paper focus:px-4 focus:py-2 focus:rounded-md focus:text-sm focus:font-medium focus:no-underline"
        >
          Skip to main content
        </a>

        <CartProvider>
          <SearchProvider>
            <SiteBanner />
            <div id="main-content">{children}</div>
            <CartDrawer />
            <SearchOverlay />
            <CookieBanner />
            <FirstVisitPopup />
            <Suspense fallback={null}>
              <WelcomeCodeStasher />
            </Suspense>
            <Analytics />
          </SearchProvider>
        </CartProvider>

        {/* Google Customer Reviews — sitewide rating badge. platform.js
            auto-renders any <g:ratingbadge merchant_id="…"> element on the
            page (currently: the footer). The badge shows the seller star
            rating once Google has ~100 verified survey responses; until then
            it quietly renders nothing. NB: do NOT add ?onload=renderBadge —
            there's no such global, so it throws a ReferenceError and the
            custom-element auto-render is what we actually rely on. */}
        <Script
          id="gcr-platform"
          src="https://apis.google.com/js/platform.js"
          strategy="afterInteractive"
          async
          defer
        />
      </body>
    </html>
  );
}
