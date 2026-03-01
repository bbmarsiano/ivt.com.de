-- Add a proper Directus file reference for partner logos
ALTER TABLE public.partners
  ADD COLUMN IF NOT EXISTS "logo_file" uuid NULL;

-- Optional FK (Directus uses directus_files.id as uuid)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'partners_logo_file_fk'
  ) THEN
    ALTER TABLE public.partners
      ADD CONSTRAINT partners_logo_file_fk
      FOREIGN KEY ("logo_file") REFERENCES public.directus_files(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_partners_logo_file ON public.partners("logo_file");
