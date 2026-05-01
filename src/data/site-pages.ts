export interface SitePage {
  title: string;
  href: string;
  /** Extra terms to match against, separated by spaces */
  keywords?: string;
  /** Short description shown in search results */
  description?: string;
}

/**
 * Static index of pages indexable by site search.
 * Only include pages that exist (don't list FAQ/Returns until built).
 */
export const SITE_PAGES: SitePage[] = [
  { title: 'Shop all prints', href: '/shop', keywords: 'browse catalog all prints', description: 'Browse the full collection.' },
  { title: 'Golf course prints', href: '/shop?category=golf', keywords: 'golf course tee box pebble augusta', description: 'Browse golf course prints.' },
  { title: 'Stadium prints', href: '/shop?category=stadium', keywords: 'baseball football arena park', description: 'Browse stadium prints.' },
  { title: 'Airport prints', href: '/shop?category=airport', keywords: 'terminal airline iata travel', description: 'Browse airport prints.' },
  { title: 'Marathon prints', href: '/shop?category=marathon', keywords: 'running race route course finish line', description: 'Browse marathon route prints.' },
  { title: 'City street prints', href: '/shop?category=city', keywords: 'street map town home', description: 'Browse city street map prints.' },
  { title: 'About', href: '/about', keywords: 'story mission company', description: 'Why we make prints, and how.' },
  { title: 'How it works', href: '/#how', keywords: 'process steps order delivery', description: 'From idea to wall in four steps.' },
  { title: 'Gifts', href: '/#gift', keywords: 'gift wrap message birthday wedding anniversary', description: 'Make a print into a gift.' },
  { title: 'My account', href: '/account', keywords: 'orders profile shipping address sign in', description: 'Sign in or view your orders.' },
  { title: 'FAQ', href: '/faq', keywords: 'questions help answers', description: 'Common questions answered.' },
  { title: 'Shipping', href: '/shipping', keywords: 'delivery tracking package international customs', description: 'How and when your print arrives.' },
  { title: 'Returns', href: '/returns', keywords: 'refund cancel damaged exchange', description: 'Refunds, replacements, and our made-to-order policy.' },
  { title: 'Contact', href: '/contact', keywords: 'email support help question', description: 'Get in touch.' },
  { title: 'Privacy policy', href: '/privacy', keywords: 'data cookies analytics rights', description: 'How we handle your information.' },
  { title: 'Terms of service', href: '/terms', keywords: 'rules license intellectual property liability', description: 'The rules of using the site.' },
];
