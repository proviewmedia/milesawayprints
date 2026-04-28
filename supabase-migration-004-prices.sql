-- ============================================================
-- MILES AWAY PRINTS — MIGRATION 004: Per-variant pricing
-- Run in Supabase SQL Editor. Safe to re-run.
-- ============================================================

-- Store retail price per size (in cents) — pulled from Printful on sync.
-- Shape: { "8x10": 1300, "11x14": 1575, "16x20": 1800, ... }
ALTER TABLE gallery_items
  ADD COLUMN IF NOT EXISTS printful_prices JSONB DEFAULT '{}';

-- Optional per-design digital price override (in cents). Site falls back to
-- a global default ($12 = 1200 cents) if this is null.
ALTER TABLE gallery_items
  ADD COLUMN IF NOT EXISTS digital_price_cents INTEGER;
