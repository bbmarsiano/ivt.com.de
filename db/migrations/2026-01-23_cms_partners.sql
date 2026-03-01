-- Migration: Add CMS partners table
-- Date: 2026-01-23
-- Description: Creates the partners table to match the Partner model used in the application
--              This allows Directus to introspect existing columns instead of creating them.

-- ============================================================================
-- PARTNERS TABLE
-- ============================================================================

-- Create partners table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  logo VARCHAR(500),
  website VARCHAR(500),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for frequently queried field (if we add sorting/filtering later)
CREATE INDEX IF NOT EXISTS idx_partners_created_at ON public.partners("createdAt");
