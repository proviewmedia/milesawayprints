-- ============================================================
-- MILES AWAY PRINTS — MIGRATION 003: Add F1 + Skyline categories
-- Run in Supabase SQL Editor.
-- Safe to re-run.
-- ============================================================

INSERT INTO print_types (slug, name, sort_order) VALUES
  ('skyline', 'City Skyline', 6),
  ('f1', 'F1 Circuit', 7)
ON CONFLICT (slug) DO NOTHING;
