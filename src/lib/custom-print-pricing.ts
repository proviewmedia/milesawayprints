import { CUSTOM_PRINT_PRICES, type CustomPrintPricing } from '@/data/custom-prints';

/**
 * Prices for custom prints: the fixed table in src/data/custom-prints.ts,
 * which matches the Etsy custom listings. Used by the builder page (to show
 * prices) and by /api/checkout (to charge them), so the customer is always
 * charged the number they saw.
 */
export function getCustomPrintPricing(): CustomPrintPricing {
  return CUSTOM_PRINT_PRICES;
}
