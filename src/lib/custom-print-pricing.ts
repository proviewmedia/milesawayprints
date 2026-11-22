import type { SupabaseClient } from '@supabase/supabase-js';
import { CUSTOM_PRINT_TYPES, type CustomPrintPricing, type CustomPrintType } from '@/data/custom-prints';

/**
 * Prices for custom prints, derived from the live shop: for each print type
 * and size, the price most designs of that type are listed at. A custom golf
 * 16x20 therefore always costs what a golf 16x20 in the shop costs. Types with
 * no active designs (and so no price ladder) are left out and can't be ordered.
 *
 * Used by the builder page (to show prices) and by /api/checkout (to charge
 * them), so the customer is always charged the number they saw.
 */
export async function getCustomPrintPricing(admin: SupabaseClient): Promise<CustomPrintPricing> {
  const types = CUSTOM_PRINT_TYPES.map((t) => t.type);
  const { data, error } = await admin
    .from('gallery_items')
    .select('print_type_slug, printful_prices')
    .eq('active', true)
    .in('print_type_slug', types);
  if (error) throw new Error(`custom print pricing: ${error.message}`);

  // type -> size -> price -> how many designs use it
  const tally = new Map<string, Map<string, Map<number, number>>>();
  for (const row of (data ?? []) as { print_type_slug: string; printful_prices: Record<string, number> | null }[]) {
    for (const [size, cents] of Object.entries(row.printful_prices ?? {})) {
      if (typeof cents !== 'number' || cents <= 0) continue;
      const bySize = tally.get(row.print_type_slug) ?? new Map();
      const byPrice = bySize.get(size) ?? new Map<number, number>();
      byPrice.set(cents, (byPrice.get(cents) ?? 0) + 1);
      bySize.set(size, byPrice);
      tally.set(row.print_type_slug, bySize);
    }
  }

  const pricing: CustomPrintPricing = {};
  tally.forEach((bySize, type) => {
    const sizes: Record<string, number> = {};
    bySize.forEach((byPrice, size) => {
      // Most common price wins; ties go to the higher price so a one-off
      // sale price on a single design never becomes the custom price.
      let best = 0;
      let bestCount = 0;
      byPrice.forEach((count, cents) => {
        if (count > bestCount || (count === bestCount && cents > best)) {
          best = cents;
          bestCount = count;
        }
      });
      sizes[size] = best;
    });
    pricing[type as CustomPrintType] = sizes;
  });
  return pricing;
}
