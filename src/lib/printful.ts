/**
 * Printful API v1 client.
 * Docs: https://developers.printful.com/docs/#tag/Orders-API
 *
 * Env vars (set in .env.local, add to Vercel env later):
 *   PRINTFUL_API_KEY    — Private token from Printful Developers
 *   PRINTFUL_STORE_ID   — Numeric store ID from Printful dashboard
 */

const BASE = 'https://api.printful.com';

function authHeaders(): Record<string, string> {
  const token = process.env.PRINTFUL_API_KEY;
  const storeId = process.env.PRINTFUL_STORE_ID;
  if (!token) throw new Error('PRINTFUL_API_KEY not set');
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  if (storeId) headers['X-PF-Store-Id'] = storeId;
  return headers;
}

// ---------- Types ----------

export interface PrintfulRecipient {
  name: string;
  address1: string;
  address2?: string | null;
  city: string;
  state_code: string;   // e.g. 'NV'
  country_code: string; // e.g. 'US'
  zip: string;
  email?: string;
  phone?: string;
}

export interface PrintfulOrderItem {
  /** Printful catalog variant id (a number) OR a store sync_variant_id */
  sync_variant_id?: number;
  variant_id?: number;
  quantity: number;
  /** Optional — if you want to override files on a per-order basis */
  files?: Array<{ url: string; filename?: string }>;
  /** Optional — human label */
  name?: string;
}

export interface PrintfulOrderRequest {
  external_id?: string;          // our order token
  recipient: PrintfulRecipient;
  items: PrintfulOrderItem[];
  /** optional — test orders stay in draft forever without confirm */
  confirm?: boolean;
  retail_costs?: {
    currency?: 'USD';
    subtotal?: string;
    total?: string;
  };
}

export interface PrintfulOrderResponse {
  code: number;
  result?: {
    id: number;
    external_id?: string;
    status: string;
    shipping?: string;
    created: number;
    updated: number;
    recipient: PrintfulRecipient;
    items: Array<{ id: number; variant_id: number; quantity: number; status: string }>;
  };
  error?: { reason: string; message: string };
}

// ---------- Calls ----------

/** Create an order in Printful (draft by default; pass confirm:true to auto-submit) */
export async function createOrder(
  payload: PrintfulOrderRequest,
): Promise<PrintfulOrderResponse> {
  const res = await fetch(`${BASE}/orders${payload.confirm ? '?confirm=1' : ''}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as PrintfulOrderResponse;
  return data;
}

/** Confirm a previously-created draft order (turns it into a real fulfillment) */
export async function confirmOrder(orderId: number | string) {
  const res = await fetch(`${BASE}/orders/${orderId}/confirm`, {
    method: 'POST',
    headers: authHeaders(),
  });
  return (await res.json()) as PrintfulOrderResponse;
}

/** Get the status of an order by Printful ID */
export async function getOrder(orderId: number | string) {
  const res = await fetch(`${BASE}/orders/${orderId}`, {
    headers: authHeaders(),
  });
  return (await res.json()) as PrintfulOrderResponse;
}

/** Cancel an order */
export async function cancelOrder(orderId: number | string) {
  const res = await fetch(`${BASE}/orders/${orderId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return (await res.json()) as PrintfulOrderResponse;
}

/** List store products (useful once from a script to grab variant ids) */
export async function listStoreProducts() {
  const res = await fetch(`${BASE}/store/products`, {
    headers: authHeaders(),
  });
  return await res.json();
}

/** Get a single store product with its variants */
export async function getStoreProduct(productId: number | string) {
  const res = await fetch(`${BASE}/store/products/${productId}`, {
    headers: authHeaders(),
  });
  return await res.json();
}

// ---------- Webhook helpers ----------

/**
 * Printful webhook signing. Printful currently sends unsigned webhooks (they
 * auth by letting you configure a dedicated URL), so we verify via a shared
 * secret you set on both sides.
 *
 * We expect the request to include ?secret= in the URL and compare against
 * PRINTFUL_WEBHOOK_SECRET. Rotate that secret when things look weird.
 */
export function verifyWebhookSecret(urlSecret: string | null): boolean {
  const expected = process.env.PRINTFUL_WEBHOOK_SECRET;
  if (!expected) return false;
  return urlSecret === expected;
}
