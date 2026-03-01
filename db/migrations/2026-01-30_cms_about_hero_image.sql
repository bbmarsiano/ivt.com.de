-- Migration: Add hero_image_file to about table
-- Date: 2026-01-30
-- Description: Adds hero_image_file column (uuid FK to directus_files) for editable hero image

-- ============================================================================
-- ABOUT HERO IMAGE
-- ============================================================================

-- Add hero_image_file column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'about' 
    AND column_name = 'hero_image_file'
  ) THEN
    ALTER TABLE public.about ADD COLUMN hero_image_file UUID NULL;
  END IF;
END $$;

-- Add FK constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_schema = 'public' 
    AND constraint_name = 'about_hero_image_file_fkey'
  ) THEN
    ALTER TABLE public.about 
    ADD CONSTRAINT about_hero_image_file_fkey 
    FOREIGN KEY (hero_image_file) 
    REFERENCES public.directus_files(id) 
    ON DELETE SET NULL;
  END IF;
END $$;
