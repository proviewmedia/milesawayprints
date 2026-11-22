import { sendCustomPrintFulfillmentEmail, type OrderShippingAddress } from '@/lib/email';
import { ARTWORK_BUCKET, getCustomPrintType, isArtworkItem, isCustomPrintItem } from '@/data/custom-prints';
import { createAdminClient } from '@/lib/supabase';

/** How long the file link in the admin email works. */
const FILE_LINK_SECONDS = 30 * 24 * 60 * 60;

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
    const artwork = isArtworkItem(it);
    const typeLabel = artwork ? 'Your artwork' : (getCustomPrintType(c.custom_type)?.label ?? 'Custom print');
    try {
      let fileUrl: string | undefined;
      if (artwork && c.file_path) {
        const { data } = await createAdminClient()
          .storage.from(ARTWORK_BUCKET)
          .createSignedUrl(c.file_path, FILE_LINK_SECONDS, { download: c.file_name || true });
        fileUrl = data?.signedUrl;
        if (!fileUrl) errors.push(`Could not link artwork file ${c.file_path}`);
      }
      const res = await sendCustomPrintFulfillmentEmail({
        orderNumber: args.orderNumber,
        orderToken: args.orderToken,
        customer: args.customer,
        shipping: args.shipping,
        typeLabel,
        place: artwork ? (c.file_name ?? 'Uploaded file') : (c.place ?? ''),
        fileUrl,
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
