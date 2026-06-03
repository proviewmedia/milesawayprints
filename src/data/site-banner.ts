/**
 * Sitewide announcement banner shown at the top of every page when active
 * AND the current date is within the [startDate, endDate] window.
 *
 * To run a new promotion, edit this file and ship — no DB migration.
 */
export interface SiteBannerConfig {
  /** Master switch. Set to false to hide regardless of dates. */
  active: boolean;
  /** Banner copy. Keep under ~120 chars to avoid wrapping on mobile. */
  message: string;
  /** Optional CTA link target (e.g., '/gifts/fathers-day'). */
  link?: string;
  /** YYYY-MM-DD inclusive start. */
  startDate?: string;
  /** YYYY-MM-DD inclusive end. */
  endDate?: string;
}

export const SITE_BANNER: SiteBannerConfig = {
  active: true,
  message:
    "Father's Day — order by June 12 for arrival. 10% off your first print at checkout.",
  link: '/gifts/fathers-day',
  startDate: '2026-05-18',
  endDate: '2026-06-12',
};

/** Whether the banner should render given the current date. */
export function isSiteBannerActive(now = new Date()): boolean {
  const cfg = SITE_BANNER;
  if (!cfg.active) return false;
  const today = now.toISOString().slice(0, 10); // YYYY-MM-DD
  if (cfg.startDate && today < cfg.startDate) return false;
  if (cfg.endDate && today > cfg.endDate) return false;
  return true;
}
