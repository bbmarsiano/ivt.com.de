-- Migration: Add CMS table columns to match Directus code schema
-- Date: 2026-01-22
-- Description: Adds all missing columns to projects, events, news, and testimonials tables
--              to match the schema defined in directus/snapshots/ivt-schema.from-code.json
--              This allows Directus to introspect existing columns instead of creating them.

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================

-- Add columns to projects table
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS slug VARCHAR(255) NOT NULL,
  ADD COLUMN IF NOT EXISTS status VARCHAR(255) NOT NULL DEFAULT 'ongoing',
  ADD COLUMN IF NOT EXISTS industry VARCHAR(255) NOT NULL,
  ADD COLUMN IF NOT EXISTS title_de VARCHAR(255) NOT NULL,
  ADD COLUMN IF NOT EXISTS title_en VARCHAR(255) NOT NULL,
  ADD COLUMN IF NOT EXISTS summary_de TEXT NOT NULL,
  ADD COLUMN IF NOT EXISTS summary_en TEXT NOT NULL,
  ADD COLUMN IF NOT EXISTS description_de TEXT NOT NULL,
  ADD COLUMN IF NOT EXISTS description_en TEXT NOT NULL,
  ADD COLUMN IF NOT EXISTS thumbnail VARCHAR(500) NOT NULL,
  ADD COLUMN IF NOT EXISTS images JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS coordinator JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS metrics JSONB,
  ADD COLUMN IF NOT EXISTS eligibility_de JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS eligibility_en JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_slug_unique ON public.projects(slug);

-- Create indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_industry ON public.projects(industry);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.projects(featured);

-- ============================================================================
-- EVENTS TABLE
-- ============================================================================

-- Add columns to events table
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS slug VARCHAR(255) NOT NULL,
  ADD COLUMN IF NOT EXISTS title_de VARCHAR(255) NOT NULL,
  ADD COLUMN IF NOT EXISTS title_en VARCHAR(255) NOT NULL,
  ADD COLUMN IF NOT EXISTS description_de TEXT NOT NULL,
  ADD COLUMN IF NOT EXISTS description_en TEXT NOT NULL,
  ADD COLUMN IF NOT EXISTS location VARCHAR(255) NOT NULL,
  ADD COLUMN IF NOT EXISTS start_at TIMESTAMPTZ NOT NULL,
  ADD COLUMN IF NOT EXISTS end_at TIMESTAMPTZ NOT NULL,
  ADD COLUMN IF NOT EXISTS cover VARCHAR(500);

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_slug_unique ON public.events(slug);

-- Create index for frequently queried field
CREATE INDEX IF NOT EXISTS idx_events_start_at ON public.events(start_at);

-- ============================================================================
-- NEWS TABLE
-- ============================================================================

-- Add columns to news table
ALTER TABLE public.news
  ADD COLUMN IF NOT EXISTS slug VARCHAR(255) NOT NULL,
  ADD COLUMN IF NOT EXISTS title_de VARCHAR(255) NOT NULL,
  ADD COLUMN IF NOT EXISTS title_en VARCHAR(255) NOT NULL,
  ADD COLUMN IF NOT EXISTS summary_de TEXT NOT NULL,
  ADD COLUMN IF NOT EXISTS summary_en TEXT NOT NULL,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ NOT NULL,
  ADD COLUMN IF NOT EXISTS cover VARCHAR(500),
  ADD COLUMN IF NOT EXISTS tags JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_news_slug_unique ON public.news(slug);

-- Create index for frequently queried field
CREATE INDEX IF NOT EXISTS idx_news_published_at ON public.news(published_at);

-- ============================================================================
-- TESTIMONIALS TABLE
-- ============================================================================

-- Add columns to testimonials table
ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS quote_de TEXT NOT NULL,
  ADD COLUMN IF NOT EXISTS quote_en TEXT NOT NULL,
  ADD COLUMN IF NOT EXISTS author_name VARCHAR(255) NOT NULL,
  ADD COLUMN IF NOT EXISTS author_title_de VARCHAR(255) NOT NULL,
  ADD COLUMN IF NOT EXISTS author_title_en VARCHAR(255) NOT NULL,
  ADD COLUMN IF NOT EXISTS company_name VARCHAR(255) NOT NULL,
  ADD COLUMN IF NOT EXISTS company_logo VARCHAR(500),
  ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false;

-- Create index for frequently queried field
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON public.testimonials(featured);

-- ============================================================================
-- NOTES
-- ============================================================================
-- After running this migration:
-- 1. Restart Directus container: docker-compose -f docker/docker-compose.directus.yml restart
-- 2. Directus will introspect the new columns and create field metadata automatically
-- 3. Verify with: curl -H "Authorization: Bearer $DIRECTUS_TOKEN" http://localhost:8055/fields/projects
-- 4. Run permissions fix if needed: ./scripts/directus-fix-permissions.sh
