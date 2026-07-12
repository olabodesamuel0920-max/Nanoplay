-- pgTAP database security tests for NanoPlay
BEGIN;
SELECT plan(21);

-- Grant privileges to service_role within this test transaction to allow setup and test operations
GRANT USAGE ON SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO service_role;

-- Grant standard table privileges to authenticated and anon roles so that RLS can be evaluated
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;


-- 1. Setup mock users under default role (postgres)
INSERT INTO auth.users (id, email)
VALUES 
  ('a0000000-0000-0000-0000-00000000000a', 'usera@nanoplay.test'),
  ('b0000000-0000-0000-0000-00000000000b', 'userb@nanoplay.test'),
  ('c0000000-0000-0000-0000-00000000000c', 'admin@nanoplay.test');

-- 2. Switch role to service_role to update profiles to bypass trigger checks
SET ROLE service_role;

-- Update profiles to assign roles and verify status (User A starts with phone_verified = false)
UPDATE public.profiles SET username = 'usera', full_name = 'User A', role = 'user', status = 'active', phone_verified = false, identity_status = 'verified' WHERE id = 'a0000000-0000-0000-0000-00000000000a';
UPDATE public.profiles SET username = 'userb', full_name = 'User B', role = 'user', status = 'active', phone_verified = true, identity_status = 'verified' WHERE id = 'b0000000-0000-0000-0000-00000000000b';
UPDATE public.profiles SET username = 'adminuser', role = 'admin', status = 'active' WHERE id = 'c0000000-0000-0000-0000-00000000000c';

-- Seed wallets
UPDATE public.wallets SET balance_ngn = 10000 WHERE user_id = 'a0000000-0000-0000-0000-00000000000a';
UPDATE public.wallets SET balance_ngn = 10000 WHERE user_id = 'b0000000-0000-0000-0000-00000000000b';

-- 3. Reset role back to postgres for the rest of pgTAP tests execution
RESET ROLE;


-- Test 1: Verify auth.uid() claim simulation
SET LOCAL "request.jwt.claim.sub" = 'a0000000-0000-0000-0000-00000000000a';
SET LOCAL "request.jwt.claim.role" = 'authenticated';
SET LOCAL ROLE authenticated;
SELECT is(auth.uid(), 'a0000000-0000-0000-0000-00000000000a'::uuid, 'Simulated auth.uid() should return User A UUID');
RESET ROLE;


-- Test 2: User A can update allowed profile fields
SET LOCAL "request.jwt.claim.sub" = 'a0000000-0000-0000-0000-00000000000a';
SET LOCAL "request.jwt.claim.role" = 'authenticated';
SET LOCAL ROLE authenticated;
SELECT lives_ok(
  $$ UPDATE public.profiles SET full_name = 'User A Renamed' WHERE id = 'a0000000-0000-0000-0000-00000000000a' $$,
  'User A can update their own full_name'
);
RESET ROLE;


-- Test 3: User A cannot change role
SET LOCAL "request.jwt.claim.sub" = 'a0000000-0000-0000-0000-00000000000a';
SET LOCAL "request.jwt.claim.role" = 'authenticated';
SET LOCAL ROLE authenticated;
SELECT throws_ok(
  $$ UPDATE public.profiles SET role = 'admin' WHERE id = 'a0000000-0000-0000-0000-00000000000a' $$,
  'P0001',
  'Unauthorized: You cannot update administrative or sensitive fields directly.',
  'User A cannot escalate their own role to admin'
);
RESET ROLE;


-- Test 4: User A cannot change status
SET LOCAL "request.jwt.claim.sub" = 'a0000000-0000-0000-0000-00000000000a';
SET LOCAL "request.jwt.claim.role" = 'authenticated';
SET LOCAL ROLE authenticated;
SELECT throws_ok(
  $$ UPDATE public.profiles SET status = 'demo' WHERE id = 'a0000000-0000-0000-0000-00000000000a' $$,
  'P0001',
  'Unauthorized: You cannot update administrative or sensitive fields directly.',
  'User A cannot change their status to demo'
);
RESET ROLE;


-- Test 5: User A cannot change phone_verified
SET LOCAL "request.jwt.claim.sub" = 'a0000000-0000-0000-0000-00000000000a';
SET LOCAL "request.jwt.claim.role" = 'authenticated';
SET LOCAL ROLE authenticated;
SELECT throws_ok(
  $$ UPDATE public.profiles SET phone_verified = true WHERE id = 'a0000000-0000-0000-0000-00000000000a' $$,
  'P0001',
  'Unauthorized: You cannot update administrative or sensitive fields directly.',
  'User A cannot directly modify phone_verified status'
);
RESET ROLE;


-- Test 6: User A cannot update User B profile (RLS)
SET LOCAL "request.jwt.claim.sub" = 'a0000000-0000-0000-0000-00000000000a';
SET LOCAL "request.jwt.claim.role" = 'authenticated';
SET LOCAL ROLE authenticated;
UPDATE public.profiles SET full_name = 'Hacked' WHERE id = 'b0000000-0000-0000-0000-00000000000b';
RESET ROLE;

SELECT is(
  (SELECT full_name FROM public.profiles WHERE id = 'b0000000-0000-0000-0000-00000000000b'),
  'User B',
  'User A cannot update User B profile due to RLS'
);


-- Test 7: Privileged workflow (service_role) can update risk_score
SET ROLE service_role;
SELECT lives_ok(
  $$ UPDATE public.profiles SET risk_score = 42 WHERE id = 'a0000000-0000-0000-0000-00000000000a' $$,
  'Privileged workflow (service_role) can update risk_score'
);
RESET ROLE;


-- Test 8: Admin user cannot update risk_score directly via client SQL
SET LOCAL "request.jwt.claim.sub" = 'c0000000-0000-0000-0000-00000000000c';
SET LOCAL "request.jwt.claim.role" = 'authenticated';
SET LOCAL ROLE authenticated;
SELECT throws_ok(
  $$ UPDATE public.profiles SET risk_score = 99 WHERE id = 'a0000000-0000-0000-0000-00000000000a' $$,
  'P0001',
  'Unauthorized: You cannot update administrative or sensitive fields directly.',
  'Admin user cannot update risk_score directly via client SQL'
);
RESET ROLE;


-- Test 9: User A cannot read User B wallet transactions
SET LOCAL "request.jwt.claim.sub" = 'a0000000-0000-0000-0000-00000000000a';
SET LOCAL "request.jwt.claim.role" = 'authenticated';
SET LOCAL ROLE authenticated;
SELECT is(
  (SELECT count(*)::integer FROM public.wallet_transactions WHERE wallet_id = (SELECT id FROM public.wallets WHERE user_id = 'b0000000-0000-0000-0000-00000000000b')),
  0,
  'User A cannot read User B wallet transactions due to RLS'
);
RESET ROLE;


-- Test 10: User A cannot request payout for User B
SET LOCAL "request.jwt.claim.sub" = 'a0000000-0000-0000-0000-00000000000a';
SET LOCAL "request.jwt.claim.role" = 'authenticated';
SET LOCAL ROLE authenticated;
SELECT throws_ok(
  $$ SELECT public.create_payout_request_atomic('b0000000-0000-0000-0000-00000000000b', 1000, '{}'::jsonb) $$,
  'P0001',
  'Unauthorized: Cannot request payout for another user.',
  'User A cannot request payout for User B'
);
RESET ROLE;


-- Test 11: User A cannot purchase tier for User B
SET LOCAL "request.jwt.claim.sub" = 'a0000000-0000-0000-0000-00000000000a';
SET LOCAL "request.jwt.claim.role" = 'authenticated';
SET LOCAL ROLE authenticated;
SELECT throws_ok(
  $$ SELECT public.purchase_tier_with_wallet_atomic('b0000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-000000000001'::uuid, 'ref_1') $$,
  'P0001',
  'Unauthorized: Cannot purchase tier for another user.',
  'User A cannot purchase tier for User B'
);
RESET ROLE;


-- Test 12: Unauthenticated anon callers cannot invoke create_payout_request_atomic
SET ROLE anon;
SELECT throws_ok(
  $$ SELECT public.create_payout_request_atomic('a0000000-0000-0000-0000-00000000000a', 1000, '{}'::jsonb) $$,
  '42501',
  NULL,
  'Unauthenticated caller cannot execute create_payout_request_atomic due to privilege revocation'
);
RESET ROLE;


-- Test 13: Ordinary authenticated users cannot invoke admin RPCs
SET LOCAL "request.jwt.claim.sub" = 'a0000000-0000-0000-0000-00000000000a';
SET LOCAL "request.jwt.claim.role" = 'authenticated';
SET LOCAL ROLE authenticated;
SELECT throws_ok(
  $$ SELECT public.adjust_user_wallet_admin('a0000000-0000-0000-0000-00000000000b', 'b0000000-0000-0000-0000-00000000000b', 1000, 'hack') $$,
  '42501',
  NULL,
  'Ordinary user cannot execute adjust_user_wallet_admin due to privilege revocation'
);
RESET ROLE;


-- Test 14: Demo user is excluded from public Winners select queries
-- Setup demo user and challenge rounds under default postgres role
INSERT INTO auth.users (id, email) VALUES ('d0000000-0000-0000-0000-00000000000d', 'demouser@nanoplay.test');

SET ROLE service_role;
UPDATE public.profiles SET username = 'demouser', status = 'demo' WHERE id = 'd0000000-0000-0000-0000-00000000000d';
INSERT INTO public.challenge_rounds (id, round_number, status, start_date, end_date) 
VALUES ('10000000-0000-0000-0000-000000000001', 999, 'active', NOW(), NOW() + INTERVAL '7 days');

INSERT INTO public.winners (user_id, round_id, payout_amount, verified)
VALUES 
  ('a0000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-000000000001', 5000, true),
  ('d0000000-0000-0000-0000-00000000000d', '10000000-0000-0000-0000-000000000001', 10000, true);

SET ROLE anon;
SELECT is(
  (SELECT count(*)::integer FROM public.winners),
  1,
  'Winners select query as anon should exclude demo user winners'
);
RESET ROLE;


-- Test 15: Unique reference idempotency constraints
SET ROLE service_role;
INSERT INTO public.wallet_transactions (wallet_id, amount, type, reference, status)
VALUES 
  ((SELECT id FROM public.wallets WHERE user_id = 'a0000000-0000-0000-0000-00000000000a'), 5000, 'deposit', 'paystack_tx_ref_1', 'confirmed');

SELECT throws_ok(
  $$
    INSERT INTO public.wallet_transactions (wallet_id, amount, type, reference, status)
    VALUES ((SELECT id FROM public.wallets WHERE user_id = 'a0000000-0000-0000-0000-00000000000a'), 5000, 'deposit', 'paystack_tx_ref_1', 'confirmed');
  $$,
  '23505',
  NULL,
  'Inserting duplicate Paystack reference must fail with unique constraint violation'
);
RESET ROLE;


-- Test 16: SECURITY DEFINER isolation
SELECT is(
  (SELECT proconfig[1] FROM pg_proc WHERE proname = 'create_payout_request_atomic'),
  'search_path=""',
  'Function create_payout_request_atomic search path must be set to empty'
);


-- Test 17: Verify execute privileges are revoked from PUBLIC
SELECT is(
  (SELECT pg_catalog.has_function_privilege('public', 'public.create_payout_request_atomic(UUID, INTEGER, JSONB)', 'execute')),
  false,
  'Public has no execute permission on create_payout_request_atomic'
);


-- Test 18: Verify anon cannot call is_admin() with parameters to query other users' status (throws signature error)
SET ROLE anon;
SELECT throws_ok(
  $$ SELECT nanoplay_private.is_admin('a0000000-0000-0000-0000-00000000000a'::uuid) $$,
  '42883',
  NULL,
  'Anon cannot query admin status of another user via is_admin arguments due to signature mismatch'
);
RESET ROLE;


-- Test 19: Verify is_admin() returns false for anon (unauthenticated)
SET ROLE anon;
SELECT is(
  nanoplay_private.is_admin(),
  false,
  'is_admin() returns false for unauthenticated anon caller'
);
RESET ROLE;

-- Test 20: Verify service_role can call create_payout_request_atomic
SET ROLE service_role;
SELECT lives_ok(
  $$ SELECT public.create_payout_request_atomic('b0000000-0000-0000-0000-00000000000b', 5000, '{"bank": "test"}'::jsonb) $$,
  'service_role can execute create_payout_request_atomic without active web session'
);
RESET ROLE;


-- Test 21: Verify service_role can call purchase_tier_with_wallet_atomic
SET ROLE service_role;
INSERT INTO public.account_tiers (id, name, price_ngn, perks) 
VALUES ('00000000-0000-0000-0000-000000000002', 'Standard', 10000, '{}'::jsonb)
ON CONFLICT (name) DO NOTHING;

SELECT lives_ok(
  $$ SELECT public.purchase_tier_with_wallet_atomic('b0000000-0000-0000-0000-00000000000b', (SELECT id FROM public.account_tiers WHERE name = 'Standard'), 'payment_ref_test') $$,
  'service_role can execute purchase_tier_with_wallet_atomic without active web session'
);
RESET ROLE;

SELECT * FROM finish();
ROLLBACK;
