import type { PrintType } from './prints';

/**
 * Custom art prints: the customer names a place we have not made yet, picks a
 * size, and pays at checkout. We design it, send a proof, and fulfill it by
 * hand (it is never auto-submitted to Printful). Prices match the custom
 * listings on the Etsy shop (CUSTOM_PRINT_PRICES below) and are charged
 * server-side by /api/checkout from the same table.
 *
 * Marathon here means a race we do not have a template for. Races we do have
 * (Las Vegas, Chicago) keep their own customizer at /marathons/[slug].
 */
export interface CustomPrintTypeConfig {
  type: Extract<PrintType, 'golf' | 'airport' | 'marathon' | 'city' | 'stadium' | 'skyline' | 'f1'>;
  label: string;
  /** Label and placeholder for the "which place" field. */
  placeLabel: string;
  placePlaceholder: string;
  /** Optional details prompt, specific to the print type. */
  detailsPlaceholder: string;
}

export const CUSTOM_PRINT_TYPES: CustomPrintTypeConfig[] = [
  {
    type: 'golf',
    label: 'Golf course',
    placeLabel: 'Course name and city',
    placePlaceholder: 'Shadow Creek, Las Vegas, NV',
    detailsPlaceholder: 'Front nine only, a hole to highlight, a member name, a date...',
  },
  {
    type: 'airport',
    label: 'Airport',
    placeLabel: 'Airport name or code',
    placePlaceholder: 'LAS, Harry Reid International',
    detailsPlaceholder: 'A first solo flight date, a tail number, text you want on it...',
  },
  {
    type: 'marathon',
    label: 'Marathon',
    placeLabel: 'Race and year',
    placePlaceholder: 'Vancouver Marathon 2026',
    detailsPlaceholder: 'Runner name, bib number, finish time, full or half, landmarks to include...',
  },
  {
    type: 'city',
    label: 'City map',
    placeLabel: 'City or neighborhood',
    placePlaceholder: 'Brooklyn, New York',
    detailsPlaceholder: 'A street to center on, a pin for your home, coordinates...',
  },
  {
    type: 'stadium',
    label: 'Stadium',
    placeLabel: 'Stadium or team',
    placePlaceholder: 'Allegiant Stadium, Las Vegas Raiders',
    detailsPlaceholder: 'A seat or section, a game date, a score, a name...',
  },
  {
    type: 'skyline',
    label: 'Skyline',
    placeLabel: 'City',
    placePlaceholder: 'San Juan, Puerto Rico',
    detailsPlaceholder: 'Landmarks to include, text under the skyline...',
  },
  {
    type: 'f1',
    label: 'F1 circuit',
    placeLabel: 'Circuit or race',
    placePlaceholder: 'Circuit of the Americas',
    detailsPlaceholder: 'A race year, a driver, a lap time...',
  },
];

export type CustomPrintType = CustomPrintTypeConfig['type'];

export function getCustomPrintType(type: string | null | undefined): CustomPrintTypeConfig | undefined {
  return CUSTOM_PRINT_TYPES.find((t) => t.type === type);
}

/** Marker stored in CartItem.customization so checkout, the webhook, and the
 *  admin can recognize a custom print without a new print_types row. */
export const CUSTOM_PRINT_FLAG = 'custom_print';

export interface CustomPrintCustomization {
  custom_print: 'true';
  custom_type: CustomPrintType;
  place: string;
  details: string;
}

export function isCustomPrintItem(item: {
  customization?: Record<string, unknown> | null;
}): boolean {
  return item.customization?.[CUSTOM_PRINT_FLAG] === 'true';
}

/** Sizes sorted small to large by area, so mixed size ladders (8x10 and
 *  8x12, 11x14 and 11x17) still read in a sensible order. */
export function sortSizes(sizes: string[]): string[] {
  const area = (s: string) => {
    const [w, h] = s.split('x').map(Number);
    return (w || 0) * (h || 0);
  };
  return [...sizes].sort((a, b) => area(a) - area(b));
}

/** Pricing payload passed from the server to the builder: type -> size -> cents. */
export type CustomPrintPricing = Partial<Record<CustomPrintType, Record<string, number>>>;

/** Print prices in cents, shipping included, matching the custom listings on
 *  etsy.com/shop/TheInqPress (Nov 2026). Skyline and F1 have no Etsy listing
 *  and use the base ladder shared by city, stadium, and marathon. */
const BASE_LADDER: Record<string, number> = {
  '8x10': 3200,
  '11x14': 3400,
  '12x16': 3600,
  '12x18': 3800,
  '16x20': 4000,
  '18x24': 4200,
  '24x36': 4400,
};

export const CUSTOM_PRINT_PRICES: Record<CustomPrintType, Record<string, number>> = {
  golf: { '8x10': 4300, '11x14': 4500, '12x16': 4700, '12x18': 4800, '16x20': 4900, '18x24': 5100, '24x36': 5300 },
  airport: { '8x10': 3800, '11x14': 4000, '12x16': 4200, '12x18': 4200, '16x20': 4400, '18x24': 4600, '24x36': 4800 },
  marathon: BASE_LADDER,
  city: BASE_LADDER,
  stadium: BASE_LADDER,
  skyline: BASE_LADDER,
  f1: BASE_LADDER,
};

/** Digital file prices in cents: one flat price for any size, matching the
 *  Digital option on the Etsy custom listings (Nov 2026: golf $30, airport,
 *  marathon, city and stadium $25). Skyline and F1 follow the $25 listings.
 *  The file is designed by hand like a print, so it is emailed after the
 *  customer approves the proof (never an instant download). */
export const CUSTOM_DIGITAL_PRICES: Record<CustomPrintType, number> = {
  golf: 3000,
  airport: 2500,
  marathon: 2500,
  city: 2500,
  stadium: 2500,
  skyline: 2500,
  f1: 2500,
};

/** A custom map print bought as a digital file (not "your artwork"). */
export function isCustomDigitalItem(item: {
  format?: string;
  customization?: Record<string, unknown> | null;
}): boolean {
  return item.format === 'digital' && isCustomPrintItem(item) && item.customization?.custom_type !== ARTWORK_TYPE;
}

export const MAX_PLACE_LENGTH = 120;
export const MAX_DETAILS_LENGTH = 600;

// ────────────────────────────────────────────────────────────────────────────
// Your own artwork or photo, printed. Same flag and fulfillment path as map
// art (manual, never auto-sent to Printful) so the file can be checked first.
// ────────────────────────────────────────────────────────────────────────────

export const ARTWORK_TYPE = 'artwork';

/** Shop print prices (cents): no design work, so the ready-made shop ladder. */
export const ARTWORK_PRINT_PRICES: Record<string, number> = {
  '5x7': 2800,
  '8x10': 3000,
  '11x14': 3200,
  '12x16': 3400,
  '12x18': 3600,
  '16x20': 3800,
  '18x24': 4000,
  '24x36': 4200,
};

export const ARTWORK_MAX_BYTES = 50 * 1024 * 1024;
export const ARTWORK_ACCEPT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/tiff': 'tif',
  'application/pdf': 'pdf',
};
export const ARTWORK_BUCKET = 'customer-uploads';
export const ARTWORK_PREFIX = 'artwork/';

/** Orders of this many prints or more go to a quote instead. */
export const BULK_PRINT_THRESHOLD = 10;

export function isArtworkItem(item: { customization?: Record<string, unknown> | null }): boolean {
  return isCustomPrintItem(item) && item.customization?.custom_type === ARTWORK_TYPE;
}

/** Lowest price in a ladder, in whole dollars, for "From $X" labels. */
export function fromPrice(ladder: Record<string, number>): number {
  return Math.round(Math.min(...Object.values(ladder)) / 100);
}
