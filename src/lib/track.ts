/**
 * Multi-platform e-commerce event tracking. Fires the same conceptual
 * event into every configured platform (GA4, Meta Pixel, Google Ads)
 * using each platform's native event name. Safe to call from anywhere
 * client-side — no-ops in SSR and when platforms aren't loaded.
 *
 * Google events always reach dataLayer: the consent-mode bootstrap in the
 * root layout (src/lib/google-tag.tsx) defines window.gtag before page code
 * runs, and gtag() below falls back to pushing onto dataLayer directly, so
 * nothing fired early (e.g. purchase on the success page) is lost.
 * There is no server-side tracking yet.
 */

interface TrackItem {
  id: string;
  name: string;
  /** "Skyline", "Marathon", etc. — feeds GA4's item_category. */
  category?: string;
  /** Per-unit price in dollars (not cents). */
  price: number;
  quantity: number;
  /** Optional size variant, e.g. "12x16". Feeds GA4's item_variant. */
  variant?: string;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

function gtag(...args: unknown[]) {
  if (typeof window === 'undefined') return;
  if (window.gtag) {
    window.gtag(...args);
    return;
  }
  // gtag.js not configured or not loaded yet: queue in the same format it
  // reads on load.
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  (function () {
    w.dataLayer!.push(arguments);
  }).apply(null, args as []);
}

function fbq(...args: unknown[]) {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq(...args);
}

export function trackViewItem(items: TrackItem[], valueUsd: number) {
  gtag('event', 'view_item', {
    currency: 'USD',
    value: valueUsd,
    items: items.map(toGa4Item),
  });
  fbq('track', 'ViewContent', {
    content_ids: items.map((i) => i.id),
    content_type: 'product',
    currency: 'USD',
    value: valueUsd,
  });
}

export function trackAddToCart(items: TrackItem[], valueUsd: number) {
  gtag('event', 'add_to_cart', {
    currency: 'USD',
    value: valueUsd,
    items: items.map(toGa4Item),
  });
  fbq('track', 'AddToCart', {
    content_ids: items.map((i) => i.id),
    content_type: 'product',
    currency: 'USD',
    value: valueUsd,
  });
}

export function trackBeginCheckout(items: TrackItem[], valueUsd: number) {
  gtag('event', 'begin_checkout', {
    currency: 'USD',
    value: valueUsd,
    items: items.map(toGa4Item),
  });
  fbq('track', 'InitiateCheckout', {
    content_ids: items.map((i) => i.id),
    content_type: 'product',
    currency: 'USD',
    value: valueUsd,
    num_items: items.reduce((n, i) => n + i.quantity, 0),
  });
}

/**
 * Client-side purchase event. Fires from the success page. The Stripe
 * webhook also fires server-side equivalents (Meta CAPI / Google
 * Enhanced Conversions) so attribution doesn't depend on the browser.
 */
export function trackPurchase(args: {
  orderId: string;
  items: TrackItem[];
  valueUsd: number;
  taxUsd?: number;
  shippingUsd?: number;
}) {
  gtag('event', 'purchase', {
    transaction_id: args.orderId,
    value: args.valueUsd,
    tax: args.taxUsd,
    shipping: args.shippingUsd,
    currency: 'USD',
    items: args.items.map(toGa4Item),
  });
  fbq('track', 'Purchase', {
    content_ids: args.items.map((i) => i.id),
    content_type: 'product',
    currency: 'USD',
    value: args.valueUsd,
  });
}

function toGa4Item(i: TrackItem) {
  return {
    item_id: i.id,
    item_name: i.name,
    item_category: i.category,
    item_variant: i.variant,
    price: i.price,
    quantity: i.quantity,
  };
}

/** A quote request or contact message: the main conversion for custom
 *  printing. Mark generate_lead as a key event in GA4. */
export function trackLead(args: { form: 'quote' | 'contact'; products?: string[]; quantity?: string }) {
  gtag('event', 'generate_lead', {
    form: args.form,
    products: args.products?.join(','),
    quantity: args.quantity,
  });
  fbq('track', 'Lead', { content_category: args.form });
}

/** Newsletter or welcome-offer signup. */
export function trackSignUp(source: string) {
  gtag('event', 'sign_up', { method: 'email', source });
  fbq('track', 'CompleteRegistration', { content_name: source });
}
