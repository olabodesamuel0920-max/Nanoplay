-- Migration: Fix phone_verification_codes table schema on production
-- Trigger workflow run
-- 1. Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.phone_verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempt_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Alter table columns to match modern hashed structure if they already exist
-- Add user_id column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'phone_verification_codes' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.phone_verification_codes 
    ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add code_hash column if missing and drop old code column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'phone_verification_codes' AND column_name = 'code_hash'
  ) THEN
    ALTER TABLE public.phone_verification_codes ADD COLUMN code_hash TEXT;
    -- If there's an old code column, copy/drop it
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'phone_verification_codes' AND column_name = 'code'
    ) THEN
      ALTER TABLE public.phone_verification_codes DROP COLUMN code;
    END IF;
  END IF;
END $$;

-- Make sure code_hash is NOT NULL (if we created it)
ALTER TABLE public.phone_verification_codes ALTER COLUMN code_hash SET NOT NULL;

-- Add used_at column if missing and drop old verified column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'phone_verification_codes' AND column_name = 'used_at'
  ) THEN
    ALTER TABLE public.phone_verification_codes ADD COLUMN used_at TIMESTAMP WITH TIME ZONE;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'phone_verification_codes' AND column_name = 'verified'
    ) THEN
      ALTER TABLE public.phone_verification_codes DROP COLUMN verified;
    END IF;
  END IF;
END $$;

-- Add attempt_count column if missing and drop old attempts column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'phone_verification_codes' AND column_name = 'attempt_count'
  ) THEN
    ALTER TABLE public.phone_verification_codes ADD COLUMN attempt_count INTEGER DEFAULT 0;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'phone_verification_codes' AND column_name = 'attempts'
    ) THEN
      ALTER TABLE public.phone_verification_codes DROP COLUMN attempts;
    END IF;
  END IF;
END $$;

-- 3. RLS and indexes
ALTER TABLE public.phone_verification_codes ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS phone_verification_codes_phone_idx ON public.phone_verification_codes(phone);
CREATE INDEX IF NOT EXISTS phone_verification_codes_user_id_idx ON public.phone_verification_codes(user_id);

DROP POLICY IF EXISTS "Admins have full access to phone_verification_codes" ON public.phone_verification_codes;
CREATE POLICY "Admins have full access to phone_verification_codes" ON public.phone_verification_codes
  FOR ALL USING (
    (auth.jwt() ->> 'email') = 'admin@nanoplay.com'
  );
