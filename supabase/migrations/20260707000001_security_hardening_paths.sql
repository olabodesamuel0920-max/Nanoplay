-- Migration: 20260707000001_security_hardening_paths.sql
-- Description: Move sensitive RLS helpers to private schema, secure all SECURITY DEFINER search paths, fully qualify relations, and drop old overloads/functions.

-- 1. CREATE PRIVATE SCHEMA AND CONFIGURE PRIVILEGES
CREATE SCHEMA IF NOT EXISTS nanoplay_private;

REVOKE ALL ON SCHEMA nanoplay_private FROM PUBLIC;
REVOKE ALL ON SCHEMA nanoplay_private FROM anon;
REVOKE ALL ON SCHEMA nanoplay_private FROM authenticated;

GRANT USAGE ON SCHEMA nanoplay_private TO anon;
GRANT USAGE ON SCHEMA nanoplay_private TO authenticated;
GRANT USAGE ON SCHEMA nanoplay_private TO service_role;


-- 2. CREATE HARDENED INTERNAL HELPERS IN PRIVATE SCHEMA
CREATE OR REPLACE FUNCTION nanoplay_private.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'admin'
  );
$$;

ALTER FUNCTION nanoplay_private.is_admin() OWNER TO postgres;
REVOKE ALL ON FUNCTION nanoplay_private.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION nanoplay_private.is_admin() FROM anon;
REVOKE ALL ON FUNCTION nanoplay_private.is_admin() FROM authenticated;
GRANT EXECUTE ON FUNCTION nanoplay_private.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION nanoplay_private.is_admin() TO service_role;


CREATE OR REPLACE FUNCTION nanoplay_private.is_demo_user(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = p_user_id AND profiles.status = 'demo'
  );
$$;

ALTER FUNCTION nanoplay_private.is_demo_user(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION nanoplay_private.is_demo_user(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION nanoplay_private.is_demo_user(UUID) FROM anon;
REVOKE ALL ON FUNCTION nanoplay_private.is_demo_user(UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION nanoplay_private.is_demo_user(UUID) TO anon;
GRANT EXECUTE ON FUNCTION nanoplay_private.is_demo_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION nanoplay_private.is_demo_user(UUID) TO service_role;


-- 3. RECREATE ALL RLS POLICIES TO USE QUALIFIED PRIVATE HELPERS

-- A. winners policy
DROP POLICY IF EXISTS "Anyone can view winners" ON public.winners;
CREATE POLICY "Anyone can view winners" ON public.winners FOR SELECT USING (
  NOT nanoplay_private.is_demo_user(winners.user_id)
);

-- B. is_admin policies
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
CREATE POLICY "Admins have full access to profiles" ON public.profiles FOR ALL USING (
  nanoplay_private.is_admin()
);

DROP POLICY IF EXISTS "Admins have full access to account_tiers" ON public.account_tiers;
CREATE POLICY "Admins have full access to account_tiers" ON public.account_tiers FOR ALL USING (
  nanoplay_private.is_admin()
);

DROP POLICY IF EXISTS "Admins have full access to purchases" ON public.account_purchases;
CREATE POLICY "Admins have full access to purchases" ON public.account_purchases FOR ALL USING (
  nanoplay_private.is_admin()
);

DROP POLICY IF EXISTS "Admins have full access to rounds" ON public.challenge_rounds;
CREATE POLICY "Admins have full access to rounds" ON public.challenge_rounds FOR ALL USING (
  nanoplay_private.is_admin()
);

DROP POLICY IF EXISTS "Admins have full access to matches" ON public.challenge_matches;
CREATE POLICY "Admins have full access to matches" ON public.challenge_matches FOR ALL USING (
  nanoplay_private.is_admin()
);

DROP POLICY IF EXISTS "Admins have full access to entries" ON public.challenge_entries;
CREATE POLICY "Admins have full access to entries" ON public.challenge_entries FOR ALL USING (
  nanoplay_private.is_admin()
);

DROP POLICY IF EXISTS "Admins have full access to predictions" ON public.predictions;
CREATE POLICY "Admins have full access to predictions" ON public.predictions FOR ALL USING (
  nanoplay_private.is_admin()
);

DROP POLICY IF EXISTS "Admins have full access to wallets" ON public.wallets;
CREATE POLICY "Admins have full access to wallets" ON public.wallets FOR ALL USING (
  nanoplay_private.is_admin()
);

DROP POLICY IF EXISTS "Admins have full access to wallet_transactions" ON public.wallet_transactions;
CREATE POLICY "Admins have full access to wallet_transactions" ON public.wallet_transactions FOR ALL USING (
  nanoplay_private.is_admin()
);

DROP POLICY IF EXISTS "Admins have full access to payout_requests" ON public.payout_requests;
CREATE POLICY "Admins have full access to payout_requests" ON public.payout_requests FOR ALL USING (
  nanoplay_private.is_admin()
);

DROP POLICY IF EXISTS "Admins have full access to referrals" ON public.referrals;
CREATE POLICY "Admins have full access to referrals" ON public.referrals FOR ALL USING (
  nanoplay_private.is_admin()
);

DROP POLICY IF EXISTS "Admins have full access to referral_rewards" ON public.referral_rewards;
CREATE POLICY "Admins have full access to referral_rewards" ON public.referral_rewards FOR ALL USING (
  nanoplay_private.is_admin()
);

DROP POLICY IF EXISTS "Admins have full access to winners" ON public.winners;
CREATE POLICY "Admins have full access to winners" ON public.winners FOR ALL USING (
  nanoplay_private.is_admin()
);

DROP POLICY IF EXISTS "Admins have full access to support_tickets" ON public.support_tickets;
CREATE POLICY "Admins have full access to support_tickets" ON public.support_tickets FOR ALL USING (
  nanoplay_private.is_admin()
);

DROP POLICY IF EXISTS "Admins only access to audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins only access to audit logs" ON public.admin_audit_logs FOR ALL USING (
  nanoplay_private.is_admin()
);

DROP POLICY IF EXISTS "Admins only access to leaderboard snapshots" ON public.leaderboard_snapshots;
CREATE POLICY "Admins only access to leaderboard snapshots" ON public.leaderboard_snapshots FOR ALL USING (
  nanoplay_private.is_admin()
);

DROP POLICY IF EXISTS "Admins have full access to security_logs" ON public.security_logs;
CREATE POLICY "Admins have full access to security_logs" ON public.security_logs FOR ALL USING (
  nanoplay_private.is_admin()
);

DROP POLICY IF EXISTS "Admins only access to platform settings" ON public.platform_settings;
CREATE POLICY "Admins only access to platform settings" ON public.platform_settings FOR ALL USING (
  nanoplay_private.is_admin()
);

DROP POLICY IF EXISTS "Admins only access to admin ledger" ON public.admin_ledger;
CREATE POLICY "Admins only access to admin ledger" ON public.admin_ledger FOR ALL USING (
  nanoplay_private.is_admin()
);


-- 4. HARDEN AND REDEFINE ATOMIC SENSITIVE FUNCTIONS

CREATE OR REPLACE FUNCTION public.create_payout_request_atomic(
  p_user_id UUID,
  p_amount INTEGER,
  p_bank_info JSONB
) RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
DECLARE
  v_wallet_id UUID;
  v_current_balance INTEGER;
  v_status TEXT;
  v_phone_verified BOOLEAN;
  v_identity_status TEXT;
  v_bank_account_flagged BOOLEAN;
  v_risk_score INTEGER;
  v_caller_id UUID;
BEGIN
  -- Retrieve authenticated caller ID
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Unauthenticated user session.';
  END IF;
  
  -- Prevent user ID spoofing
  IF v_caller_id <> p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Cannot request payout for another user.';
  END IF;

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
  VALUES (v_wallet_id, -p_amount, 'withdrawal', 'payout_request_' || pg_catalog.gen_random_uuid(), 'confirmed');
END;
$$;

REVOKE ALL ON FUNCTION public.create_payout_request_atomic(UUID, INTEGER, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_payout_request_atomic(UUID, INTEGER, JSONB) FROM anon;
GRANT EXECUTE ON FUNCTION public.create_payout_request_atomic(UUID, INTEGER, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_payout_request_atomic(UUID, INTEGER, JSONB) TO service_role;


CREATE OR REPLACE FUNCTION public.purchase_tier_with_wallet_atomic(
  p_user_id UUID,
  p_tier_id UUID,
  p_payment_reference TEXT
) RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
DECLARE
  v_wallet_id UUID;
  v_balance INTEGER;
  v_tier_price INTEGER;
  v_active_round_id UUID;
  v_caller_id UUID;
BEGIN
  -- Retrieve authenticated caller ID
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Unauthenticated user session.';
  END IF;
  
  -- Prevent user ID spoofing
  IF v_caller_id <> p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Cannot purchase tier for another user.';
  END IF;

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
    p_user_id, p_tier_id, v_tier_price, p_payment_reference, 'wallet', 'completed', pg_catalog.now()
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
$$;

REVOKE ALL ON FUNCTION public.purchase_tier_with_wallet_atomic(UUID, UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.purchase_tier_with_wallet_atomic(UUID, UUID, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.purchase_tier_with_wallet_atomic(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.purchase_tier_with_wallet_atomic(UUID, UUID, TEXT) TO service_role;


CREATE OR REPLACE FUNCTION public.process_referral_reward_atomic(
  p_referrer_id UUID,
  p_referred_user_id UUID,
  p_referral_code TEXT,
  p_reward_amount INTEGER
) RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
DECLARE
  v_referral_id UUID;
  v_referred_device TEXT;
  v_referrer_device TEXT;
  v_referred_ip TEXT;
  v_referrer_ip TEXT;
  v_referred_bank TEXT;
  v_referrer_bank TEXT;
BEGIN
  -- Strict role validation
  IF pg_catalog.current_setting('role', true) <> 'service_role' THEN
    RAISE EXCEPTION 'Unauthorized: Only service_role can trigger referral processing.';
  END IF;

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
$$;

REVOKE ALL ON FUNCTION public.process_referral_reward_atomic(UUID, UUID, TEXT, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.process_referral_reward_atomic(UUID, UUID, TEXT, INTEGER) FROM anon;
REVOKE ALL ON FUNCTION public.process_referral_reward_atomic(UUID, UUID, TEXT, INTEGER) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.process_referral_reward_atomic(UUID, UUID, TEXT, INTEGER) TO service_role;


CREATE OR REPLACE FUNCTION public.adjust_user_wallet_admin(
  p_admin_id UUID,
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT
) RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
DECLARE
  v_wallet_id UUID;
  v_caller_role TEXT;
BEGIN
  -- Strict caller role check
  IF pg_catalog.current_setting('role', true) <> 'service_role' THEN
    SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
    IF v_caller_role IS DISTINCT FROM 'admin' THEN
      RAISE EXCEPTION 'Unauthorized: Admin access required.';
    END IF;
    IF auth.uid() <> p_admin_id THEN
      RAISE EXCEPTION 'Unauthorized: Admin ID mismatch.';
    END IF;
  END IF;

  SELECT id INTO v_wallet_id FROM public.wallets WHERE user_id = p_user_id FOR UPDATE;
  IF v_wallet_id IS NULL THEN
    RAISE EXCEPTION 'Wallet not found for user %', p_user_id;
  END IF;

  INSERT INTO public.admin_ledger (admin_id, user_id, amount, type, reason)
  VALUES (p_admin_id, p_user_id, p_amount, CASE WHEN p_amount >= 0 THEN 'credit' ELSE 'debit' END, p_reason);

  INSERT INTO public.wallet_transactions (wallet_id, amount, type, reference, status)
  VALUES (v_wallet_id, p_amount, 'admin_adjustment', 'adj_' || pg_catalog.gen_random_uuid(), 'confirmed');

  INSERT INTO public.admin_audit_logs (admin_id, action, target_user_id, details)
  VALUES (p_admin_id, 'wallet_adjustment', p_user_id, pg_catalog.jsonb_build_object('amount', p_amount, 'reason', p_reason));
END;
$$;

REVOKE ALL ON FUNCTION public.adjust_user_wallet_admin(UUID, UUID, INTEGER, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.adjust_user_wallet_admin(UUID, UUID, INTEGER, TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.adjust_user_wallet_admin(UUID, UUID, INTEGER, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.adjust_user_wallet_admin(UUID, UUID, INTEGER, TEXT) TO service_role;


CREATE OR REPLACE FUNCTION public.resolve_payout_request_atomic(
  p_request_id UUID,
  p_admin_id UUID,
  p_new_status TEXT,
  p_admin_notes TEXT
) RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID;
  v_amount INTEGER;
  v_current_status TEXT;
  v_wallet_id UUID;
  v_caller_role TEXT;
BEGIN
  -- Strict caller role check
  IF pg_catalog.current_setting('role', true) <> 'service_role' THEN
    SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
    IF v_caller_role IS DISTINCT FROM 'admin' THEN
      RAISE EXCEPTION 'Unauthorized: Admin access required.';
    END IF;
    IF auth.uid() <> p_admin_id THEN
      RAISE EXCEPTION 'Unauthorized: Admin ID mismatch.';
    END IF;
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

  UPDATE public.payout_requests SET status = p_new_status, admin_notes = p_admin_notes, processed_at = pg_catalog.now() WHERE id = p_request_id;

  INSERT INTO public.admin_audit_logs (admin_id, action, target_user_id, details)
  VALUES (p_admin_id, 'payout_' || p_new_status, v_user_id, pg_catalog.jsonb_build_object('request_id', p_request_id, 'amount', v_amount));
END;
$$;

REVOKE ALL ON FUNCTION public.resolve_payout_request_atomic(UUID, UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.resolve_payout_request_atomic(UUID, UUID, TEXT, TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.resolve_payout_request_atomic(UUID, UUID, TEXT, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_payout_request_atomic(UUID, UUID, TEXT, TEXT) TO service_role;


CREATE OR REPLACE FUNCTION public.settle_round_winner_atomic(
  p_entry_id UUID,
  p_admin_id UUID
) RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID;
  v_round_id UUID;
  v_tier_id UUID;
  v_reward_amount INTEGER;
  v_is_winner BOOLEAN;
  v_caller_role TEXT;
BEGIN
  -- Strict caller role check
  IF pg_catalog.current_setting('role', true) <> 'service_role' THEN
    IF p_admin_id IS NULL THEN
      RAISE EXCEPTION 'Unauthorized: Admin context required.';
    END IF;
    SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
    IF v_caller_role IS DISTINCT FROM 'admin' THEN
      RAISE EXCEPTION 'Unauthorized: Admin access required.';
    END IF;
    IF auth.uid() <> p_admin_id THEN
      RAISE EXCEPTION 'Unauthorized: Admin ID mismatch.';
    END IF;
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
    VALUES (p_admin_id, 'settle_winner_to_queue', v_user_id, pg_catalog.jsonb_build_object('entry_id', p_entry_id, 'amount', v_reward_amount));
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.settle_round_winner_atomic(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.settle_round_winner_atomic(UUID, UUID) FROM anon;
REVOKE ALL ON FUNCTION public.settle_round_winner_atomic(UUID, UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.settle_round_winner_atomic(UUID, UUID) TO service_role;


CREATE OR REPLACE FUNCTION public.approve_winner_atomic(
  p_winner_id UUID,
  p_admin_id UUID
) RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID;
  v_round_id UUID;
  v_payout_amount INTEGER;
  v_verified BOOLEAN;
  v_wallet_id UUID;
  v_caller_role TEXT;
BEGIN
  -- Strict caller role check
  IF pg_catalog.current_setting('role', true) <> 'service_role' THEN
    SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
    IF v_caller_role IS DISTINCT FROM 'admin' THEN
      RAISE EXCEPTION 'Unauthorized: Admin access required.';
    END IF;
    IF auth.uid() <> p_admin_id THEN
      RAISE EXCEPTION 'Unauthorized: Admin ID mismatch.';
    END IF;
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
  VALUES (p_admin_id, 'approve_winner_payout', v_user_id, pg_catalog.jsonb_build_object('winner_id', p_winner_id, 'amount', v_payout_amount));
END;
$$;

REVOKE ALL ON FUNCTION public.approve_winner_atomic(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.approve_winner_atomic(UUID, UUID) FROM anon;
REVOKE ALL ON FUNCTION public.approve_winner_atomic(UUID, UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.approve_winner_atomic(UUID, UUID) TO service_role;


-- 5. DROP OBSOLETE PUBLIC SCHEMA DUPLICATES/UNHARDENED FUNCTIONS
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_demo_user(UUID);
