-- Migration: Recreate phone_verification_codes table and missing system tables/objects
-- 1. MODERN PHONE VERIFICATION CODES TABLE (CLEAN RECREATION)
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

-- 2. CREATE SYSTEM TABLES IF MISSING (For blank shadow DB & production initialization)
CREATE TABLE IF NOT EXISTS public.account_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  price_ngn INTEGER NOT NULL,
  perks JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.account_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier_id UUID REFERENCES public.account_tiers(id),
  amount_paid INTEGER NOT NULL,
  payment_reference TEXT UNIQUE NOT NULL,
  provider_reference TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.challenge_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_number INTEGER UNIQUE NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.challenge_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID REFERENCES public.challenge_rounds(id) ON DELETE CASCADE,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  kickoff_time TIMESTAMP WITH TIME ZONE NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_play', 'finished')),
  matchday INTEGER CHECK (matchday IN (1, 2, 3)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.challenge_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  round_id UUID REFERENCES public.challenge_rounds(id) ON DELETE CASCADE,
  tier_id UUID REFERENCES public.account_tiers(id),
  streak_count INTEGER DEFAULT 0,
  is_winner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID REFERENCES public.challenge_entries(id) ON DELETE CASCADE,
  match_id UUID REFERENCES public.challenge_matches(id) ON DELETE CASCADE,
  prediction TEXT NOT NULL CHECK (prediction IN ('1', 'X', '2')),
  is_locked BOOLEAN DEFAULT FALSE,
  is_correct BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(entry_id, match_id)
);

CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  balance_ngn INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'entry_fee', 'reward', 'referral_credit', 'withdrawal', 'reversal', 'refund', 'purchase', 'admin_adjustment')),
  reference TEXT UNIQUE,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'rejected', 'reversed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  bank_account_info JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected')),
  admin_notes TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  is_flagged BOOLEAN DEFAULT FALSE,
  flagging_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES public.profiles(id) UNIQUE,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'joined' CHECK (status IN ('joined', 'qualified', 'converted', 'flagged')),
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID REFERENCES public.referrals(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  round_id UUID REFERENCES public.challenge_rounds(id) ON DELETE CASCADE,
  payout_amount INTEGER NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
  internal_notes TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID REFERENCES public.challenge_rounds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  total_points INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('signup', 'login', 'payment', 'prediction', 'withdrawal')),
  ip_address TEXT,
  user_agent TEXT,
  timezone TEXT,
  device_fingerprint TEXT,
  device_metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'refund')),
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RLS ENABLEMENT & INDEXES
ALTER TABLE public.phone_verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_ledger ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS phone_verification_codes_phone_idx ON public.phone_verification_codes(phone);
CREATE INDEX IF NOT EXISTS phone_verification_codes_user_id_idx ON public.phone_verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_entry_id ON public.predictions(entry_id);
CREATE INDEX IF NOT EXISTS idx_predictions_match_id ON public.predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_challenge_entries_user_id ON public.challenge_entries(user_id);

-- 4. POLICIES (DROP AND CREATE)
-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
CREATE POLICY "Admins have full access to profiles" ON public.profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Phone verification codes policies
DROP POLICY IF EXISTS "Anyone can insert phone_verification_codes" ON public.phone_verification_codes;
CREATE POLICY "Anyone can insert phone_verification_codes" ON public.phone_verification_codes FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins have full access to phone_verification_codes" ON public.phone_verification_codes;
CREATE POLICY "Admins have full access to phone_verification_codes" ON public.phone_verification_codes FOR ALL USING (
  (auth.jwt() ->> 'email') = 'admin@nanoplay.com'
);

-- Account tiers policies
DROP POLICY IF EXISTS "Anyone can view active tiers" ON public.account_tiers;
CREATE POLICY "Anyone can view active tiers" ON public.account_tiers FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Admins have full access to account_tiers" ON public.account_tiers;
CREATE POLICY "Admins have full access to account_tiers" ON public.account_tiers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Account purchases policies
DROP POLICY IF EXISTS "Users can view their own purchases" ON public.account_purchases;
CREATE POLICY "Users can view their own purchases" ON public.account_purchases FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins have full access to purchases" ON public.account_purchases;
CREATE POLICY "Admins have full access to purchases" ON public.account_purchases FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Challenge rounds policies
DROP POLICY IF EXISTS "Anyone can view challenge rounds" ON public.challenge_rounds;
CREATE POLICY "Anyone can view challenge rounds" ON public.challenge_rounds FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins have full access to rounds" ON public.challenge_rounds;
CREATE POLICY "Admins have full access to rounds" ON public.challenge_rounds FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Challenge matches policies
DROP POLICY IF EXISTS "Anyone can view challenge matches" ON public.challenge_matches;
CREATE POLICY "Anyone can view challenge matches" ON public.challenge_matches FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins have full access to matches" ON public.challenge_matches;
CREATE POLICY "Admins have full access to matches" ON public.challenge_matches FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Challenge entries policies
DROP POLICY IF EXISTS "Users can view their own entries" ON public.challenge_entries;
CREATE POLICY "Users can view their own entries" ON public.challenge_entries FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins have full access to entries" ON public.challenge_entries;
CREATE POLICY "Admins have full access to entries" ON public.challenge_entries FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Predictions policies
DROP POLICY IF EXISTS "Users can view their own predictions" ON public.predictions;
CREATE POLICY "Users can view their own predictions" ON public.predictions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.challenge_entries e WHERE e.id = entry_id AND e.user_id = auth.uid())
);
DROP POLICY IF EXISTS "Users can insert their own predictions" ON public.predictions;
CREATE POLICY "Users can insert their own predictions" ON public.predictions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.challenge_entries e WHERE e.id = entry_id AND e.user_id = auth.uid())
);
DROP POLICY IF EXISTS "Users can update their own unconfirmed predictions" ON public.predictions;
CREATE POLICY "Users can update their own unconfirmed predictions" ON public.predictions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.challenge_entries e WHERE e.id = entry_id AND e.user_id = auth.uid())
);
DROP POLICY IF EXISTS "Admins have full access to predictions" ON public.predictions;
CREATE POLICY "Admins have full access to predictions" ON public.predictions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Wallets policies
DROP POLICY IF EXISTS "Users can view their own wallet" ON public.wallets;
CREATE POLICY "Users can view their own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins have full access to wallets" ON public.wallets;
CREATE POLICY "Admins have full access to wallets" ON public.wallets FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Wallet transactions policies
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.wallet_transactions;
CREATE POLICY "Users can view their own transactions" ON public.wallet_transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.wallets w WHERE w.id = wallet_id AND w.user_id = auth.uid())
);
DROP POLICY IF EXISTS "Admins have full access to wallet_transactions" ON public.wallet_transactions;
CREATE POLICY "Admins have full access to wallet_transactions" ON public.wallet_transactions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Payout requests policies
DROP POLICY IF EXISTS "Users can view/insert their own payout requests" ON public.payout_requests;
CREATE POLICY "Users can view/insert their own payout requests" ON public.payout_requests FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create payout requests" ON public.payout_requests;
CREATE POLICY "Users can create payout requests" ON public.payout_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins have full access to payout_requests" ON public.payout_requests;
CREATE POLICY "Admins have full access to payout_requests" ON public.payout_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Referrals policies
DROP POLICY IF EXISTS "Users can view their own referral activity" ON public.referrals;
CREATE POLICY "Users can view their own referral activity" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);
DROP POLICY IF EXISTS "Admins have full access to referrals" ON public.referrals;
CREATE POLICY "Admins have full access to referrals" ON public.referrals FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Referral rewards policies
DROP POLICY IF EXISTS "Users can view rewards for their referrals" ON public.referral_rewards;
CREATE POLICY "Users can view rewards for their referrals" ON public.referral_rewards FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.referrals r WHERE r.id = referral_id AND r.referrer_id = auth.uid())
);
DROP POLICY IF EXISTS "Admins have full access to referral_rewards" ON public.referral_rewards;
CREATE POLICY "Admins have full access to referral_rewards" ON public.referral_rewards FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Winners policies
DROP POLICY IF EXISTS "Anyone can view winners" ON public.winners;
CREATE POLICY "Anyone can view winners" ON public.winners FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins have full access to winners" ON public.winners;
CREATE POLICY "Admins have full access to winners" ON public.winners FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Support tickets policies
DROP POLICY IF EXISTS "Users can manage their own support tickets" ON public.support_tickets;
CREATE POLICY "Users can manage their own support tickets" ON public.support_tickets FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins have full access to support_tickets" ON public.support_tickets;
CREATE POLICY "Admins have full access to support_tickets" ON public.support_tickets FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Admin audit logs policies
DROP POLICY IF EXISTS "Admins only access to audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins only access to audit logs" ON public.admin_audit_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Leaderboard snapshots policies
DROP POLICY IF EXISTS "Anyone can view leaderboard snapshots" ON public.leaderboard_snapshots;
CREATE POLICY "Anyone can view leaderboard snapshots" ON public.leaderboard_snapshots FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins only access to leaderboard snapshots" ON public.leaderboard_snapshots;
CREATE POLICY "Admins only access to leaderboard snapshots" ON public.leaderboard_snapshots FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Security logs policies
DROP POLICY IF EXISTS "Users can insert security_logs for themselves" ON public.security_logs;
CREATE POLICY "Users can insert security_logs for themselves" ON public.security_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins have full access to security_logs" ON public.security_logs;
CREATE POLICY "Admins have full access to security_logs" ON public.security_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Platform settings policies
DROP POLICY IF EXISTS "Anyone can view platform settings" ON public.platform_settings;
CREATE POLICY "Anyone can view platform settings" ON public.platform_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins only access to platform settings" ON public.platform_settings;
CREATE POLICY "Admins only access to platform settings" ON public.platform_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Admin ledger policies
DROP POLICY IF EXISTS "Admins only access to admin ledger" ON public.admin_ledger;
CREATE POLICY "Admins only access to admin ledger" ON public.admin_ledger FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- 5. FUNCTIONS & TRIGGERS (RECREATE)
CREATE OR REPLACE FUNCTION public.normalize_phone(p_phone TEXT)
RETURNS TEXT AS $$
DECLARE
  v_digits TEXT;
BEGIN
  IF p_phone IS NULL OR p_phone = '' THEN
    RETURN NULL;
  END IF;
  v_digits := regexp_replace(p_phone, '\D', '', 'g');
  IF v_digits LIKE '0%' AND length(v_digits) = 11 THEN
    v_digits := '234' || substring(v_digits from 2);
  ELSIF length(v_digits) = 10 AND (v_digits LIKE '8%' OR v_digits LIKE '7%' OR v_digits LIKE '9%') THEN
    v_digits := '234' || v_digits;
  END IF;
  RETURN v_digits;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.trg_normalize_phone_func()
RETURNS TRIGGER AS $$
BEGIN
  NEW.normalized_phone := public.normalize_phone(NEW.phone);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_normalize_phone_before ON public.profiles;
CREATE TRIGGER trg_normalize_phone_before
BEFORE INSERT OR UPDATE OF phone ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.trg_normalize_phone_func();

CREATE OR REPLACE FUNCTION public.check_bank_account_uniqueness()
RETURNS TRIGGER AS $$
DECLARE
  v_other_user_id UUID;
BEGIN
  IF NEW.bank_account_number IS NOT NULL AND NEW.bank_account_number <> '' AND 
     (OLD.bank_account_number IS NULL OR NEW.bank_account_number <> OLD.bank_account_number) THEN
     SELECT id INTO v_other_user_id
     FROM public.profiles
     WHERE bank_account_number = NEW.bank_account_number AND id <> NEW.id
     LIMIT 1;
     IF v_other_user_id IS NOT NULL THEN
       NEW.bank_account_flagged := TRUE;
       NEW.bank_account_flagged_reason := 'Duplicate bank account number shared with user: ' || v_other_user_id;
       NEW.status := 'under_review';
       UPDATE public.profiles
       SET bank_account_flagged = TRUE,
           bank_account_flagged_reason = 'Duplicate bank account number shared with user: ' || NEW.id,
           status = 'under_review'
       WHERE id = v_other_user_id;
     END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_bank_account_uniqueness ON public.profiles;
CREATE TRIGGER trg_check_bank_account_uniqueness
BEFORE INSERT OR UPDATE OF bank_account_number ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.check_bank_account_uniqueness();

CREATE OR REPLACE FUNCTION public.calculate_risk_score(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_risk_score INTEGER := 0;
  v_phone TEXT;
  v_normalized_phone TEXT;
  v_bank_acc TEXT;
  v_ref_id UUID;
  v_share_phone_count INTEGER := 0;
  v_share_bank_count INTEGER := 0;
  v_share_device_count INTEGER := 0;
  v_share_ip_count INTEGER := 0;
  v_referral_self_abuse BOOLEAN := FALSE;
  v_fingerprint TEXT;
  v_ip TEXT;
BEGIN
  SELECT phone, normalized_phone, bank_account_number, last_device_fingerprint, last_ip_address
  INTO v_phone, v_normalized_phone, v_bank_acc, v_fingerprint, v_ip
  FROM public.profiles
  WHERE id = p_user_id;
  SELECT referrer_id INTO v_ref_id
  FROM public.referrals
  WHERE referred_user_id = p_user_id;
  IF v_normalized_phone IS NOT NULL AND v_normalized_phone <> '' THEN
    SELECT count(*) INTO v_share_phone_count
    FROM public.profiles
    WHERE normalized_phone = v_normalized_phone AND id <> p_user_id;
    IF v_share_phone_count > 0 THEN
      v_risk_score := v_risk_score + 100;
    END IF;
  END IF;
  IF v_bank_acc IS NOT NULL AND v_bank_acc <> '' THEN
    SELECT count(*) INTO v_share_bank_count
    FROM public.profiles
    WHERE bank_account_number = v_bank_acc AND id <> p_user_id;
    IF v_share_bank_count > 0 THEN
      v_risk_score := v_risk_score + 80;
    END IF;
  END IF;
  IF v_fingerprint IS NOT NULL AND v_fingerprint <> '' THEN
    SELECT count(DISTINCT id) INTO v_share_device_count
    FROM public.profiles
    WHERE last_device_fingerprint = v_fingerprint AND id <> p_user_id;
    IF v_share_device_count = 1 THEN
      v_risk_score := v_risk_score + 50;
    ELSIF v_share_device_count >= 2 THEN
      v_risk_score := v_risk_score + 85;
    END IF;
  END IF;
  IF v_ip IS NOT NULL AND v_ip <> '' THEN
    SELECT count(DISTINCT id) INTO v_share_ip_count
    FROM public.profiles
    WHERE last_ip_address = v_ip AND id <> p_user_id;
    IF v_share_ip_count >= 1 THEN
      v_risk_score := v_risk_score + 25;
    END IF;
  END IF;
  IF v_ref_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 
      FROM public.profiles p1
      JOIN public.profiles p2 ON p2.id = v_ref_id
      WHERE p1.id = p_user_id AND (
        (p1.last_device_fingerprint = p2.last_device_fingerprint AND p1.last_device_fingerprint IS NOT NULL AND p1.last_device_fingerprint <> '') OR
        (p1.last_ip_address = p2.last_ip_address AND p1.last_ip_address IS NOT NULL AND p1.last_ip_address <> '') OR
        (p1.bank_account_number = p2.bank_account_number AND p1.bank_account_number IS NOT NULL AND p1.bank_account_number <> '')
      )
    ) INTO v_referral_self_abuse;
    IF v_referral_self_abuse THEN
      v_risk_score := v_risk_score + 90;
    END IF;
  END IF;
  IF v_risk_score > 100 THEN
    v_risk_score := 100;
  END IF;
  RETURN v_risk_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.trg_recalculate_risk_func()
RETURNS TRIGGER AS $$
BEGIN
  NEW.risk_score := public.calculate_risk_score(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recalculate_risk ON public.profiles;
CREATE TRIGGER trg_recalculate_risk
BEFORE UPDATE OF phone, bank_account_number, last_device_fingerprint, last_ip_address ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.trg_recalculate_risk_func();

CREATE OR REPLACE FUNCTION public.check_prediction_rules()
RETURNS TRIGGER AS $$
DECLARE
  v_matchday INTEGER;
  v_round_id UUID;
  v_existing_count INTEGER;
  v_kickoff TIMESTAMP WITH TIME ZONE;
  v_phone_verified BOOLEAN;
  v_user_id UUID;
BEGIN
  SELECT user_id INTO v_user_id FROM public.challenge_entries WHERE id = NEW.entry_id;
  SELECT phone_verified INTO v_phone_verified FROM public.profiles WHERE id = v_user_id;
  IF v_phone_verified = FALSE OR v_phone_verified IS NULL THEN
    RAISE EXCEPTION 'Prediction blocked: Please verify your phone number via OTP first.';
  END IF;
  SELECT matchday, round_id, kickoff_time INTO v_matchday, v_round_id, v_kickoff FROM public.challenge_matches WHERE id = NEW.match_id;
  IF v_kickoff < NOW() THEN
    RAISE EXCEPTION 'Match has already kicked off and is locked.';
  END IF;
  SELECT count(*) INTO v_existing_count FROM public.predictions p JOIN public.challenge_matches m ON p.match_id = m.id
  WHERE p.entry_id = NEW.entry_id AND m.matchday = v_matchday AND p.id <> NEW.id;
  IF v_existing_count > 0 THEN
    RAISE EXCEPTION 'You have already submitted a prediction for Matchday %.', v_matchday;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_prediction_rules ON public.predictions;
CREATE TRIGGER trg_check_prediction_rules
BEFORE INSERT OR UPDATE ON public.predictions
FOR EACH ROW
EXECUTE FUNCTION public.check_prediction_rules();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, phone)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'username', new.email),
    new.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.wallets (user_id, balance_ngn)
  VALUES (new.id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.sync_wallet_balance()
RETURNS TRIGGER AS $$
DECLARE
  v_wallet_id UUID;
  v_balance INTEGER;
  v_profile_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_wallet_id := OLD.wallet_id;
  ELSE
    v_wallet_id := NEW.wallet_id;
  END IF;
  SELECT COALESCE(SUM(amount), 0) INTO v_balance FROM public.wallet_transactions WHERE wallet_id = v_wallet_id AND status = 'confirmed';
  UPDATE public.wallets SET balance_ngn = v_balance WHERE id = v_wallet_id RETURNING user_id INTO v_profile_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_wallet_balance ON public.wallet_transactions;
CREATE TRIGGER trg_sync_wallet_balance
AFTER INSERT OR UPDATE OF amount, status OR DELETE ON public.wallet_transactions
FOR EACH ROW
EXECUTE FUNCTION public.sync_wallet_balance();

-- 6. ATOMIC TRANSACTION FUNCTIONS
CREATE OR REPLACE FUNCTION public.create_payout_request_atomic(
  p_user_id UUID,
  p_amount INTEGER,
  p_bank_info JSONB
) RETURNS VOID AS $$
DECLARE
  v_wallet_id UUID;
  v_current_balance INTEGER;
  v_status TEXT;
  v_phone_verified BOOLEAN;
  v_identity_status TEXT;
  v_bank_account_flagged BOOLEAN;
  v_risk_score INTEGER;
BEGIN
  SELECT status, phone_verified, identity_status, bank_account_flagged, risk_score
  INTO v_status, v_phone_verified, v_identity_status, v_bank_account_flagged, v_risk_score
  FROM public.profiles
  WHERE id = p_user_id;
  IF v_status = 'suspended' THEN
    RAISE EXCEPTION 'Withdrawal blocked: User account is suspended.';
  END IF;
  IF v_phone_verified = FALSE OR v_phone_verified IS NULL THEN
    RAISE EXCEPTION 'Withdrawal blocked: Phone number is not verified.';
  END IF;
  IF v_identity_status <> 'verified' OR v_identity_status IS NULL THEN
    RAISE EXCEPTION 'Withdrawal blocked: KYC identification status is not verified.';
  END IF;
  IF v_bank_account_flagged = TRUE THEN
    RAISE EXCEPTION 'Withdrawal blocked: Bank account is flagged for duplication.';
  END IF;
  IF v_risk_score >= 70 THEN
    RAISE EXCEPTION 'Withdrawal blocked: Account flagged for security review (High Risk).';
  END IF;
  SELECT id, balance_ngn INTO v_wallet_id, v_current_balance FROM public.wallets WHERE user_id = p_user_id FOR UPDATE;
  IF v_wallet_id IS NULL THEN
    RAISE EXCEPTION 'Wallet not found for user %', p_user_id;
  END IF;
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance: % < %', v_current_balance, p_amount;
  END IF;
  INSERT INTO public.payout_requests (user_id, amount, bank_account_info, status)
  VALUES (p_user_id, p_amount, p_bank_info, 'pending');
  INSERT INTO public.wallet_transactions (wallet_id, amount, type, reference, status)
  VALUES (v_wallet_id, -p_amount, 'withdrawal', 'payout_request_' || gen_random_uuid(), 'confirmed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.resolve_payout_request_atomic(
  p_request_id UUID,
  p_admin_id UUID,
  p_new_status TEXT,
  p_admin_notes TEXT
) RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
  v_amount INTEGER;
  v_current_status TEXT;
  v_wallet_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_admin_id AND role = 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required.';
  END IF;
  SELECT user_id, amount, status INTO v_user_id, v_amount, v_current_status FROM public.payout_requests WHERE id = p_request_id FOR UPDATE;
  IF v_current_status IS NULL THEN
    RAISE EXCEPTION 'Payout request % not found', p_request_id;
  END IF;
  IF v_current_status != 'pending' THEN
    RAISE EXCEPTION 'Request is already %', v_current_status;
  END IF;
  IF p_new_status = 'rejected' THEN
    SELECT id INTO v_wallet_id FROM public.wallets WHERE user_id = v_user_id FOR UPDATE;
    INSERT INTO public.wallet_transactions (wallet_id, amount, type, reference, status)
    VALUES (v_wallet_id, v_amount, 'refund', 'payout_rejected_' || p_request_id, 'confirmed');
  END IF;
  UPDATE public.payout_requests SET status = p_new_status, admin_notes = p_admin_notes, processed_at = now() WHERE id = p_request_id;
  INSERT INTO public.admin_audit_logs (admin_id, action, target_user_id, details)
  VALUES (p_admin_id, 'payout_' || p_new_status, v_user_id, jsonb_build_object('request_id', p_request_id, 'amount', v_amount));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.adjust_user_wallet_admin(
  p_admin_id UUID,
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT
) RETURNS VOID AS $$
DECLARE
  v_wallet_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_admin_id AND role = 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required.';
  END IF;
  SELECT id INTO v_wallet_id FROM public.wallets WHERE user_id = p_user_id FOR UPDATE;
  IF v_wallet_id IS NULL THEN
    RAISE EXCEPTION 'Wallet not found for user %', p_user_id;
  END IF;
  INSERT INTO public.admin_ledger (admin_id, user_id, amount, type, reason)
  VALUES (p_admin_id, p_user_id, p_amount, CASE WHEN p_amount >= 0 THEN 'credit' ELSE 'debit' END, p_reason);
  INSERT INTO public.wallet_transactions (wallet_id, amount, type, reference, status)
  VALUES (v_wallet_id, p_amount, 'admin_adjustment', 'adj_' || gen_random_uuid(), 'confirmed');
  INSERT INTO public.admin_audit_logs (admin_id, action, target_user_id, details)
  VALUES (p_admin_id, 'wallet_adjustment', p_user_id, jsonb_build_object('amount', p_amount, 'reason', p_reason));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.purchase_tier_with_wallet_atomic(
  p_user_id UUID,
  p_tier_id UUID,
  p_payment_reference TEXT
) RETURNS VOID AS $$
DECLARE
  v_wallet_id UUID;
  v_balance INTEGER;
  v_tier_price INTEGER;
  v_active_round_id UUID;
BEGIN
  SELECT id, balance_ngn INTO v_wallet_id, v_balance FROM public.wallets WHERE user_id = p_user_id FOR UPDATE;
  IF v_wallet_id IS NULL THEN
    RAISE EXCEPTION 'Wallet not found for user %', p_user_id;
  END IF;
  SELECT price_ngn INTO v_tier_price FROM public.account_tiers WHERE id = p_tier_id;
  IF v_tier_price IS NULL THEN
    RAISE EXCEPTION 'Tier % not found', p_tier_id;
  END IF;
  IF v_balance < v_tier_price THEN
    RAISE EXCEPTION 'Insufficient balance: % < %', v_balance, v_tier_price;
  END IF;
  INSERT INTO public.wallet_transactions (wallet_id, amount, type, reference, status)
  VALUES (v_wallet_id, -v_tier_price, 'purchase', p_payment_reference, 'confirmed');
  INSERT INTO public.account_purchases (
    user_id, tier_id, amount_paid, payment_reference, provider_reference, status, verified_at
  ) VALUES (
    p_user_id, p_tier_id, v_tier_price, p_payment_reference, 'wallet', 'completed', now()
  );
  SELECT id INTO v_active_round_id FROM public.challenge_rounds WHERE status = 'active' LIMIT 1;
  IF v_active_round_id IS NOT NULL THEN
    INSERT INTO public.challenge_entries (user_id, round_id, tier_id, streak_count)
    SELECT p_user_id, v_active_round_id, p_tier_id, 0
    WHERE NOT EXISTS (
      SELECT 1 FROM public.challenge_entries 
      WHERE user_id = p_user_id AND round_id = v_active_round_id
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.evaluate_referral_bonus(p_referred_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_referral_id UUID;
  v_referrer_id UUID;
  v_reward_id UUID;
  v_reward_amount INTEGER;
  v_referred_phone_verified BOOLEAN;
  v_referred_has_purchased BOOLEAN;
  v_referred_has_predictions BOOLEAN;
  v_referred_fraud_score INTEGER;
  v_referrer_fraud_score INTEGER;
  v_wallet_id UUID;
  v_is_paid BOOLEAN;
  v_referred_device TEXT;
  v_referrer_device TEXT;
  v_referred_ip TEXT;
  v_referrer_ip TEXT;
  v_referred_bank TEXT;
  v_referrer_bank TEXT;
BEGIN
  SELECT r.id, r.referrer_id, rr.id, rr.amount, rr.is_paid
  INTO v_referral_id, v_referrer_id, v_reward_id, v_reward_amount, v_is_paid
  FROM public.referrals r
  JOIN public.referral_rewards rr ON r.id = rr.referral_id
  WHERE r.referred_user_id = p_referred_user_id;
  IF v_referral_id IS NULL OR v_is_paid THEN
    RETURN;
  END IF;
  SELECT phone_verified, risk_score, last_device_fingerprint, last_ip_address, bank_account_number
  INTO v_referred_phone_verified, v_referred_fraud_score, v_referred_device, v_referred_ip, v_referred_bank
  FROM public.profiles
  WHERE id = p_referred_user_id;
  SELECT risk_score, last_device_fingerprint, last_ip_address, bank_account_number
  INTO v_referrer_fraud_score, v_referrer_device, v_referrer_ip, v_referrer_bank
  FROM public.profiles
  WHERE id = v_referrer_id;
  IF (v_referred_device = v_referrer_device AND v_referred_device IS NOT NULL AND v_referred_device <> '') OR
     (v_referred_ip = v_referrer_ip AND v_referred_ip IS NOT NULL AND v_referred_ip <> '') OR
     (v_referred_bank = v_referrer_bank AND v_referred_bank IS NOT NULL AND v_referred_bank <> '') OR
     (p_referred_user_id = v_referrer_id) THEN
     UPDATE public.profiles
     SET risk_score = GREATEST(risk_score, 90),
         status = 'under_review',
         bank_account_flagged = TRUE,
         bank_account_flagged_reason = 'Referral self-abuse or linked account overlap detected.'
     WHERE id IN (p_referred_user_id, v_referrer_id);
     RETURN;
  END IF;
  SELECT EXISTS (
    SELECT 1 FROM public.predictions p JOIN public.challenge_entries e ON p.entry_id = e.id WHERE e.user_id = p_referred_user_id AND p.is_locked = TRUE
  ) INTO v_referred_has_predictions;
  SELECT EXISTS (
    SELECT 1 FROM public.account_purchases WHERE user_id = p_referred_user_id AND status = 'completed'
  ) INTO v_referred_has_purchased;
  IF v_referred_phone_verified AND v_referred_has_purchased AND v_referred_has_predictions AND v_referred_fraud_score < 70 AND v_referrer_fraud_score < 70 THEN
     SELECT id INTO v_wallet_id FROM public.wallets WHERE user_id = v_referrer_id FOR UPDATE;
     IF v_wallet_id IS NOT NULL THEN
       UPDATE public.referral_rewards SET is_paid = TRUE WHERE id = v_reward_id;
       UPDATE public.referrals SET status = 'qualified' WHERE id = v_referral_id;
       INSERT INTO public.wallet_transactions (wallet_id, amount, type, reference, status)
       VALUES (v_wallet_id, v_reward_amount, 'referral_credit', 'referral_bonus_confirmed_' || p_referred_user_id, 'confirmed');
     END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.process_referral_reward_atomic(
  p_referrer_id UUID,
  p_referred_user_id UUID,
  p_referral_code TEXT,
  p_reward_amount INTEGER
) RETURNS VOID AS $$
DECLARE
  v_referral_id UUID;
  v_referred_device TEXT;
  v_referrer_device TEXT;
  v_referred_ip TEXT;
  v_referrer_ip TEXT;
  v_referred_bank TEXT;
  v_referrer_bank TEXT;
BEGIN
  SELECT id INTO v_referral_id FROM public.referrals WHERE referrer_id = p_referrer_id AND referred_user_id = p_referred_user_id;
  IF v_referral_id IS NOT NULL THEN
    RETURN;
  END IF;
  SELECT last_device_fingerprint, last_ip_address, bank_account_number INTO v_referred_device, v_referred_ip, v_referred_bank FROM public.profiles WHERE id = p_referred_user_id;
  SELECT last_device_fingerprint, last_ip_address, bank_account_number INTO v_referrer_device, v_referrer_ip, v_referrer_bank FROM public.profiles WHERE id = p_referrer_id;
  IF (p_referred_user_id = p_referrer_id) OR
     (v_referred_device = v_referrer_device AND v_referred_device IS NOT NULL AND v_referred_device <> '') OR
     (v_referred_ip = v_referrer_ip AND v_referred_ip IS NOT NULL AND v_referred_ip <> '') OR
     (v_referred_bank = v_referrer_bank AND v_referred_bank IS NOT NULL AND v_referred_bank <> '') THEN
     INSERT INTO public.referrals (referrer_id, referred_user_id, referral_code, status, is_flagged)
     VALUES (p_referrer_id, p_referred_user_id, p_referral_code, 'flagged', TRUE) RETURNING id INTO v_referral_id;
     INSERT INTO public.referral_rewards (referral_id, amount, is_paid) VALUES (v_referral_id, p_reward_amount, FALSE);
     UPDATE public.profiles
     SET risk_score = GREATEST(risk_score, 90),
         status = 'under_review',
         bank_account_flagged = TRUE,
         bank_account_flagged_reason = 'Referral self-abuse or linked account overlap detected.'
     WHERE id IN (p_referred_user_id, p_referrer_id);
     RETURN;
  END IF;
  INSERT INTO public.referrals (referrer_id, referred_user_id, referral_code, status) VALUES (p_referrer_id, p_referred_user_id, p_referral_code, 'joined') RETURNING id INTO v_referral_id;
  INSERT INTO public.referral_rewards (referral_id, amount, is_paid) VALUES (v_referral_id, p_reward_amount, FALSE);
  PERFORM public.evaluate_referral_bonus(p_referred_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.settle_round_winner_atomic(
  p_entry_id UUID,
  p_admin_id UUID
) RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
  v_round_id UUID;
  v_tier_id UUID;
  v_reward_amount INTEGER;
  v_is_winner BOOLEAN;
BEGIN
  IF p_admin_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_admin_id AND role = 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required.';
  END IF;
  SELECT user_id, round_id, tier_id, is_winner INTO v_user_id, v_round_id, v_tier_id, v_is_winner FROM public.challenge_entries WHERE id = p_entry_id FOR UPDATE;
  IF v_is_winner THEN
    RETURN;
  END IF;
  SELECT price_ngn * 10 INTO v_reward_amount FROM public.account_tiers WHERE id = v_tier_id;
  UPDATE public.challenge_entries SET is_winner = TRUE WHERE id = p_entry_id;
  INSERT INTO public.winners (user_id, round_id, payout_amount, verified) VALUES (v_user_id, v_round_id, v_reward_amount, FALSE);
  IF p_admin_id IS NOT NULL THEN
    INSERT INTO public.admin_audit_logs (admin_id, action, target_user_id, details)
    VALUES (p_admin_id, 'settle_winner_to_queue', v_user_id, jsonb_build_object('entry_id', p_entry_id, 'amount', v_reward_amount));
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.approve_winner_atomic(
  p_winner_id UUID,
  p_admin_id UUID
) RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
  v_round_id UUID;
  v_payout_amount INTEGER;
  v_verified BOOLEAN;
  v_wallet_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_admin_id AND role = 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required.';
  END IF;
  SELECT user_id, round_id, payout_amount, verified INTO v_user_id, v_round_id, v_payout_amount, v_verified FROM public.winners WHERE id = p_winner_id FOR UPDATE;
  IF v_verified THEN
    RETURN;
  END IF;
  UPDATE public.winners SET verified = TRUE WHERE id = p_winner_id;
  SELECT id INTO v_wallet_id FROM public.wallets WHERE user_id = v_user_id FOR UPDATE;
  IF v_wallet_id IS NULL THEN
    RAISE EXCEPTION 'Wallet not found for user';
  END IF;
  INSERT INTO public.wallet_transactions (wallet_id, amount, type, reference, status)
  VALUES (v_wallet_id, v_payout_amount, 'reward', 'round_win_approved_' || p_winner_id, 'confirmed');
  INSERT INTO public.admin_audit_logs (admin_id, action, target_user_id, details)
  VALUES (p_admin_id, 'approve_winner_payout', v_user_id, jsonb_build_object('winner_id', p_winner_id, 'amount', v_payout_amount));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Redefine increment_otp_attempts function to match the new schema columns
CREATE OR REPLACE FUNCTION public.increment_otp_attempts(p_phone TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.phone_verification_codes
  SET attempt_count = attempt_count + 1
  WHERE phone = p_phone AND used_at IS NULL AND expires_at > now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 7. SEED INITIAL SYSTEM DATA (If not already present)
INSERT INTO public.account_tiers (name, price_ngn, perks) VALUES
('Starter', 5000, '{"reward": "₦50,000", "predictions_per_round": 3, "referral_bonus": 1000}'::jsonb),
('Standard', 10000, '{"reward": "₦100,000", "predictions_per_round": 3, "referral_bonus": 1000, "priority": true}'::jsonb),
('Premium', 20000, '{"reward": "₦200,000", "predictions_per_round": 3, "referral_bonus": 1000, "priority": true, "elite_badge": true}'::jsonb)
ON CONFLICT (name) DO UPDATE SET price_ngn = EXCLUDED.price_ngn, perks = EXCLUDED.perks;

INSERT INTO public.platform_settings (key, value, description) VALUES
('maintenance_mode', 'false', 'Enable or disable platform maintenance mode.'),
('tier_pricing', '{"starter": 5000, "standard": 10000, "premium": 20000}', 'Pricing for account tiers in NGN.'),
('referral_bonus', '1000', 'Bonus amount for successful referrals in NGN.'),
('payout_limits', '{"min": 5000, "max": 500000}', 'Minimum and maximum payout limits.'),
('announcement_banner', '{"text": "Welcome to NanoPlay! Elite Tiers are now active.", "active": true}', 'Homepage announcement banner content.'),
('trust_stats_mode', '"real"', 'Display mode for homepage stats: "real" or "launch".')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 8. SEED LAUNCH CHALLENGE ROUND #1 (Conditionally)
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
