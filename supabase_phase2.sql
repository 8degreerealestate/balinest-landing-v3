-- Phase 2 CMS + inventory extensions
-- Run this in Supabase SQL Editor after the base schema script.

begin;

create table if not exists public.downloadable_guides (
  id serial primary key,
  title text not null,
  slug text not null unique,
  description text,
  file_url text not null,
  cover_image_url text,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.homepage_sections (
  id serial primary key,
  section_key text not null unique,
  title text,
  subtitle text,
  body text,
  cta_label text,
  cta_href text,
  image_url text,
  sort_order integer not null default 0,
  enabled boolean not null default true,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_media (
  id serial primary key,
  project_id integer not null references public.projects(id) on delete cascade,
  media_type text not null default 'image',
  media_url text not null,
  thumbnail_url text,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint project_media_type_check check (media_type in ('image', 'video'))
);

create index if not exists idx_downloadable_guides_slug on public.downloadable_guides(slug);
create index if not exists idx_homepage_sections_sort on public.homepage_sections(sort_order);
create index if not exists idx_project_media_project_id on public.project_media(project_id);
create index if not exists idx_project_media_sort on public.project_media(project_id, sort_order);

commit;
