-- Run on your Postgres (e.g. Supabase SQL editor) once.
-- Stores admin flags for Google Sheet inventory rows (keyed by `code`).

CREATE TABLE IF NOT EXISTS inventory_listing_meta (
  code TEXT PRIMARY KEY,
  featured BOOLEAN NOT NULL DEFAULT false,
  visibility TEXT NOT NULL DEFAULT 'active',
  sale_status TEXT NOT NULL DEFAULT 'available',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS inventory_listing_meta_featured_idx
  ON inventory_listing_meta (featured)
  WHERE featured = true;
