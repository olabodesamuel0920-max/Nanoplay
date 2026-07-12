-- 20260707000004_harden_atomic_service_role.sql
-- Allow service_role to call user-atomic functions without active web session

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
    -- Bypass auth session check for service_role calls
    IF pg_catalog.current_setting('role', true) = 'service_role' THEN
      v_caller_id := p_user_id;
    ELSE
      RAISE EXCEPTION 'Unauthorized: Unauthenticated user session.';
    END IF;
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
    -- Bypass auth session check for service_role calls
    IF pg_catalog.current_setting('role', true) = 'service_role' THEN
      v_caller_id := p_user_id;
    ELSE
      RAISE EXCEPTION 'Unauthorized: Unauthenticated user session.';
    END IF;
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
