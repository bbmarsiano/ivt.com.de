-- Migration: Add resource access request and token tables
-- Date: 2026-02-05
-- Description: Creates tables for gated resource access flow with magic-link download tokens

-- ============================================================================
-- RESOURCE ACCESS REQUESTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.resource_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  resource_key VARCHAR(255) NOT NULL,
  project_id UUID,
  project_slug VARCHAR(255),
  ip VARCHAR(45), -- IPv6 max length
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_resource_access_requests_email_resource_project 
  ON public.resource_access_requests(email, resource_key, project_slug, created_at);
CREATE INDEX IF NOT EXISTS idx_resource_access_requests_ip 
  ON public.resource_access_requests(ip, created_at);

-- ============================================================================
-- RESOURCE ACCESS TOKENS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.resource_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.resource_access_requests(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL UNIQUE, -- SHA-256 hash (64 hex chars)
  resource_key VARCHAR(255) NOT NULL,
  project_id UUID,
  project_slug VARCHAR(255),
  file_id UUID REFERENCES public.directus_files(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  use_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for token lookup and expiry checks
CREATE UNIQUE INDEX IF NOT EXISTS idx_resource_access_tokens_token_hash_unique 
  ON public.resource_access_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_resource_access_tokens_expires_at 
  ON public.resource_access_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_resource_access_tokens_resource_project 
  ON public.resource_access_tokens(resource_key, project_id);
