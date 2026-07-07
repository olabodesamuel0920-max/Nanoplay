-- pgTAP database security tests for NanoPlay
BEGIN;
SELECT plan(16);

-- 1. Setup mock users
INSERT INTO auth.users (id, email)
VALUES 
  ('a0000000-0000-0000-0000-00000000000a', 'usera@nanoplay.test'),
  ('b0000000-0000-0000-0000-00000000000b', 'userb@nanoplay.test'),
  ('c0000000-0000-0000-0000-00000000000c', 'admin@nanoplay.test');

-- Update profiles to assign roles and verify status
UPDATE public.profiles SET username = 'usera', role = 'user', status = 'active', phone_verified = true, identity_status = 'verified' WHERE id = 'a0000000-0000-0000-0000-00000000000a';
UPDATE public.profiles SET username = 'userb', role = 'user', status = 'active', phone_verified = true, identity_status = 'verified' WHERE id = 'b0000000-0000-0000-0000-00000000000b';
UPDATE public.profiles SET username = 'adminuser', role = 'admin', status = 'active' WHERE id = 'c0000000-0000-0000-0000-00000000000c';

-- Seed wallets
UPDATE public.wallets SET balance_ngn = 10000 WHERE user_id = 'a0000000-0000-0000-0000-00000000000a';
UPDATE public.wallets SET balance_ngn = 10000 WHERE user_id = 'b0000000-0000-0000-0000-00000000000b';


-- Test 1: Verify auth.uid() claim simulation
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'a0000000-0000-0000-0000-00000000000a', true);
SELECT set_config('request.jwt.claim.role', 'authenticated', true);

SELECT is(auth.uid(), 'a0000000-0000-0000-0000-00000000000a'::uuid, 'Simulated auth.uid() should return User A UUID');


-- Test 2: User A can update allowed profile fields
SELECT lives_ok(
  $$ UPDATE public.profiles SET full_name = 'User A Renamed' WHERE id = 'a0000000-0000-0000-0000-00000000000a' $$,
  'User A can update their own full_name'
);


-- Test 3: User A cannot change role
SELECT throws_ok(
  $$ UPDATE public.profiles SET role = 'admin' WHERE id = 'a0000000-0000-0000-0000-00000000000a' $$,
  'P0001',
  'Unauthorized: You cannot update administrative or sensitive fields directly.',
  'User A cannot escalate their own role to admin'
);


-- Test 4: User A cannot change status
SELECT throws_ok(
  $$ UPDATE public.profiles SET status = 'demo' WHERE id = 'a0000000-0000-0000-0000-00000000000a' $$,
  'P0001',
  'Unauthorized: You cannot update administrative or sensitive fields directly.',
  'User A cannot change their status to demo'
);


-- Test 5: User A cannot change phone_verified
SELECT throws_ok(
  $$ UPDATE public.profiles SET phone_verified = true WHERE id = 'a0000000-0000-0000-0000-00000000000a' $$,
  'P0001',
  'Unauthorized: You cannot update administrative or sensitive fields directly.',
  'User A cannot directly modify phone_verified status'
);


-- Test 6: User A cannot update User B profile (RLS)
UPDATE public.profiles SET full_name = 'Hacked' WHERE id = 'b0000000-0000-0000-0000-00000000000b';
SELECT is(
  (SELECT full_name FROM public.profiles WHERE id = 'b0000000-0000-0000-0000-00000000000b'),
  NULL,
  'User A cannot update User B profile'
);


-- Test 7: Simulated admin user can update risk_score
RESET ROLE;
SELECT set_config('request.jwt.claim.sub', 'c0000000-0000-0000-0000-00000000000c', true);
SELECT set_config('request.jwt.claim.role', 'authenticated', true);
SET LOCAL ROLE authenticated;

SELECT lives_ok(
  $$ UPDATE public.profiles SET risk_score = 42 WHERE id = 'a0000000-0000-0000-0000-00000000000a' $$,
  'Admin user can update User A risk_score'
);


-- Test 8: User A cannot read User B wallet transactions
RESET ROLE;
SELECT set_config('request.jwt.claim.sub', 'a0000000-0000-0000-0000-00000000000a', true);
SELECT set_config('request.jwt.claim.role', 'authenticated', true);
SET LOCAL ROLE authenticated;

SELECT is(
  (SELECT count(*)::integer FROM public.wallet_transactions WHERE wallet_id = (SELECT id FROM public.wallets WHERE user_id = 'b0000000-0000-0000-0000-00000000000b')),
  0,
  'User A cannot read User B wallet transactions due to RLS'
);


-- Test 9: User A cannot request payout for User B
SELECT throws_ok(
  $$ SELECT public.create_payout_request_atomic('b0000000-0000-0000-0000-00000000000b', 1000, '{}'::jsonb) $$,
  'P0001',
  'Unauthorized: Cannot request payout for another user.',
  'User A cannot request payout for User B'
);


-- Test 10: User A cannot purchase tier for User B
SELECT throws_ok(
  $$ SELECT public.purchase_tier_with_wallet_atomic('b0000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-000000000001'::uuid, 'ref_1') $$,
  'P0001',
  'Unauthorized: Cannot purchase tier for another user.',
  'User A cannot purchase tier for User B'
);


-- Test 11: Unauthenticated anon callers cannot invoke create_payout_request_atomic
RESET ROLE;
SELECT set_config('request.jwt.claim.sub', NULL, true);
SELECT set_config('request.jwt.claim.role', 'anon', true);
SET LOCAL ROLE anon;

SELECT throws_ok(
  $$ SELECT public.create_payout_request_atomic('a0000000-0000-0000-0000-00000000000a', 1000, '{}'::jsonb) $$,
  '42501',
  NULL,
  'Unauthenticated caller cannot execute create_payout_request_atomic due to privilege revocation'
);


-- Test 12: Ordinary authenticated users cannot invoke admin RPCs
RESET ROLE;
SELECT set_config('request.jwt.claim.sub', 'a0000000-0000-0000-0000-00000000000a', true);
SELECT set_config('request.jwt.claim.role', 'authenticated', true);
SET LOCAL ROLE authenticated;

SELECT throws_ok(
  $$ SELECT public.adjust_user_wallet_admin('a0000000-0000-0000-0000-00000000000a', 'b0000000-0000-0000-0000-00000000000b', 1000, 'hack') $$,
  '42501',
  NULL,
  'Ordinary user cannot execute adjust_user_wallet_admin due to privilege revocation'
);


-- Test 13: Demo user is excluded from public Winners select queries
RESET ROLE;
SET LOCAL ROLE service_role;

INSERT INTO auth.users (id, email) VALUES ('d0000000-0000-0000-0000-00000000000d', 'demouser@nanoplay.test');
UPDATE public.profiles SET username = 'demouser', status = 'demo' WHERE id = 'd0000000-0000-0000-0000-00000000000d';
INSERT INTO public.challenge_rounds (id, round_number, status) VALUES ('10000000-0000-0000-0000-000000000001', 1, 'active');

INSERT INTO public.winners (user_id, round_id, payout_amount, verified)
VALUES 
  ('a0000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-000000000001', 5000, true),
  ('d0000000-0000-0000-0000-00000000000d', '10000000-0000-0000-0000-000000000001', 10000, true);

RESET ROLE;
SELECT set_config('request.jwt.claim.sub', NULL, true);
SELECT set_config('request.jwt.claim.role', 'anon', true);
SET LOCAL ROLE anon;

SELECT is(
  (SELECT count(*)::integer FROM public.winners),
  1,
  'Winners select query as anon should exclude demo user winners'
);


-- Test 14: Unique reference idempotency constraints
RESET ROLE;
SET LOCAL ROLE service_role;

INSERT INTO public.wallet_transactions (wallet_id, amount, type, reference, status)
VALUES 
  ((SELECT id FROM public.wallets WHERE user_id = 'a0000000-0000-0000-0000-00000000000a'), 5000, 'deposit', 'paystack_tx_ref_1', 'confirmed');

SELECT throws_ok(
  $$ INSERT INTO public.wallet_transactions (wallet_id, amount, type, reference, status)
     VALUES ((SELECT id FROM public.wallets WHERE user_id = 'a0000000-0000-0000-0000-00000000000a'), 5000, 'deposit', 'paystack_tx_ref_1', 'confirmed') $$,
  '23505',
  NULL,
  'Inserting duplicate Paystack reference must fail with unique constraint violation'
);


-- Test 15: SECURITY DEFINER isolation
SELECT is(
  (SELECT proconfig[1] FROM pg_proc WHERE proname = 'create_payout_request_atomic'),
  'search_path=',
  'Function create_payout_request_atomic search path must be set to empty'
);


-- Test 16: Verify execute privileges are revoked from PUBLIC
SELECT is(
  (SELECT pg_catalog.has_function_privilege('nobody', 'public.create_payout_request_atomic(UUID, INTEGER, JSONB)', 'execute')),
  false,
  'Public has no execute permission on create_payout_request_atomic'
);

SELECT * FROM finish();
ROLLBACK;
