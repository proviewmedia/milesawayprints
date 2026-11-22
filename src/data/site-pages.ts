import { GUIDES } from './resources';

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
  { title: 'Custom printing', href: '/custom', keywords: 'get started order custom quote free quote shirts hats stickers merch apparel bags drinkware signs promo bulk one-off single item printing services what we print', description: 'Order prints online or get a free quote on anything else.' },
  { title: 'Custom map art print', href: '/custom?start=map', keywords: 'custom golf course airport marathon city stadium skyline f1 map print personalized my place', description: 'We design a print of your place. From $32.' },
  { title: 'Print your own artwork or photo', href: '/custom?start=artwork', keywords: 'upload photo picture artwork design poster print my own file', description: 'Upload a file, pick a size, and order. From $28.' },
  { title: 'How custom orders work', href: '/how-it-works', keywords: 'process proof print methods screen printing embroidery dtg artwork', description: 'Quote, proof, print, ship.' },
  { title: 'Printing guides and resources', href: '/resources', keywords: 'learn guide print methods where to print artwork dpi shirts paper glossary', description: 'Free guides for getting something printed.' },
  { title: 'Print size calculator', href: '/resources/print-size-calculator', keywords: 'dpi resolution pixels how big can i print image size calculator', description: 'How large your image can print sharp.' },
  ...GUIDES.map((g) => ({ title: g.title, href: `/resources/${g.slug}`, keywords: g.category.toLowerCase(), description: g.summary })),
  { title: 'Shop all prints', href: '/shop', keywords: 'browse catalog all prints', description: 'Browse the full collection.' },
  { title: 'Golf course prints', href: '/prints/golf', keywords: 'golf course tee box pebble augusta', description: 'Browse golf course prints.' },
  { title: 'Stadium prints', href: '/prints/stadium', keywords: 'baseball football arena park', description: 'Browse stadium prints.' },
  { title: 'Airport prints', href: '/prints/airport', keywords: 'terminal airline iata travel', description: 'Browse airport prints.' },
  { title: 'Marathon prints', href: '/prints/marathon', keywords: 'running race route course finish line', description: 'Browse marathon route prints.' },
  { title: 'City street prints', href: '/prints/city', keywords: 'street map town home', description: 'Browse city street map prints.' },
  { title: 'Skyline prints', href: '/prints/skyline', keywords: 'skyline city buildings downtown', description: 'Browse skyline prints.' },
  { title: 'F1 circuit prints', href: '/prints/f1', keywords: 'formula 1 f1 race track circuit grand prix', description: 'Browse F1 circuit prints.' },
  { title: 'About', href: '/about', keywords: 'story mission company', description: 'Why we make prints, and how.' },
  { title: 'Gifts', href: '/gifts', keywords: 'gift wrap message birthday wedding anniversary', description: 'Make a print into a gift.' },
  { title: 'My account', href: '/account', keywords: 'orders profile shipping address sign in', description: 'Sign in or view your orders.' },
  { title: 'FAQ', href: '/faq', keywords: 'questions help answers', description: 'Common questions answered.' },
  { title: 'Shipping', href: '/shipping', keywords: 'delivery tracking package international customs', description: 'How and when your print arrives.' },
  { title: 'Returns', href: '/returns', keywords: 'refund cancel damaged exchange', description: 'Refunds, replacements, and our made-to-order policy.' },
  { title: 'Contact', href: '/contact', keywords: 'email support help question', description: 'Get in touch.' },
  { title: 'Privacy policy', href: '/privacy', keywords: 'data cookies analytics rights', description: 'How we handle your information.' },
  { title: 'Terms of service', href: '/terms', keywords: 'rules license intellectual property liability', description: 'The rules of using the site.' },
];
