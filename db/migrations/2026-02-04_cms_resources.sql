-- Migration: Add CMS resources tables
-- Date: 2026-02-04
-- Description: Creates resources, resource_categories, and junction tables for M2M relationships

-- ============================================================================
-- RESOURCE CATEGORIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.resource_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL,
  title_de VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  sort INTEGER NOT NULL DEFAULT 0
);

-- Create unique index on key
CREATE UNIQUE INDEX IF NOT EXISTS idx_resource_categories_key_unique ON public.resource_categories(key);

-- ============================================================================
-- RESOURCES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) NOT NULL,
  title_de VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  description_de TEXT,
  description_en TEXT,
  type VARCHAR(50) NOT NULL,
  file_id UUID REFERENCES public.directus_files(id) ON DELETE SET NULL,
  external_url VARCHAR(1000),
  gated BOOLEAN NOT NULL DEFAULT false,
  visible BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create unique index on key
CREATE UNIQUE INDEX IF NOT EXISTS idx_resources_key_unique ON public.resources(key);

-- Create indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON public.resources("createdAt");
CREATE INDEX IF NOT EXISTS idx_resources_visible ON public.resources(visible);
CREATE INDEX IF NOT EXISTS idx_resources_type ON public.resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_published_at ON public.resources(published_at);

-- ============================================================================
-- RESOURCES_CATEGORIES JUNCTION TABLE (M2M)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.resources_categories (
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.resource_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (resource_id, category_id)
);

-- Create indexes for junction table
CREATE INDEX IF NOT EXISTS idx_resources_categories_resource_id ON public.resources_categories(resource_id);
CREATE INDEX IF NOT EXISTS idx_resources_categories_category_id ON public.resources_categories(category_id);

-- ============================================================================
-- RESOURCES_PROJECTS JUNCTION TABLE (M2M)
-- ============================================================================

-- First, ensure projects table exists (it should from previous migrations)
-- We'll reference it by UUID, assuming projects.id is UUID

CREATE TABLE IF NOT EXISTS public.resources_projects (
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  PRIMARY KEY (resource_id, project_id)
);

-- Create indexes for junction table
CREATE INDEX IF NOT EXISTS idx_resources_projects_resource_id ON public.resources_projects(resource_id);
CREATE INDEX IF NOT EXISTS idx_resources_projects_project_id ON public.resources_projects(project_id);
