/**
 * Canonical production origin — the single source of truth for absolute URLs
 * (canonical tags, OG/Twitter metadata, sitemap, Merchant feed, email links).
 *
 * The apex (milesawayprints.com) 307-redirects to www, so www is the host that
 * actually serves 200. Using anything else here produces redirect hops that
 * split canonical signals and trip Merchant Center warnings — so everything
 * imports SITE_URL from here rather than hardcoding a host.
 */
export const SITE_URL = 'https://www.milesawayprints.com';
export const SITE_NAME = 'Miles Away Prints';
