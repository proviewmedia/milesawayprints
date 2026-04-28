-- Migration 005: Stripe + Printful order linkage
-- Run against the project's Supabase SQL editor.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS printful_order_id TEXT,
  ADD COLUMN IF NOT EXISTS printful_error TEXT,
  ADD COLUMN IF NOT EXISTS cart_snapshot JSONB;

ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'paid';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'in_production';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'shipped';

CREATE INDEX IF NOT EXISTS orders_stripe_session_idx
  ON orders (stripe_checkout_session_id);

CREATE INDEX IF NOT EXISTS orders_printful_order_idx
  ON orders (printful_order_id);
