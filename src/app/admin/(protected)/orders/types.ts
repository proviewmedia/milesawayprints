import type { MarathonCustomization } from '@/data/marathons';

export interface CartSnapshotItem {
  slug: string;
  type: string;
  format: 'digital' | 'physical';
  size: string;
  priceCents: number;
  /** Quantity per row. Legacy orders default to 1. */
  quantity?: number;
  name: string;
  location: string;
  isGift?: boolean;
  giftMessage?: string | null;
  customization?: Partial<MarathonCustomization> | Record<string, string> | null;
}

export interface AdminOrder {
  id: string;
  order_number: number;
  token: string;
  status: string;
  customer_name: string | null;
  customer_email: string | null;
  print_type_slug: string | null;
  format: string | null;
  size: string | null;
  price_cents: number;
  printful_order_id: string | null;
  printful_error: string | null;
  tracking_number: string | null;
  cart_snapshot: CartSnapshotItem[] | null;
  shipping_name: string | null;
  shipping_address_line1: string | null;
  shipping_address_line2: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_zip: string | null;
  shipping_country: string | null;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  created_at: string;
  updated_at: string | null;
  fulfilled_at: string | null;
}

export function hasMarathonItem(order: Pick<AdminOrder, 'cart_snapshot'>): boolean {
  return (order.cart_snapshot ?? []).some(
    (it) => it.type === 'marathon' && it.customization && typeof it.customization === 'object' && 'marathon_slug' in it.customization,
  );
}

export function hasPhysicalItem(order: Pick<AdminOrder, 'cart_snapshot' | 'format'>): boolean {
  const cart = order.cart_snapshot ?? [];
  if (cart.length > 0) return cart.some((it) => it.format === 'physical');
  // Legacy orders pre-cart_snapshot: fall back to top-level format
  return order.format === 'physical';
}

/**
 * Marathon orders need manual action — admin builds the print file by
 * hand and submits to Printful. Gallery orders are auto-submitted by
 * the Stripe webhook, so they don't need action unless that failed
 * (which sets `printful_error` and leaves `printful_order_id` empty).
 */
export function needsAction(order: AdminOrder): boolean {
  if (order.printful_order_id) return false;
  if (['cancelled', 'shipped', 'fulfilled', 'delivered'].includes(order.status)) return false;
  // Marathon: always needs admin action until printful_order_id is set
  if (hasMarathonItem(order)) return true;
  // Gallery: only needs action if the auto-submit failed (printful_error set)
  return hasPhysicalItem(order) && !!order.printful_error;
}

// Backwards-compat alias
export const needsMarathonAction = needsAction;

export const STATUS_OPTIONS = [
  'new',
  'paid',
  'in_progress',
  'in_production',
  'approved',
  'proof_sent',
  'shipped',
  'fulfilled',
  'delivered',
  'cancelled',
] as const;

export const STATUS_STYLE: Record<string, string> = {
  new: 'bg-lavender-light text-lavender',
  paid: 'bg-mint-light text-mint',
  in_progress: 'bg-warm-light text-warm',
  in_production: 'bg-warm-light text-warm',
  approved: 'bg-mint-light text-mint',
  proof_sent: 'bg-lavender-light text-lavender',
  shipped: 'bg-mint-light text-mint',
  fulfilled: 'bg-soft text-mid',
  delivered: 'bg-soft text-mid',
  cancelled: 'bg-coral-light text-coral',
};
