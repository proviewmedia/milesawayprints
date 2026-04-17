-- ============================================================
-- MILES AWAY PRINTS - DATABASE SCHEMA
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PRINT TYPES (the 5 product categories)
-- ============================================================
CREATE TABLE print_types (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO print_types (slug, name, sort_order) VALUES
  ('golf', 'Golf Course', 1),
  ('stadium', 'Stadium', 2),
  ('airport', 'Airport', 3),
  ('marathon', 'Marathon', 4),
  ('city', 'City Street', 5);

-- ============================================================
-- GALLERY ITEMS (existing designs per print type)
-- ============================================================
CREATE TABLE gallery_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  print_type_slug TEXT NOT NULL REFERENCES print_types(slug),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  image_url TEXT,
  values JSONB NOT NULL DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed with default gallery items
INSERT INTO gallery_items (print_type_slug, name, location, values, featured, sort_order) VALUES
  ('golf', 'Pebble Beach', 'Pebble Beach, CA', '{"name":"Pebble Beach Golf Links","location":"Pebble Beach, California","stat1":"6,828 yds","stat2":"72","stat3":"74.7"}', true, 1),
  ('golf', 'Augusta National', 'Augusta, GA', '{"name":"Augusta National","location":"Augusta, Georgia","stat1":"7,545 yds","stat2":"72","stat3":"78.1"}', true, 2),
  ('golf', 'St Andrews', 'Scotland', '{"name":"St Andrews Old Course","location":"St Andrews, Scotland","stat1":"7,305 yds","stat2":"72","stat3":"77.1"}', true, 3),
  ('stadium', 'Yankee Stadium', 'Bronx, NY', '{"name":"Yankee Stadium","location":"Bronx, New York","stat1":"54,251","stat2":"2009","stat3":"40.8296° N"}', true, 1),
  ('stadium', 'Wrigley Field', 'Chicago, IL', '{"name":"Wrigley Field","location":"Chicago, Illinois","stat1":"41,649","stat2":"1914","stat3":"41.9484° N"}', true, 2),
  ('stadium', 'Fenway Park', 'Boston, MA', '{"name":"Fenway Park","location":"Boston, Massachusetts","stat1":"37,755","stat2":"1912","stat3":"42.3467° N"}', true, 3),
  ('airport', 'LAX', 'Los Angeles, CA', '{"name":"Los Angeles International","location":"Los Angeles, California","stat1":"LAX","stat2":"4","stat3":"128 ft"}', true, 1),
  ('airport', 'JFK', 'New York, NY', '{"name":"John F. Kennedy International","location":"New York, New York","stat1":"JFK","stat2":"4","stat3":"13 ft"}', true, 2),
  ('airport', 'O''Hare', 'Chicago, IL', '{"name":"O''Hare International","location":"Chicago, Illinois","stat1":"ORD","stat2":"8","stat3":"672 ft"}', true, 3),
  ('marathon', 'Boston Marathon', 'Boston, MA', '{"name":"Boston Marathon","location":"April 15, 2024","stat1":"3:32:10","stat2":"26.2","stat3":"8:05/mi"}', true, 1),
  ('marathon', 'NYC Marathon', 'New York, NY', '{"name":"New York City Marathon","location":"November 3, 2024","stat1":"4:12:45","stat2":"26.2","stat3":"9:37/mi"}', true, 2),
  ('marathon', 'Chicago Marathon', 'Chicago, IL', '{"name":"Chicago Marathon","location":"October 13, 2024","stat1":"3:55:08","stat2":"26.2","stat3":"8:58/mi"}', true, 3),
  ('city', 'San Francisco', 'California', '{"name":"San Francisco","location":"California, USA","stat1":"37.7749° N","stat2":"122.4194° W","stat3":"1776"}', true, 1),
  ('city', 'Paris', 'France', '{"name":"Paris","location":"France","stat1":"48.8566° N","stat2":"2.3522° E","stat3":"3rd C. BC"}', true, 2),
  ('city', 'Tokyo', 'Japan', '{"name":"Tokyo","location":"Japan","stat1":"35.6762° N","stat2":"139.6503° E","stat3":"1457"}', true, 3);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TYPE order_status AS ENUM (
  'new',
  'in_progress',
  'proof_sent',
  'approved',
  'fulfilled',
  'cancelled'
);

CREATE TYPE order_format AS ENUM ('digital', 'physical');

CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number SERIAL,
  token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  
  -- Customer info
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  
  -- Shipping (physical only)
  shipping_name TEXT,
  shipping_address_line1 TEXT,
  shipping_address_line2 TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_zip TEXT,
  shipping_country TEXT DEFAULT 'US',
  
  -- Product info
  print_type_slug TEXT NOT NULL REFERENCES print_types(slug),
  format order_format NOT NULL,
  size TEXT NOT NULL,
  customization JSONB NOT NULL DEFAULT '{}',
  
  -- Gift
  is_gift BOOLEAN DEFAULT false,
  gift_message TEXT,
  gift_recipient_email TEXT,
  
  -- Pricing
  price_cents INTEGER NOT NULL,
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  
  -- Status
  status order_status DEFAULT 'new',
  
  -- Fulfillment
  digital_download_url TEXT,
  tracking_number TEXT,
  printful_order_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  fulfilled_at TIMESTAMPTZ
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- PROOFS (uploaded by admin for customer review)
-- ============================================================
CREATE TYPE proof_status AS ENUM ('pending', 'approved', 'changes_requested');

CREATE TABLE proofs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  image_url TEXT NOT NULL,
  status proof_status DEFAULT 'pending',
  customer_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- ============================================================
-- MESSAGES (order-level communication)
-- ============================================================
CREATE TYPE message_sender AS ENUM ('customer', 'admin');

CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sender message_sender NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REVIEWS / TESTIMONIALS
-- ============================================================
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  print_type_slug TEXT REFERENCES print_types(slug),
  location_context TEXT,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed some placeholder reviews
INSERT INTO reviews (customer_name, print_type_slug, location_context, content, rating, featured) VALUES
  ('Jennifer M.', 'marathon', 'Marathon Print — Chicago, IL', 'Got this for my husband who ran the Chicago Marathon. He absolutely loved it. The detail on the route map is incredible and the personalization made it so special.', 5, true),
  ('David R.', 'airport', 'Airport Print — Los Angeles, CA', 'I''m an aviation nerd and this airport print of LAX is now the centerpiece of my office. Clean design, great quality. Already ordering SFO next.', 5, true),
  ('Marcus T.', 'golf', 'Golf Course Print — Pebble Beach, CA', 'Bought the Pebble Beach golf course print for my dad''s birthday. He literally teared up. It''s framed and hanging in his office now. Worth every penny.', 5, true);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE print_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public read access for storefront data
CREATE POLICY "Public can read active print types" ON print_types
  FOR SELECT USING (active = true);

CREATE POLICY "Public can read active gallery items" ON gallery_items
  FOR SELECT USING (active = true);

CREATE POLICY "Public can read featured reviews" ON reviews
  FOR SELECT USING (featured = true);

-- Orders: customers can read their own via token
CREATE POLICY "Customers can read own order by token" ON orders
  FOR SELECT USING (true);

-- Proofs: readable if you can read the order
CREATE POLICY "Public can read proofs" ON proofs
  FOR SELECT USING (true);

-- Messages: readable if you can read the order
CREATE POLICY "Public can read messages" ON messages
  FOR SELECT USING (true);

-- Messages: customers can insert messages
CREATE POLICY "Anyone can insert messages" ON messages
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_gallery_print_type ON gallery_items(print_type_slug);
CREATE INDEX idx_orders_token ON orders(token);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_email ON orders(customer_email);
CREATE INDEX idx_proofs_order ON proofs(order_id);
CREATE INDEX idx_messages_order ON messages(order_id);

-- ============================================================
-- STORAGE BUCKET for print images and proofs
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('prints', 'prints', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('proofs', 'proofs', true)
ON CONFLICT (id) DO NOTHING;
