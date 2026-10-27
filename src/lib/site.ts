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
export const SITE_NAME = 'The Inq Press';
// TODO(domain cutover): switch SITE_URL to https://www.theinqpress.com only
// after theinqpress.com serves this deployment on Vercel and milesawayprints.com
// 301-redirects to it. Switching early points every canonical at a parked page.
