-- Migration 007: Digital downloads
-- Per-customer access tokens with expiry + download cap.

-- Where the digital file lives in Supabase Storage (bucket: digital-prints)
ALTER TABLE gallery_items
  ADD COLUMN IF NOT EXISTS digital_file_path TEXT;

-- Per-order access control
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS digital_download_token TEXT,
  ADD COLUMN IF NOT EXISTS digital_download_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS digital_download_max INT DEFAULT 5,
  ADD COLUMN IF NOT EXISTS digital_download_count INT DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS orders_digital_token_idx
  ON orders (digital_download_token)
  WHERE digital_download_token IS NOT NULL;

-- Bucket creation is done from the Supabase dashboard / MCP, not in
-- this migration (Storage objects live outside SQL):
--   bucket: digital-prints
--   public: false
--   policy: service-role only
