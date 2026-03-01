-- Migration: Add CMS team table
-- Date: 2026-01-27
-- Description: Creates the team table to match the TeamMember model used in the application
--              This allows Directus to introspect existing columns instead of creating them.

-- ============================================================================
-- TEAM TABLE
-- ============================================================================

-- Create team table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  role_de VARCHAR(255) NOT NULL,
  role_en VARCHAR(255) NOT NULL,
  bio_de TEXT NOT NULL,
  bio_en TEXT NOT NULL,
  email VARCHAR(255),
  linkedin VARCHAR(500),
  avatar_file UUID REFERENCES directus_files(id) ON DELETE SET NULL,
  sort INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_slug_unique ON public.team(slug);

-- Create indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_team_created_at ON public.team("createdAt");
CREATE INDEX IF NOT EXISTS idx_team_sort ON public.team(sort);
CREATE INDEX IF NOT EXISTS idx_team_featured ON public.team(featured);
