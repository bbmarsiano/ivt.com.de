-- Migration: Add CMS about singleton table
-- Date: 2026-01-30
-- Description: Creates the about singleton table for editable About page content

-- ============================================================================
-- ABOUT SINGLETON TABLE
-- ============================================================================

-- Create about table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.about (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_de VARCHAR(255) NOT NULL DEFAULT '',
  title_en VARCHAR(255) NOT NULL DEFAULT '',
  intro_de TEXT NOT NULL DEFAULT '',
  intro_en TEXT NOT NULL DEFAULT '',
  mission_de TEXT NOT NULL DEFAULT '',
  mission_en TEXT NOT NULL DEFAULT '',
  vision_de TEXT NOT NULL DEFAULT '',
  vision_en TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for createdAt
CREATE INDEX IF NOT EXISTS idx_about_created_at ON public.about("createdAt");
