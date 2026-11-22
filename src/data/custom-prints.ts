import type { PrintType } from './prints';

/**
 * Custom art prints: the customer names a place we have not made yet, picks a
 * size, and pays at checkout. We design it, send a proof, and fulfill it by
 * hand (it is never auto-submitted to Printful). Sizes and prices mirror the
 * live shop for the same print type, resolved server-side in
 * src/lib/custom-print-pricing.ts so the two can never drift apart.
 *
 * Marathons are not here on purpose: they have their own customizer.
 */
export interface CustomPrintTypeConfig {
  type: Extract<PrintType, 'golf' | 'airport' | 'city' | 'skyline' | 'f1'>;
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
    type: 'city',
    label: 'City map',
    placeLabel: 'City or neighborhood',
    placePlaceholder: 'Brooklyn, New York',
    detailsPlaceholder: 'A street to center on, a pin for your home, coordinates...',
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

export const MAX_PLACE_LENGTH = 120;
export const MAX_DETAILS_LENGTH = 600;
