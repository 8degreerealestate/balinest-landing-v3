-- Optional blog SEO columns (run on Supabase when ready for admin-editable metadata).
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS canonical_url text,
  ADD COLUMN IF NOT EXISTS og_image_url text;
