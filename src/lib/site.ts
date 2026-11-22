/**
 * Canonical production origin — the single source of truth for absolute URLs
 * (canonical tags, OG/Twitter metadata, sitemap, Merchant feed, email links).
 *
 * The apex (theinqpress.com) redirects to www, so www is the host that
 * actually serves 200. Using anything else here produces redirect hops that
 * split canonical signals and trip Merchant Center warnings — so everything
 * imports SITE_URL from here rather than hardcoding a host.
 */
export const SITE_URL = 'https://www.theinqpress.com';
export const SITE_NAME = 'The INQ Press';

/**
 * Former domain. Every page request to these hosts 301-redirects path-for-path
 * to SITE_URL (see middleware.ts) so the old sitemap, Merchant feed, backlinks
 * and Search Console history carry over. /api/* is NOT redirected: Stripe and
 * Printful webhooks are registered on the old host and do not follow redirects.
 */
export const LEGACY_HOSTS = ['milesawayprints.com', 'www.milesawayprints.com'];
