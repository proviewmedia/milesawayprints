/**
 * Custom-order content for The Inq Press: what we print, how, and the
 * choices shown on the quote form. Single source of truth so the homepage
 * grid, /how-it-works, and /custom never drift apart.
 */

export type ProductSlug =
  | 'apparel'
  | 'headwear'
  | 'bags'
  | 'drinkware'
  | 'stickers'
  | 'posters'
  | 'signs'
  | 'promo'
  | 'other';

export interface CustomProduct {
  slug: ProductSlug;
  name: string;
  /** Short examples shown under the name. */
  examples: string;
  /** lucide-react icon name, resolved in the component. */
  icon: 'shirt' | 'hardHat' | 'shoppingBag' | 'coffee' | 'sticker' | 'frame' | 'signpost' | 'gift' | 'sparkles';
}

export const CUSTOM_PRODUCTS: CustomProduct[] = [
  { slug: 'apparel', name: 'Apparel', examples: 'T-shirts, hoodies, crewnecks, polos', icon: 'shirt' },
  { slug: 'headwear', name: 'Hats', examples: 'Caps, trucker hats, beanies', icon: 'hardHat' },
  { slug: 'bags', name: 'Bags and totes', examples: 'Totes, backpacks, pouches', icon: 'shoppingBag' },
  { slug: 'drinkware', name: 'Drinkware', examples: 'Mugs, tumblers, water bottles', icon: 'coffee' },
  { slug: 'stickers', name: 'Stickers and labels', examples: 'Die-cut stickers, labels, decals', icon: 'sticker' },
  { slug: 'posters', name: 'Posters and wall art', examples: 'Posters, fine-art prints, framed art', icon: 'frame' },
  { slug: 'signs', name: 'Signs and banners', examples: 'Banners, yard signs, event signage', icon: 'signpost' },
  { slug: 'promo', name: 'Promo items', examples: 'Keychains, pens, patches, giveaways', icon: 'gift' },
  { slug: 'other', name: 'Something else', examples: 'Tell us what it is and we will find a way', icon: 'sparkles' },
];

// Vercel caps request bodies at 4.5 MB, so uploads are held under that with
// headroom for the text fields. Enforced by both the form and /api/quote.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_FILES = 5;

export const QUANTITY_OPTIONS = [
  '1 to 11',
  '12 to 49',
  '50 to 99',
  '100 to 249',
  '250 or more',
  'Not sure yet',
] as const;

export const ARTWORK_OPTIONS = [
  { value: 'ready', label: 'I have artwork ready', hint: 'Upload it below or paste a link.' },
  { value: 'idea', label: 'I have an idea, not a file', hint: 'Describe it and we will design it with you.' },
  { value: 'help', label: 'I need help with the design', hint: 'Start from scratch with us.' },
] as const;

export type ArtworkStatus = (typeof ARTWORK_OPTIONS)[number]['value'];

export interface DecorationMethod {
  name: string;
  bestFor: string;
  description: string;
}

/**
 * Plain-language decoration methods. No minimums or prices here on purpose:
 * those depend on the product and production partner, so they live in the
 * quote, not on the page.
 */
export const DECORATION_METHODS: DecorationMethod[] = [
  {
    name: 'Screen printing',
    bestFor: 'Larger runs of shirts and totes',
    description: 'Ink pressed through a screen, one color at a time. Bold, durable, and the best price per piece as quantities go up.',
  },
  {
    name: 'Direct to garment (DTG)',
    bestFor: 'Small runs and full-color designs',
    description: 'Printed straight onto the fabric like a photo printer. Great for detailed artwork and one-off pieces.',
  },
  {
    name: 'DTF transfers',
    bestFor: 'Full color on almost any fabric',
    description: 'Your design is printed on film and heat-pressed on. Works on cotton, polyester, blends, and darker colors.',
  },
  {
    name: 'Embroidery',
    bestFor: 'Hats, polos, and jackets',
    description: 'Stitched with thread for a premium, textured finish that lasts. Best for logos and simple shapes.',
  },
  {
    name: 'Sublimation',
    bestFor: 'All-over prints and drinkware',
    description: 'Ink is dyed into the material so it will not crack or peel. Used on polyester, mugs, and hard goods.',
  },
  {
    name: 'Fine-art printing',
    bestFor: 'Posters and wall art',
    description: 'Archival giclee printing on museum-quality paper. The same process behind our print collection.',
  },
];

export const ARTWORK_GUIDELINES = [
  { title: 'Best file types', body: 'Vector files (AI, EPS, SVG, PDF) print the sharpest. High-resolution PNG or JPG works too.' },
  { title: 'Resolution', body: 'For image files, aim for 300 DPI at the size it will print.' },
  { title: 'No file yet?', body: 'A sketch, a photo, or a description is enough to start. We can design it with you.' },
  { title: 'Large files', body: 'Uploads are limited to 4 MB in total. For bigger files, paste a Google Drive, Dropbox, or WeTransfer link.' },
];

export const CUSTOM_FAQS = [
  {
    q: 'Is there a minimum order?',
    a: 'It depends on the product and the print method. Many items can be made as a single piece. Tell us your quantity and we will recommend the best option for it.',
  },
  {
    q: 'How much does it cost?',
    a: 'Price depends on the product, quantity, number of colors, and print method. Quotes are free, and you will see the full price before anything is printed.',
  },
  {
    q: 'How long does it take?',
    a: 'It depends on the product and quantity, and your quote includes a delivery estimate. If you have a deadline, add it to your request and we will tell you upfront whether we can meet it.',
  },
  {
    q: 'Do I need to have a design?',
    a: 'No. Send a sketch, a photo, or just an idea, and we will create the design with you.',
  },
  {
    q: 'Will I see a proof first?',
    a: 'Yes. You get a digital proof showing exactly how your item will look. Nothing is printed until you approve it.',
  },
  {
    q: 'Do you have a store I can visit?',
    a: 'We are an online studio, so everything happens by email, and your finished order ships to you.',
  },
];
