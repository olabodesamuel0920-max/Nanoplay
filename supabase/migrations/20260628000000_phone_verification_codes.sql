-- Create phone_verification_codes table with normalized phone and hashing (run 5)
DROP TABLE IF EXISTS public.phone_verification_codes CASCADE;
CREATE TABLE public.phone_verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  attempt_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.phone_verification_codes ENABLE ROW LEVEL SECURITY;

-- Add indexes for fast lookup
CREATE INDEX IF NOT EXISTS phone_verification_codes_phone_idx ON public.phone_verification_codes(phone);
CREATE INDEX IF NOT EXISTS phone_verification_codes_user_id_idx ON public.phone_verification_codes(user_id);

-- Restrict all public select, update, insert.
-- Server Action uses createAdminClient which bypasses RLS (using service role).
-- We define a policy for Admin panel audits.
DROP POLICY IF EXISTS "Admins have full access to phone_verification_codes" ON public.phone_verification_codes;
CREATE POLICY "Admins have full access to phone_verification_codes" ON public.phone_verification_codes
  FOR ALL USING (
    (auth.jwt() ->> 'email') = 'admin@nanoplay.com'
  );

-- Seed launch challenge round #1 conditionally
DO $$
DECLARE
  v_round_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.challenge_rounds WHERE round_number = 1) THEN
    -- Create Round 1
    INSERT INTO public.challenge_rounds (round_number, start_date, end_date, status)
    VALUES (1, NOW() - interval '1 hour', NOW() + interval '7 days', 'active')
    RETURNING id INTO v_round_id;

    -- Create 3 Match Fixtures
    -- Match 1
    INSERT INTO public.challenge_matches (round_id, home_team, away_team, kickoff_time, matchday, status)
    VALUES (v_round_id, 'Arsenal', 'Manchester United', NOW() + interval '2 days', 1, 'scheduled');
    
    -- Match 2
    INSERT INTO public.challenge_matches (round_id, home_team, away_team, kickoff_time, matchday, status)
    VALUES (v_round_id, 'Real Madrid', 'Barcelona', NOW() + interval '3 days', 2, 'scheduled');

    -- Match 3
    INSERT INTO public.challenge_matches (round_id, home_team, away_team, kickoff_time, matchday, status)
    VALUES (v_round_id, 'Bayern Munich', 'Dortmund', NOW() + interval '4 days', 3, 'scheduled');
  END IF;
END $$;

-- Redefine increment_otp_attempts function to match the new schema columns
CREATE OR REPLACE FUNCTION public.increment_otp_attempts(p_phone TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.phone_verification_codes
  SET attempt_count = attempt_count + 1
  WHERE phone = p_phone AND used_at IS NULL AND expires_at > now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

