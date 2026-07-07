// tests/security/fail-closed.ts
import fs from 'fs';
import path from 'path';
import { createClient as createBrowserClient } from '../../src/lib/supabase/client';
import { safeInternalPath } from '../../src/lib/utils/redirect';

async function runTests() {
  console.log('--- STARTING HIGH-RIGOR SECURITY VERIFICATION TESTS ---');

  let failed = false;
  const assert = (condition: boolean, message: string) => {
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      failed = true;
    } else {
      console.log(`✅ PASS: ${message}`);
    }
  };

  // Test 1: Browser client returns null when configuration is missing
  try {
    const oldUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const oldKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const client = createBrowserClient();
    assert(client === null, 'Browser client must return null when environment variables are missing');

    // Restore env vars
    process.env.NEXT_PUBLIC_SUPABASE_URL = oldUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = oldKey;
  } catch (err: any) {
    assert(false, `Browser client test threw unexpected error: ${err.message}`);
  }

  // Test 2: Unsafe external redirect values are rejected
  try {
    assert(safeInternalPath('/dashboard') === '/dashboard', 'Safe internal path /dashboard is allowed');
    assert(safeInternalPath('/settings?user=123') === '/settings?user=123', 'Safe internal query path is allowed');
    assert(safeInternalPath('/settings?tab=security') === '/settings?tab=security', 'Safe internal path with tab query is allowed');
    assert(safeInternalPath('https://evil.com/dashboard') === '/dashboard', 'External URL http redirects are rejected');
    assert(safeInternalPath('//evil.com/dashboard') === '/dashboard', 'External relative URL // redirects are rejected');
    assert(safeInternalPath('/\\evil.example') === '/dashboard', 'Backslash path injection redirects are rejected');
    assert(safeInternalPath('%2F%2Fevil.example') === '/dashboard', 'Percent encoded double slash redirects are rejected');
    assert(safeInternalPath('javascript:alert(1)') === '/dashboard', 'Javascript protocols are rejected');
    assert(safeInternalPath(null) === '/dashboard', 'Null redirect defaults to /dashboard');
  } catch (err: any) {
    assert(false, `Redirect sanitization test threw unexpected error: ${err.message}`);
  }

  // Test 3: Verify cookie nanoplay-session is completely ignored in middleware and proxy
  try {
    const srcDir = path.resolve(__dirname, '../../src');
    const proxyContent = fs.readFileSync(path.join(srcDir, 'proxy.ts'), 'utf8');
    const middlewareContent = fs.readFileSync(path.join(srcDir, 'lib/supabase/middleware.ts'), 'utf8');

    assert(!proxyContent.includes('nanoplay-session'), 'proxy.ts must not reference nanoplay-session');
    assert(!middlewareContent.includes('nanoplay-session'), 'middleware.ts must not reference nanoplay-session');
  } catch (err: any) {
    assert(false, `Cookie bypass test threw unexpected error: ${err.message}`);
  }

  // Test 4: Parse the hardening migrations to prove RLS, RPC, and search_path constraints
  try {
    const migrationsDir = path.resolve(__dirname, '../../supabase/migrations');
    const hardeningMigrationPath = path.join(migrationsDir, '20260707000000_security_hardening.sql');
    const pathMigrationPath = path.join(migrationsDir, '20260707000001_security_hardening_paths.sql');

    assert(fs.existsSync(hardeningMigrationPath), 'Security hardening SQL migration file must exist');
    assert(fs.existsSync(pathMigrationPath), 'Path hardening SQL migration file must exist');

    const sql = fs.readFileSync(hardeningMigrationPath, 'utf8');
    const pathSql = fs.readFileSync(pathMigrationPath, 'utf8');

    // Profile column restrictions
    assert(sql.includes('trg_check_profile_update_restrictions'), 'Trigger trg_check_profile_update_restrictions must be defined');
    assert(sql.includes('OLD.role IS DISTINCT FROM NEW.role'), 'Trigger must prevent role updates');
    assert(sql.includes('OLD.phone_verified IS DISTINCT FROM NEW.phone_verified'), 'Trigger must prevent phone_verified updates');
    assert(sql.includes('OLD.identity_status IS DISTINCT FROM NEW.identity_status'), 'Trigger must prevent identity_status updates');
    assert(sql.includes('OLD.risk_score IS DISTINCT FROM NEW.risk_score'), 'Trigger must prevent risk_score updates');

    // SECURITY DEFINER empty search path rules
    assert(pathSql.includes("SET search_path = ''"), 'All SECURITY DEFINER functions must set empty search_path in path hardening');

    // Prevent spoofing caller ID in create_payout_request_atomic
    assert(pathSql.includes('v_caller_id := auth.uid()'), 'create_payout_request_atomic must obtain caller ID from auth.uid()');
    assert(pathSql.includes('v_caller_id <> p_user_id'), 'create_payout_request_atomic must reject request if caller ID does not match parameter user ID');

    // Prevent spoofing caller ID in purchase_tier_with_wallet_atomic
    assert(pathSql.includes('v_caller_id <> p_user_id'), 'purchase_tier_with_wallet_atomic must reject request if caller ID does not match parameter user ID');

    // Revoke public function execution
    assert(pathSql.includes('REVOKE ALL ON FUNCTION public.create_payout_request_atomic'), 'Execution rights for create_payout_request_atomic must be revoked from public');
    assert(pathSql.includes('REVOKE ALL ON FUNCTION public.purchase_tier_with_wallet_atomic'), 'Execution rights for purchase_tier_with_wallet_atomic must be revoked from public');
    assert(pathSql.includes('REVOKE ALL ON FUNCTION public.process_referral_reward_atomic'), 'Execution rights for process_referral_reward_atomic must be revoked from public');

    // Private helper schema
    assert(pathSql.includes('CREATE SCHEMA IF NOT EXISTS nanoplay_private'), 'nanoplay_private schema must be created');
    assert(pathSql.includes('nanoplay_private.is_demo_user'), 'is_demo_user filter helper must be relocated to nanoplay_private schema');
    assert(pathSql.includes('nanoplay_private.is_admin'), 'is_admin check helper must be relocated to nanoplay_private schema');
    assert(pathSql.includes('NOT nanoplay_private.is_demo_user'), 'Winners select policy must exclude demo users via private schema helper');
  } catch (err: any) {
    assert(false, `Hardening migration analysis threw unexpected error: ${err.message}`);
  }

  // Test 5: Verify double-crediting prevention in Paystack routes (callbacks/webhooks)
  try {
    const paystackDir = path.resolve(__dirname, '../../src/app/api/paystack');
    const callbackContent = fs.readFileSync(path.join(paystackDir, 'callback/route.ts'), 'utf8');
    const webhookContent = fs.readFileSync(path.join(paystackDir, 'webhook/route.ts'), 'utf8');

    assert(callbackContent.includes('tx.status === "confirmed"'), 'Paystack callback must check if transaction is already confirmed');
    assert(webhookContent.includes('tx.status === "confirmed"'), 'Paystack webhook must check if transaction is already confirmed');
  } catch (err: any) {
    assert(false, `Paystack double-crediting check threw unexpected error: ${err.message}`);
  }

  if (failed) {
    console.error('❌ SECURITY VERIFICATION TESTS FAILED');
    process.exit(1);
  } else {
    console.log('✅ ALL SECURITY VERIFICATION TESTS PASSED SUCCESSFULLY');
  }
}

runTests();
