-- Fix partners table created via Directus UI (currently only: id uuid)
-- Goal: add expected columns + index, idempotent

ALTER TABLE public.partners
  ADD COLUMN IF NOT EXISTS name varchar(255),
  ADD COLUMN IF NOT EXISTS logo varchar(500),
  ADD COLUMN IF NOT EXISTS website varchar(500),
  ADD COLUMN IF NOT EXISTS "createdAt" timestamptz;

-- Defaults + constraints
ALTER TABLE public.partners
  ALTER COLUMN name SET NOT NULL;

ALTER TABLE public.partners
  ALTER COLUMN "createdAt" SET DEFAULT now();

-- Backfill createdAt for existing rows (if any)
UPDATE public.partners
SET "createdAt" = COALESCE("createdAt", now())
WHERE "createdAt" IS NULL;

ALTER TABLE public.partners
  ALTER COLUMN "createdAt" SET NOT NULL;

-- Index
CREATE INDEX IF NOT EXISTS idx_partners_created_at ON public.partners ("createdAt");
