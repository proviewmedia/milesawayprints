export type MarathonVariant = 'full' | 'half';

/** Placeholder text values inside the source SVGs. We swap these by exact
 *  text match so the same SVG drives both the live preview and the
 *  server-side rendered print file. Lives in a client-safe module so the
 *  customizer can import without pulling in Node fs APIs. */
export const SVG_PLACEHOLDERS = {
  variantLabelFull: 'M A R A T H O N',
  variantLabelHalf: 'H A L F  M A R A T H O N',
  distanceFull: '26.2',
  distanceHalf: '13.1',
  finishTime: '02:30:22',
  bib: '#11456',
  name: 'John Doe',
  date: '01 · 10 · 27',
} as const;

export interface MarathonRow {
  id: string;
  slug: string;
  city: string;
  country: string;
  full_svg_path: string | null;
  half_svg_path: string | null;
  printful_catalog_variants: Record<string, number>;
  printful_prices: Record<string, number>;
  active: boolean;
  sort_order: number;
}

export interface MarathonCustomization extends Record<string, string> {
  marathon_slug: string;
  variant: MarathonVariant;
  bib: string;
  first_name: string;
  last_name: string;
  race_date: string;
  finish_time: string;
}

export const MARATHON_SIZES: { value: string; label: string }[] = [
  { value: '8x10', label: '8 × 10' },
  { value: '11x14', label: '11 × 14' },
  { value: '12x16', label: '12 × 16' },
  { value: '16x20', label: '16 × 20' },
  { value: '18x24', label: '18 × 24' },
  { value: '24x36', label: '24 × 36' },
];

export function formatMarathonName(c: MarathonCustomization, city: string): string {
  const variantLabel = c.variant === 'half' ? 'Half Marathon' : 'Marathon';
  const runner = `${c.first_name} ${c.last_name}`.trim();
  return runner ? `${city} ${variantLabel} — ${runner}` : `${city} ${variantLabel}`;
}

/** Format a YYYY-MM-DD date as "DD · MM · YY" to match the SVG placeholder. */
export function formatRaceDate(iso: string): string {
  if (!iso) return '01 · 10 · 27';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d} · ${m} · ${y.slice(-2)}`;
}
