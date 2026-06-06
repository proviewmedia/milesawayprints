#!/usr/bin/env node
// End-to-end test of the purchase -> payment -> Printful fulfillment chain
// for a new golf print, WITHOUT charging anyone or shipping anything.
//
//  PART 1 (Stripe charge side): POST the live /api/checkout with the print in
//          the cart -> confirms a Stripe Checkout session is created and the
//          order is priced server-side at the standard price + shipping.
//  PART 2 (Printful fulfillment side): replicate exactly what the Stripe
//          webhook does after payment — createOrder with the print's
//          sync_variant_id + a recipient — but as a DRAFT (no confirm) so it
//          is NOT sent to production. A successful draft proves that with
//          confirm:true (what the webhook sends) Printful WOULD fulfill it.
//          The draft is deleted afterward.
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { randomUUID } from 'crypto';

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
);
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const PF = 'https://api.printful.com';
const pfHeaders = () => ({
  Authorization: `Bearer ${env.PRINTFUL_API_KEY}`,
  'Content-Type': 'application/json',
  ...(env.PRINTFUL_STORE_ID ? { 'X-PF-Store-Id': env.PRINTFUL_STORE_ID } : {}),
});

const SLUG = 'atlanta-national-golf-club';
const SIZE = '8x10';
const SITE = 'https://www.milesawayprints.com';

const { data: design } = await admin
  .from('gallery_items')
  .select('slug, name, printful_prices, printful_variants')
  .eq('slug', SLUG).single();

const priceCents = design.printful_prices[SIZE];
const syncVariantId = design.printful_variants[SIZE];
console.log(`Testing: ${design.name} (${SLUG}) size ${SIZE}`);
console.log(`  expected price: $${(priceCents / 100).toFixed(2)}  |  sync_variant_id: ${syncVariantId}\n`);

// ---------- PART 1: Stripe checkout (charge side) ----------
console.log('=== PART 1: Stripe checkout session ===');
const checkoutRes = await fetch(`${SITE}/api/checkout`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: [{
      slug: SLUG, type: 'golf', format: 'physical', size: SIZE,
      priceCents: 999, // deliberately WRONG to prove the server re-prices
      name: design.name, location: '', quantity: 1,
    }],
    shipping: { country: 'US' },
  }),
});
const checkout = await checkoutRes.json();
console.log(`  /api/checkout -> HTTP ${checkoutRes.status}`);
console.log(`  clientSecret present: ${checkout.clientSecret ? 'YES (Stripe session created)' : 'NO'}`);
if (checkout.error) console.log(`  error: ${checkout.error} ${JSON.stringify(checkout.detail || '')}`);

// Read back the order the route just created to confirm the server price.
let testOrderId = null;
{
  const { data: order } = await admin
    .from('orders')
    .select('id, price_cents, size, print_type_slug, customer_email, created_at')
    .eq('print_type_slug', 'golf')
    .eq('customer_email', 'pending@placeholder.local')
    .order('created_at', { ascending: false })
    .limit(1).maybeSingle();
  if (order) {
    testOrderId = order.id;
    const shipping = order.price_cents - priceCents;
    console.log(`  server-priced order: price_cents=${order.price_cents} ($${(order.price_cents/100).toFixed(2)} = $${(priceCents/100).toFixed(2)} item + $${(shipping/100).toFixed(2)} shipping)`);
    console.log(`  -> ignored the client's bogus $9.99 and charged the real price: ${order.price_cents >= priceCents ? 'PASS' : 'FAIL'}`);
  }
}

// ---------- PART 2: Printful fulfillment (draft, then delete) ----------
console.log('\n=== PART 2: Printful order (DRAFT — exactly what the webhook sends, minus confirm) ===');
const draftPayload = {
  // No external_id — mirrors the fixed production code (Printful caps it at 32
  // chars; our 64-char token was being rejected). printful_order_id is the link.
  recipient: {
    name: 'E2E Test (delete me)',
    address1: '1355 Market St',
    city: 'San Francisco',
    state_code: 'CA',
    country_code: 'US',
    zip: '94103',
    email: 'test@milesawayprints.com',
  },
  items: [{ sync_variant_id: Number(syncVariantId), quantity: 1, name: `${design.name} ${SIZE}` }],
  // NOTE: no confirm -> DRAFT only. Production webhook passes confirm:true.
};
const pfRes = await fetch(`${PF}/orders`, { method: 'POST', headers: pfHeaders(), body: JSON.stringify(draftPayload) });
const pf = await pfRes.json();
if (pf.code >= 400) {
  console.log(`  ❌ Printful REJECTED the order: ${JSON.stringify(pf.error || pf)}`);
} else {
  const r = pf.result;
  console.log(`  ✅ Printful ACCEPTED the order (would fulfill on confirm)`);
  console.log(`     draft id: ${r.id}  status: ${r.status}`);
  console.log(`     items: ${r.items?.map((i) => `${i.name} x${i.quantity} (variant ${i.sync_variant_id ?? i.variant_id})`).join('; ')}`);
  console.log(`     Printful cost: $${r.costs?.total ?? '?'}  retail: $${r.retail_costs?.total ?? '?'}`);
  // clean up the draft
  const del = await fetch(`${PF}/orders/${r.id}`, { method: 'DELETE', headers: pfHeaders() });
  const delJson = await del.json();
  console.log(`     cleanup: deleted draft ${r.id} -> ${delJson.code === 200 ? 'OK' : JSON.stringify(delJson)}`);
}

// ---------- cleanup the test checkout order ----------
if (testOrderId) {
  await admin.from('orders').delete().eq('id', testOrderId);
  console.log(`\nCleaned up test checkout order ${testOrderId}.`);
}
console.log('\nDone.');
