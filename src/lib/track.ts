/**
 * Multi-platform e-commerce event tracking. Fires the same conceptual
 * event into every configured platform (GA4, Meta Pixel, Google Ads)
 * using each platform's native event name. Safe to call from anywhere
 * client-side — no-ops in SSR and when platforms aren't loaded.
 *
 * Server-side equivalents (Meta CAPI, Google Enhanced Conversions) for
 * `purchase` are fired from the Stripe webhook so attribution survives
 * ad-blockers.
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
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag(...args);
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
