import { sendCustomPrintFulfillmentEmail, type OrderShippingAddress } from '@/lib/email';
import { getCustomPrintType, isCustomPrintItem } from '@/data/custom-prints';

interface CustomPrintCartItem {
  size: string;
  priceCents: number;
  customization?: Record<string, string> | null;
}

/** Email the admin once per paid custom print so it can be designed by hand.
 *  Custom prints are never sent to Printful automatically. */
export async function notifyCustomPrintOrder(args: {
  items: CustomPrintCartItem[];
  orderNumber: string | number;
  orderToken: string;
  customer: { name: string; email: string };
  shipping?: OrderShippingAddress;
}): Promise<{ count: number; errors: string[] }> {
  const customItems = args.items.filter(isCustomPrintItem);
  const errors: string[] = [];
  for (const it of customItems) {
    const c = it.customization ?? {};
    const typeLabel = getCustomPrintType(c.custom_type)?.label ?? 'Custom print';
    try {
      const res = await sendCustomPrintFulfillmentEmail({
        orderNumber: args.orderNumber,
        orderToken: args.orderToken,
        customer: args.customer,
        shipping: args.shipping,
        typeLabel,
        place: c.place ?? '',
        details: c.details ?? '',
        size: it.size,
        pricePaidCents: it.priceCents,
      });
      // Resend returns errors instead of throwing.
      const err = (res as { error?: { message?: string } | null })?.error;
      if (err) throw new Error(err.message ?? 'resend error');
    } catch (err) {
      errors.push(`Custom print notify failed (${c.place}): ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  return { count: customItems.length, errors };
}
