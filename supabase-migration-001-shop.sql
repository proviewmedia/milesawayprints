-- ============================================================
-- MILES AWAY PRINTS — MIGRATION 001: Shop / Storefront
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- Safe to re-run (uses IF NOT EXISTS / ON CONFLICT).
-- ============================================================

-- 1. Add storefront columns to gallery_items
ALTER TABLE gallery_items
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS room_mockup_url TEXT;

-- Backfill slugs (lowercase, hyphenated, no special chars) if null
UPDATE gallery_items
SET slug = regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g')
WHERE slug IS NULL OR slug = '';

-- Trim leading/trailing hyphens from slugs
UPDATE gallery_items
SET slug = trim(both '-' from slug);

-- Enforce uniqueness + required
ALTER TABLE gallery_items
  ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_gallery_items_slug ON gallery_items(slug);

-- 2. Collections (curated groupings)
CREATE TABLE IF NOT EXISTS collections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  hero_image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table: which gallery items belong to which collection
CREATE TABLE IF NOT EXISTS collection_items (
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  gallery_item_id UUID NOT NULL REFERENCES gallery_items(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  PRIMARY KEY (collection_id, gallery_item_id)
);

-- Seed starter collections
INSERT INTO collections (slug, name, description, sort_order) VALUES
  ('legendary-golf', 'Legendary Golf Courses', 'The courses every golfer dreams of playing.', 1),
  ('mlb-classics', 'Classic MLB Stadiums', 'Ballparks with decades of history. Swing away.', 2),
  ('marathon-majors', 'Marathon Majors', 'The world''s six legendary 26.2 routes.', 3),
  ('major-airports', 'Major Airports', 'Runways that move the world.', 4)
ON CONFLICT (slug) DO NOTHING;

-- Wire up seed collection memberships (based on existing seed gallery items)
INSERT INTO collection_items (collection_id, gallery_item_id, sort_order)
SELECT c.id, g.id, g.sort_order
FROM collections c, gallery_items g
WHERE (c.slug = 'legendary-golf' AND g.print_type_slug = 'golf')
   OR (c.slug = 'mlb-classics' AND g.print_type_slug = 'stadium')
   OR (c.slug = 'marathon-majors' AND g.print_type_slug = 'marathon')
   OR (c.slug = 'major-airports' AND g.print_type_slug = 'airport')
ON CONFLICT (collection_id, gallery_item_id) DO NOTHING;

-- 3. Public read access for collections
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active collections" ON collections
  FOR SELECT USING (active = true);

CREATE POLICY "Public can read collection items" ON collection_items
  FOR SELECT USING (true);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_collection_items_collection ON collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_item ON collection_items(gallery_item_id);

-- 5. (Optional) Seed some tags and descriptions on existing gallery items
UPDATE gallery_items SET tags = ARRAY['usa','pga-tour','bucket-list'],
  description = 'Seven stunning oceanfront holes along the Pacific. The world''s most photographed golf course.'
  WHERE slug = 'pebble-beach';

UPDATE gallery_items SET tags = ARRAY['usa','majors','iconic'],
  description = 'Home of The Masters. The most exclusive course in golf.'
  WHERE slug = 'augusta-national';

UPDATE gallery_items SET tags = ARRAY['international','bucket-list','historic'],
  description = 'The birthplace of golf. Walk the Swilcan Bridge where legends have stood.'
  WHERE slug = 'st-andrews';

UPDATE gallery_items SET tags = ARRAY['usa','baseball','classic'],
  description = 'The House That Ruth Built, rebuilt. 54,251 seats of pinstripe history.'
  WHERE slug = 'yankee-stadium';

UPDATE gallery_items SET tags = ARRAY['usa','baseball','historic'],
  description = 'Opened 1914. Friendly Confines. The ivy still climbs.'
  WHERE slug = 'wrigley-field';

UPDATE gallery_items SET tags = ARRAY['usa','baseball','historic'],
  description = 'The oldest active MLB park. Home of the Green Monster.'
  WHERE slug = 'fenway-park';

UPDATE gallery_items SET tags = ARRAY['usa','aviation','west-coast'],
  description = 'Four parallel runways meet the Pacific. Where LA meets the world.'
  WHERE slug = 'lax';

UPDATE gallery_items SET tags = ARRAY['usa','aviation','east-coast'],
  description = 'New York''s gateway to the world. Six terminals, four runways.'
  WHERE slug = 'jfk';

UPDATE gallery_items SET tags = ARRAY['usa','aviation','hub'],
  description = 'The crossroads of the country. Eight runways, one terminal at a time.'
  WHERE slug = 'o-hare';

UPDATE gallery_items SET tags = ARRAY['usa','running','majors'],
  description = 'The oldest continuous marathon in the world. Hopkinton to Boylston. 26.2.'
  WHERE slug = 'boston-marathon';

UPDATE gallery_items SET tags = ARRAY['usa','running','majors'],
  description = 'Five boroughs, 50,000 runners, one unforgettable finish.'
  WHERE slug = 'nyc-marathon';

UPDATE gallery_items SET tags = ARRAY['usa','running','majors'],
  description = 'Flat, fast, and legendary. The heartland''s race through downtown.'
  WHERE slug = 'chicago-marathon';

UPDATE gallery_items SET tags = ARRAY['usa','west-coast','iconic'],
  description = 'Seven hills, the Golden Gate, and streets that rollercoast.'
  WHERE slug = 'san-francisco';

UPDATE gallery_items SET tags = ARRAY['international','europe','romantic'],
  description = 'The City of Light. Boulevards, bridges, the Seine.'
  WHERE slug = 'paris';

UPDATE gallery_items SET tags = ARRAY['international','asia','megacity'],
  description = 'Neon-lit grids and centuries of tradition in one city.'
  WHERE slug = 'tokyo';
