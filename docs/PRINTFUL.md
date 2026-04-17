# Printful Integration Guide

## Overview

Miles Away Prints uses Printful's REST API v1 for physical order fulfillment. Digital orders are delivered directly by us and never touch Printful.

**Stack:**
- `src/lib/printful.ts` — API client (create/confirm/get/cancel orders, list products, webhook verifier)
- `src/app/api/printful/submit` — submits one of our orders to Printful
- `src/app/api/printful/products` — list store products & variants (for grabbing variant IDs)
- `src/app/api/webhooks/printful` — receives shipping status events

---

## One-time setup

### 1. Generate a private API token

Printful dashboard → Developers → Private tokens → Create.

**Scopes to check:**
- ✅ View and manage orders of the authorized store
- ✅ View store products
- ✅ View store files
- ✅ View and manage store webhooks

Copy the token.

### 2. Store credentials locally

Run this once in your terminal (prompts silently, never echoes token):

```bash
cd ~/milesawayprints && \
  read -rs -p "Printful API token: " TOK && echo && \
  read -rp "Printful store ID (numeric): " SID && \
  read -rp "Webhook secret (make up a random string): " WHS && \
  { grep -v '^PRINTFUL_' .env.local 2>/dev/null;
    echo "PRINTFUL_API_KEY=$TOK";
    echo "PRINTFUL_STORE_ID=$SID";
    echo "PRINTFUL_WEBHOOK_SECRET=$WHS";
  } > .env.local.tmp && \
  mv .env.local.tmp .env.local && \
  unset TOK WHS && \
  echo "Saved."
```

To find your store ID: Printful → Settings → Stores → click MilesAwayPrints → the number in the URL.

### 3. Run the migration

Supabase → SQL Editor → run `supabase-migration-002-printful.sql`. Adds:
- `gallery_items.printful_product_id`
- `gallery_items.printful_variants` (JSONB map: size → variant_id)
- `orders.printful_status`, `printful_submitted_at`, `printful_error`

### 4. Upload your designs to Printful + create products

For each of your 15 designs (Pebble Beach, Augusta, LAX, etc.):

1. Printful → Stores → MilesAwayPrints → Add Product.
2. Pick the print product (recommended: **Enhanced Matte Paper Poster**).
3. Upload the print file (PDF or high-res PNG).
4. Add size variants that match our sizes: **8×10, 11×14, 16×20, 18×24, 24×36**. Set your cost/retail prices.
5. Save the product.

### 5. Grab variant IDs for each design

Once products are created, list them locally to get their IDs:

```bash
# With dev server running:
curl -s http://localhost:3001/api/printful/products | jq '.result[] | {id, name}'
```

Then for each product, get its variants:

```bash
curl -s "http://localhost:3001/api/printful/products?id=<SYNC_PRODUCT_ID>" \
  | jq '.result.sync_variants[] | {id, name, variant_id}'
```

Look at each variant's `name` field to find the size (e.g. "8×10"), and grab the `id` (that's the `sync_variant_id`).

### 6. Map variants to gallery items in Supabase

For each gallery_items row, update `printful_product_id` and `printful_variants`. Example SQL:

```sql
UPDATE gallery_items
SET
  printful_product_id = '123456789',
  printful_variants = '{
    "8x10": 4711201234,
    "11x14": 4711201235,
    "16x20": 4711201236,
    "18x24": 4711201237,
    "24x36": 4711201238
  }'::jsonb
WHERE slug = 'pebble-beach';
```

Repeat for every design you want to fulfill through Printful.

### 7. Configure the webhook

Printful dashboard → Settings → Stores → MilesAwayPrints → Webhooks.

**URL** (once deployed to Vercel):
```
https://milesawayprints.com/api/webhooks/printful?secret=<your-PRINTFUL_WEBHOOK_SECRET>
```

**Events to enable (minimum):**
- `package_shipped` (auto-updates tracking + marks order fulfilled)
- `order_failed`
- `order_canceled`

Test in Printful with the "Send test event" button.

---

## Order lifecycle

1. Customer checks out → our `/api/checkout` creates an order (status `new`).
2. Admin opens `/admin`, reviews the order.
3. Admin clicks "Submit to Printful" → `POST /api/printful/submit { orderId }`.
   - By default this creates a **draft** in Printful (pass `confirm: true` to auto-confirm).
   - On success we store `printful_order_id` + `printful_status` on our order.
4. You confirm the draft in Printful dashboard → Printful prints + ships.
5. Printful webhook fires `package_shipped` → our webhook route stores tracking number + sets status to `fulfilled`.
6. Customer sees shipping info on their `/order/[token]` page automatically.

---

## Local testing without real orders

You can POST a test order request against a dev order:

```bash
# first, pick an order id from /admin
curl -X POST http://localhost:3001/api/printful/submit \
  -H 'Content-Type: application/json' \
  -d '{"orderId":"<ORDER_UUID>", "confirm": false}'
```

Response will include the Printful order id — view it in Printful dashboard under Orders. Don't confirm if it's a test.

---

## Common errors

| Error | Fix |
|---|---|
| `PRINTFUL_API_KEY not set` | Missing env var — re-run step 2. Restart dev server. |
| `No matching gallery item or Printful variants configured` | `gallery_items.printful_variants` is empty or the order's `customization.name` doesn't match a gallery item name. |
| `No Printful variant configured for size "X"` | That size is missing from the JSON map in `printful_variants`. Add it. |
| `Order missing shipping address` | Checkout didn't collect shipping — Stripe shipping integration captures this automatically once wired. |

---

## What's NOT automated (by design)

- **Digital orders** — we email the download link directly, no Printful call.
- **Custom orders** (user entered a new location) — no gallery item match, so admin handles Printful manually for one-offs. Save the design as a new `gallery_items` row with variants to enable automation later.
- **Draft → confirm** step — you confirm in Printful dashboard so you can eyeball the preview first. Flip `confirm: true` in the submit call once you trust the pipeline.
