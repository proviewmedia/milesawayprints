/**
 * Printful integration — stub.
 *
 * We're on the MANUAL workflow for v1: physical orders notify the admin
 * via email + admin dashboard. You submit orders in the Printful
 * dashboard yourself.
 *
 * When you're ready to automate, fill in the functions below using the
 * Printful REST API v2. Docs: https://developers.printful.com
 *
 * Required env vars once automated:
 *   PRINTFUL_API_KEY
 *   PRINTFUL_STORE_ID
 */

export interface PrintfulOrderRequest {
  orderId: string;
  customerName: string;
  shippingAddress: {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  designSlug: string; // our gallery_items.slug
  size: string;       // e.g. "8x10"
  // For full integration: map to Printful product_id + variant_id per design/size.
}

export async function submitPrintfulOrder(
  _req: PrintfulOrderRequest,
): Promise<{ printfulOrderId: string } | { error: string }> {
  return {
    error: 'Printful API not yet wired. Submit manually in the Printful dashboard.',
  };
}

export async function getPrintfulStatus(
  _printfulOrderId: string,
): Promise<{ status: string; tracking?: string } | { error: string }> {
  return { error: 'Not implemented' };
}
