-- Migration 009: marathons table for the personalized marathon-print flow.
--
-- Each row is one race the customer can buy a poster of. The actual print
-- file is generated per order (template SVG + customer's bib/name/time/etc.,
-- rasterized to PNG). The Printful order references the matte-poster catalog
-- variant directly with the rendered PNG attached as a file override, so we
-- don't need a per-race Printful sync product.

CREATE TABLE IF NOT EXISTS marathons (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text UNIQUE NOT NULL,
  city text NOT NULL,
  country text NOT NULL DEFAULT 'US',
  full_svg_path text,                   -- absolute path under /public, e.g. /marathons/las-vegas-full.svg
  half_svg_path text,                   -- nullable; some races may not offer a half
  printful_catalog_variants jsonb NOT NULL DEFAULT '{}'::jsonb, -- { "8x10": 4463, ... }
  printful_prices jsonb NOT NULL DEFAULT '{}'::jsonb,           -- cents per size
  active boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Seed: Las Vegas Marathon. Catalog variants + prices mirror the airport
-- products since they use the same matte poster paper stock.
INSERT INTO marathons (slug, city, full_svg_path, half_svg_path, printful_catalog_variants, printful_prices, sort_order)
VALUES (
  'las-vegas',
  'Las Vegas',
  '/marathons/las-vegas-full.svg',
  '/marathons/las-vegas-half.svg',
  '{"5x7":16364,"8x10":4463,"11x14":14125,"12x16":1349,"12x18":3876,"16x20":3877,"18x24":1,"24x36":2}'::jsonb,
  '{"5x7":600,"8x10":800,"11x14":1100,"12x16":1200,"12x18":1300,"16x20":1350,"18x24":1450,"24x36":2000}'::jsonb,
  1
)
ON CONFLICT (slug) DO NOTHING;
