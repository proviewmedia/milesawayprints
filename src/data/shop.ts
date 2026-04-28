import { PrintType, GalleryItem } from './prints';

export interface DesignSummary {
  id?: string;
  slug: string;
  name: string;
  location: string;
  type: PrintType;
  description?: string;
  tags?: string[];
  values: Record<string, string>;
  image_url?: string;
  room_mockup_url?: string;
  printful_product_id?: string;
  printful_variants?: Record<string, number>;
  printful_prices?: Record<string, number>; // cents
  digital_price_cents?: number | null;
}

/** Default digital download price (cents) when a design has no override. */
export const DEFAULT_DIGITAL_PRICE_CENTS = 1200;

/** Returns available physical sizes for a design, in a sensible display order */
export function getPhysicalSizes(design: DesignSummary): string[] {
  const order = ['5x7', '8x10', '11x14', '12x16', '12x18', '16x20', '18x24', '20x30', '24x36'];
  const keys = Object.keys(design.printful_prices ?? design.printful_variants ?? {});
  return keys.sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

/** Price in cents for a given format+size */
export function priceCentsFor(design: DesignSummary, format: 'digital' | 'physical', size: string): number {
  if (format === 'digital') {
    return design.digital_price_cents ?? DEFAULT_DIGITAL_PRICE_CENTS;
  }
  return design.printful_prices?.[size] ?? 0;
}

export function formatSize(size: string): string {
  // "11x14" -> "11×14\""
  const [w, h] = size.split('x');
  return `${w}×${h}"`;
}

export interface Collection {
  id?: string;
  slug: string;
  name: string;
  description?: string;
  hero_image_url?: string;
  designs: DesignSummary[];
}

export type GalleryItemWithMeta = GalleryItem & {
  slug?: string;
  description?: string;
  tags?: string[];
  room_mockup_url?: string;
  print_type_slug?: PrintType;
  printful_product_id?: string;
  printful_variants?: Record<string, number>;
  printful_prices?: Record<string, number>;
  digital_price_cents?: number | null;
};

/** Turn a DB gallery_items row into a DesignSummary for the UI */
export function toDesignSummary(item: GalleryItemWithMeta, fallbackType?: PrintType): DesignSummary {
  const type = (item.print_type_slug ?? fallbackType) as PrintType;
  return {
    id: item.id,
    slug: item.slug ?? slugifyFallback(item.name),
    name: item.name,
    location: item.location,
    type,
    description: item.description,
    tags: item.tags,
    values: item.values ?? {},
    image_url: item.image_url,
    room_mockup_url: item.room_mockup_url,
    printful_product_id: item.printful_product_id,
    printful_variants: item.printful_variants,
    printful_prices: item.printful_prices,
    digital_price_cents: item.digital_price_cents,
  };
}

function slugifyFallback(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
