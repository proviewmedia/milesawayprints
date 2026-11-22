/**
 * Site navigation: one source for the header, mobile menu, and the
 * "you are here" state. Each link lists the path prefixes it owns.
 */

/** Label for the main call to action. Kept low-commitment on purpose: it
 *  opens /custom, where people see prices or ask for a free quote. */
export const START_LABEL = 'Get started';
export const START_HREF = '/custom';

export interface NavLink {
  href: string;
  label: string;
  /** Path prefixes that count as being "in" this section. */
  match: string[];
}

export const NAV_LINKS: NavLink[] = [
  { href: '/shop', label: 'Print shop', match: ['/shop', '/prints', '/marathons', '/gifts'] },
  { href: '/custom', label: 'Custom printing', match: ['/custom'] },
  { href: '/how-it-works', label: 'How it works', match: ['/how-it-works'] },
  { href: '/resources', label: 'Resources', match: ['/resources'] },
  { href: '/about', label: 'About', match: ['/about'] },
  { href: '/contact', label: 'Contact', match: ['/contact'] },
];

export function isActive(link: NavLink, pathname: string | null): boolean {
  if (!pathname) return false;
  return link.match.some((m) => pathname === m || pathname.startsWith(`${m}/`));
}
