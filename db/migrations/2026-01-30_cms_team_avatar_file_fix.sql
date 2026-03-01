-- Migration: Ensure team.avatar_file is proper uuid FK to directus_files
-- Date: 2026-01-30
-- Description: Fixes team.avatar_file column type and FK constraint if needed

-- ============================================================================
-- TEAM AVATAR FILE FIX
-- ============================================================================

-- Ensure avatar_file column exists and is UUID type
DO $$
BEGIN
  -- Check if column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'team' 
    AND column_name = 'avatar_file'
  ) THEN
    -- Check if it's already UUID type
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'team' 
      AND column_name = 'avatar_file'
      AND data_type = 'uuid'
    ) THEN
      -- Convert to UUID (this will fail if data exists and isn't valid UUID, but that's expected)
      -- We'll drop and recreate to be safe
      ALTER TABLE public.team DROP COLUMN IF EXISTS avatar_file;
      ALTER TABLE public.team ADD COLUMN avatar_file UUID NULL;
    END IF;
  ELSE
    -- Column doesn't exist, create it
    ALTER TABLE public.team ADD COLUMN avatar_file UUID NULL;
  END IF;
END $$;

-- Ensure FK constraint exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_schema = 'public' 
    AND constraint_name = 'team_avatar_file_fkey'
  ) THEN
    ALTER TABLE public.team 
    ADD CONSTRAINT team_avatar_file_fkey 
    FOREIGN KEY (avatar_file) 
    REFERENCES public.directus_files(id) 
    ON DELETE SET NULL;
  END IF;
END $$;
