/**
 * Carrier-aware tracking URL builder. Best-effort only — we cover
 * the carriers Printful uses most. For unknown carriers we return
 * null and the UI falls back to plain text + copy-to-clipboard.
 */

export interface TrackingHints {
  /** Tracking number from the carrier */
  tracking?: string | null;
  /** Free-form carrier name from the Printful webhook (e.g. "USPS", "DHL Express") */
  carrier?: string | null;
  /** Pre-built URL from Printful, when supplied */
  trackingUrl?: string | null;
}

/**
 * Returns a best-effort URL the customer can click to see live
 * tracking. Prefers any URL the carrier itself supplied via the
 * Printful webhook; otherwise builds one from carrier + number.
 */
export function trackingUrlFor({ tracking, carrier, trackingUrl }: TrackingHints): string | null {
  if (trackingUrl) return trackingUrl;
  if (!tracking) return null;

  const c = (carrier ?? '').toLowerCase();
  const num = encodeURIComponent(tracking);

  if (c.includes('usps')) return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${num}`;
  if (c.includes('ups')) return `https://www.ups.com/track?tracknum=${num}`;
  if (c.includes('fedex')) return `https://www.fedex.com/fedextrack/?trknbr=${num}`;
  if (c.includes('dhl')) return `https://www.dhl.com/global-en/home/tracking.html?tracking-id=${num}`;
  if (c.includes('royal mail')) return `https://www.royalmail.com/track-your-item#/tracking-results/${num}`;
  if (c.includes('canada post') || c.includes('canadapost')) {
    return `https://www.canadapost.ca/track-reperage/en#/details/${num}`;
  }
  if (c.includes('australia post') || c.includes('auspost')) {
    return `https://auspost.com.au/mypost/track/#/details/${num}`;
  }

  return null;
}
