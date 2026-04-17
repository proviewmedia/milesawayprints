# Printful Integration Guide

## Current state: manual fulfillment

For v1 we use a **manual workflow**. When a customer places a physical order:

1. You get an email notification with: customer name, shipping address, design slug, size.
2. The order appears in `/admin` with status `new`.
3. You log into Printful, create the order manually using that info.
4. Once Printful ships, you update the order in `/admin` (status → `fulfilled`, add tracking number).
5. The customer's `/order/[token]` page picks up the tracking automatically.

This keeps us live without needing API keys or product mappings upfront.

## What to do in Printful now (one-time setup)

1. Create a Printful account + connect a shop.
2. For each of your 15+ designs, upload the print artwork (PDF or high-res PNG) and create a Printful product. Pick the Printful print product type (e.g. "Enhanced Matte Paper Poster") and the variants (sizes).
3. Note each product's `product_id` and each variant's `variant_id`. We'll add these to `gallery_items` when we wire up automation.
4. Generate a Printful API key at Settings → API. Store it somewhere safe for now.

## When you're ready for the API (Phase 4)

1. Add migration: `printful_product_id TEXT` + `printful_variants JSONB` (map of size → variant_id) columns to `gallery_items`.
2. Fill in `src/lib/printful.ts` using the Printful REST API v2:
   - `submitPrintfulOrder()` → POST /orders with recipient + items
   - Webhook endpoint for shipping status
3. Call `submitPrintfulOrder()` from `src/app/api/webhooks/stripe/route.ts` after successful payment for physical orders.
4. Add env vars to Vercel: `PRINTFUL_API_KEY`, `PRINTFUL_STORE_ID`.

Docs: https://developers.printful.com/docs/
