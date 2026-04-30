-- Migration 008: store Printful catalog variant_id alongside sync_variant_id
-- Needed because /shipping/rates and tax calculations require the catalog
-- variant_id; /orders accepts sync_variant_id. Two different IDs from
-- Printful's data model.

ALTER TABLE gallery_items
  ADD COLUMN IF NOT EXISTS printful_catalog_variants JSONB;
