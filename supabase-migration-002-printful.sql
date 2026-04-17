-- ============================================================
-- MILES AWAY PRINTS — MIGRATION 002: Printful integration
-- Run in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- Safe to re-run.
-- ============================================================

-- 1. Per-design Printful product + per-size variant mapping
ALTER TABLE gallery_items
  ADD COLUMN IF NOT EXISTS printful_product_id TEXT,
  ADD COLUMN IF NOT EXISTS printful_variants JSONB DEFAULT '{}';
-- printful_variants is a map of our size value -> Printful variant_id, e.g.
--   {"8x10": 4011, "11x14": 4012, "16x20": 4013}
-- You populate this per design from the Printful dashboard (Products tab).

-- 2. Track Printful side of each order
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS printful_status TEXT,           -- draft, pending, failed, canceled, inprocess, onhold, partial, fulfilled, returned
  ADD COLUMN IF NOT EXISTS printful_submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS printful_error TEXT;

-- 3. Helper index for looking up an order by Printful ID (for webhooks)
CREATE INDEX IF NOT EXISTS idx_orders_printful ON orders(printful_order_id);
