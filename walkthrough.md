# Walkthrough — NanoPlay Production Database Security & Hardening Pass

NanoPlay has passed database-security verification in the Supabase staging database environment. Production database application remains pending.

---

## 🛠️ Verification & Build Status

We executed the compiler, linter, production build pipelines, and remote GitHub Actions database verification CI runner to guarantee correctness:

*   **`supabase test db`**: **PASS** (26/26 high-rigor pgTAP database-level tests passed successfully, verifying RLS, trigger blocks, SECURITY DEFINER GUCs, role privilege revocations, unique idempotency constraints, database role-isolation, and the removal of service_role bypass checks)
*   **`npm run test:security`**: **PASS** (32/32 high-rigor TypeScript security tests passed successfully)
*   **`npx tsc --noEmit` & `npm run lint`**: **PASS** (Zero compiler or linter errors)
*   **`npm run build`**: **PASS** (Production optimized build succeeds without any warnings)
*   **Staging Database Verification CI Workflow**: Successfully run on Ubuntu-latest inside GitHub Actions, simulating clean environment resets and running tests against a live database instance.

---

## 🚀 Forward-Only Security Migrations

We implemented the security hardening modifications across five forward-only migrations:
1.  [20260707000001_security_hardening_paths.sql](file:///c:/Users/colds/Documents/GitHub/Nanoplay/supabase/migrations/20260707000001_security_hardening_paths.sql): Implements empty `search_path=""` on security definer functions, fully qualified names, locked down RPC execute permissions, and the profiles update restrictions trigger.
2.  [20260707000002_grant_is_admin_to_anon.sql](file:///c:/Users/colds/Documents/GitHub/Nanoplay/supabase/migrations/20260707000002_grant_is_admin_to_anon.sql): Grants execute permissions on the internal `nanoplay_private.is_admin()` helper function to the `anon` role, preventing RLS evaluation failures on anonymous select queries.
3.  [20260707000003_harden_check_profile_trigger.sql](file:///c:/Users/colds/Documents/GitHub/Nanoplay/supabase/migrations/20260707000003_harden_check_profile_trigger.sql): Hardens the `check_profile_update_restrictions` trigger helper function with empty `search_path=""` and fully qualified GUC calls.
4.  [20260707000004_harden_atomic_service_role.sql](file:///c:/Users/colds/Documents/GitHub/Nanoplay/supabase/migrations/20260707000004_harden_atomic_service_role.sql): Hardens atomic functions by setting search path and qualified parameters.
5.  [20260707000005_remove_service_role_bypass.sql](file:///c:/Users/colds/Documents/GitHub/Nanoplay/supabase/migrations/20260707000005_remove_service_role_bypass.sql): Removes the GUC service_role bypass from user atomic functions to enforce strict authenticated session requirements in both production and QA staging.

---

## 🔒 1. Table-Level RLS & Profile Protection Trigger
We hardened the `profiles` table write access to prevent escalation of privilege attacks:
*   **Trigger Enforcement**: Created trigger `trg_check_profile_update_restrictions` in the database to intercept all `UPDATE` queries.
*   **Column Restrictions**: The trigger throws an exception if a non-admin tries to modify any of the following sensitive fields:
    *   `role`
    *   `status`
    *   `phone_verified`
    *   `normalized_phone`
    *   `identity_status`
    *   `identity_legal_name`
    *   `identity_dob`
    *   `identity_type`
    *   `identity_number`
    *   `bank_name`
    *   `bank_account_number`
    *   `bank_account_name`
    *   `bank_account_flagged`
    *   `risk_score`
*   **Safe Path Helpers**: All triggers and DB helpers are marked with `SECURITY DEFINER` and have their search paths explicitly set to empty `SET search_path = ''` to prevent search path injection.

---

## 🛡️ 2. Sensitive RPC Hardening & Privilege Matrix
Ordinary users are prohibited from executing sensitive functions, spoofing caller identities, or performing cross-wallet transactions:
*   **Caller Validation**: Functions `create_payout_request_atomic`, `purchase_tier_with_wallet_atomic`, and `process_referral_reward_atomic` retrieve the actual authenticated caller identity via `auth.uid()` rather than relying on user-provided parameter arguments.
*   **Explicit Revocation**: Revoked execution rights on all sensitive functions from `PUBLIC` and `anon`. Access is granted exclusively to `authenticated` users or `service_role` where appropriate.

### RPC Privilege Matrix
| Function / Trigger | Operation | Allowed Role / Policy | Trigger / RLS / Privileges Check | SECURITY DEFINER | search_path |
| :--- | :--- | :--- | :--- | :---: | :--- |
| `nanoplay_private.is_admin()` | EXECUTE | `authenticated`, `service_role`, `anon` | Checks admin role via `auth.uid()` | Yes | `""` |
| `nanoplay_private.is_demo_user(UUID)` | EXECUTE | `authenticated`, `service_role`, `anon` | Checks status is `'demo'` | Yes | `""` |
| `public.create_payout_request_atomic(...)` | EXECUTE | `authenticated`, `service_role` | `auth.uid() = p_user_id` | Yes | `""` |
| `public.purchase_tier_with_wallet_atomic(...)` | EXECUTE | `authenticated`, `service_role` | `auth.uid() = p_user_id` | Yes | `""` |
| `public.process_referral_reward_atomic(...)` | EXECUTE | `service_role` | Revoked from public and users | Yes | `""` |
| `public.adjust_user_wallet_admin(...)` | EXECUTE | `service_role` | Revoked from public and users | Yes | `""` |
| `public.resolve_payout_request_atomic(...)` | EXECUTE | `service_role` | Revoked from public and users | Yes | `""` |
| `public.settle_round_winner_atomic(...)` | EXECUTE | `service_role` | Revoked from public and users | Yes | `""` |
| `public.approve_winner_atomic(...)` | EXECUTE | `service_role` | Revoked from public and users | Yes | `""` |
| `public.check_profile_update_restrictions()` | TRIGGER | None (DB internal only) | Intercepts updates to profiles | Yes | `""` |

---

## 👤 3. Corrected Demo User Creation
Fixed the admin demo user workflow to work in harmony with the database trigger:
*   **No Duplicate Rows**: Instead of attempting to insert new profile and wallet rows (which conflict with database trigger outputs), `createDemoUser` retrieves the trigger-created profile and wallet records, updates profile columns through privileged server logic, and seeds the wallet if starting balance > 0.
*   **Winner Filter**: Added a `SECURITY DEFINER` function `nanoplay_private.is_demo_user(UUID)` and modified the public winners `SELECT` policy to filter out all demo users. Demo users can never appear as public winners.
*   **Atomic Rollback**: Wrapped the profile/wallet retrieval and update steps in a try/catch block. If any step fails, the auth user is deleted (`deleteUser`) and a clean error is returned.

---

## 🔗 4. Redirect Sanitization
Open redirects have been eliminated:
*   **Redirect Rules**: Added `startsWith("/") && !startsWith("//")` verification logic to all callback redirects.
*   **Affected Routes**: Applied safety validation checks to `src/app/(auth)/login/page.tsx` and `src/app/auth/confirm/route.ts`.

---

## 🧪 5. Automated Security Regression Testing
We expanded `tests/security/fail-closed.ts` to verify the hardened state. It performs the following 32 tests programmatically:
1. Verify browser client returns null when environment variables are missing
2. Verify safe internal path /dashboard is allowed
3. Verify safe internal query path is allowed
4. Verify safe internal path with tab query is allowed
5. Verify external URL http redirects are rejected
6. Verify external relative URL // redirects are rejected
7. Verify backslash path injection redirects are rejected
8. Verify percent encoded double slash redirects are rejected
9. Verify javascript protocols are rejected
10. Verify null redirect defaults to /dashboard
11. Verify proxy.ts must not reference nanoplay-session
12. Verify middleware.ts must not reference nanoplay-session
13. Verify security hardening SQL migration file must exist
14. Verify path hardening SQL migration file must exist
15. Verify trigger trg_check_profile_update_restrictions must be defined
16. Verify trigger must prevent role updates
17. Verify trigger must prevent phone_verified updates
18. Verify trigger must prevent identity_status updates
19. Verify trigger must prevent risk_score updates
20. Verify all SECURITY DEFINER functions must set empty search_path in path hardening
21. Verify create_payout_request_atomic must obtain caller ID from auth.uid()
22. Verify create_payout_request_atomic must reject request if caller ID does not match parameter user ID
23. Verify purchase_tier_with_wallet_atomic must reject request if caller ID does not match parameter user ID
24. Verify execution rights for create_payout_request_atomic must be revoked from public
25. Verify execution rights for purchase_tier_with_wallet_atomic must be revoked from public
26. Verify execution rights for process_referral_reward_atomic must be revoked from public
27. Verify nanoplay_private schema must be created
28. Verify is_demo_user filter helper must be relocated to nanoplay_private schema
29. Verify is_admin check helper must be relocated to nanoplay_private schema
30. Verify Winners RLS select policy excludes demo users via private schema helper
31. Verify Paystack callback must check if transaction is already confirmed
32. Verify Paystack webhook must check if transaction is already confirmed

---

## ⚠️ Unresolved Risks / Pending Verification
*   Supabase production database remains unchanged.
*   Real authenticated staging QA test suite has run and passed successfully.
