-- CREATE is_admin helper function with security definer to bypass RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'admin'
  );
$$;

-- Revoke public execution and grant to authenticated role for safety
ALTER FUNCTION public.is_admin() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.is_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;

-- 1. profiles policies fix
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
CREATE POLICY "Admins have full access to profiles" ON public.profiles FOR ALL USING (
  public.is_admin()
);

-- 2. account_tiers policies fix
DROP POLICY IF EXISTS "Admins have full access to account_tiers" ON public.account_tiers;
CREATE POLICY "Admins have full access to account_tiers" ON public.account_tiers FOR ALL USING (
  public.is_admin()
);

-- 3. account_purchases policies fix
DROP POLICY IF EXISTS "Admins have full access to purchases" ON public.account_purchases;
CREATE POLICY "Admins have full access to purchases" ON public.account_purchases FOR ALL USING (
  public.is_admin()
);

-- 4. challenge_rounds policies fix
DROP POLICY IF EXISTS "Admins have full access to rounds" ON public.challenge_rounds;
CREATE POLICY "Admins have full access to rounds" ON public.challenge_rounds FOR ALL USING (
  public.is_admin()
);

-- 5. challenge_matches policies fix
DROP POLICY IF EXISTS "Admins have full access to matches" ON public.challenge_matches;
CREATE POLICY "Admins have full access to matches" ON public.challenge_matches FOR ALL USING (
  public.is_admin()
);

-- 6. challenge_entries policies fix
DROP POLICY IF EXISTS "Admins have full access to entries" ON public.challenge_entries;
CREATE POLICY "Admins have full access to entries" ON public.challenge_entries FOR ALL USING (
  public.is_admin()
);

-- 7. predictions policies fix
DROP POLICY IF EXISTS "Admins have full access to predictions" ON public.predictions;
CREATE POLICY "Admins have full access to predictions" ON public.predictions FOR ALL USING (
  public.is_admin()
);

-- 8. wallets policies fix
DROP POLICY IF EXISTS "Admins have full access to wallets" ON public.wallets;
CREATE POLICY "Admins have full access to wallets" ON public.wallets FOR ALL USING (
  public.is_admin()
);

-- 9. wallet_transactions policies fix
DROP POLICY IF EXISTS "Admins have full access to wallet_transactions" ON public.wallet_transactions;
CREATE POLICY "Admins have full access to wallet_transactions" ON public.wallet_transactions FOR ALL USING (
  public.is_admin()
);

-- 10. payout_requests policies fix
DROP POLICY IF EXISTS "Admins have full access to payout_requests" ON public.payout_requests;
CREATE POLICY "Admins have full access to payout_requests" ON public.payout_requests FOR ALL USING (
  public.is_admin()
);

-- 11. referrals policies fix
DROP POLICY IF EXISTS "Admins have full access to referrals" ON public.referrals;
CREATE POLICY "Admins have full access to referrals" ON public.referrals FOR ALL USING (
  public.is_admin()
);

-- 12. referral_rewards policies fix
DROP POLICY IF EXISTS "Admins have full access to referral_rewards" ON public.referral_rewards;
CREATE POLICY "Admins have full access to referral_rewards" ON public.referral_rewards FOR ALL USING (
  public.is_admin()
);

-- 13. winners policies fix
DROP POLICY IF EXISTS "Admins have full access to winners" ON public.winners;
CREATE POLICY "Admins have full access to winners" ON public.winners FOR ALL USING (
  public.is_admin()
);

-- 14. support_tickets policies fix
DROP POLICY IF EXISTS "Admins have full access to support_tickets" ON public.support_tickets;
CREATE POLICY "Admins have full access to support_tickets" ON public.support_tickets FOR ALL USING (
  public.is_admin()
);

-- 15. admin_audit_logs policies fix
DROP POLICY IF EXISTS "Admins only access to audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins only access to audit logs" ON public.admin_audit_logs FOR ALL USING (
  public.is_admin()
);

-- 16. leaderboard_snapshots policies fix
DROP POLICY IF EXISTS "Admins only access to leaderboard snapshots" ON public.leaderboard_snapshots;
CREATE POLICY "Admins only access to leaderboard snapshots" ON public.leaderboard_snapshots FOR ALL USING (
  public.is_admin()
);

-- 17. security_logs policies fix
DROP POLICY IF EXISTS "Admins have full access to security_logs" ON public.security_logs;
CREATE POLICY "Admins have full access to security_logs" ON public.security_logs FOR ALL USING (
  public.is_admin()
);

-- 18. platform_settings policies fix
DROP POLICY IF EXISTS "Admins only access to platform settings" ON public.platform_settings;
CREATE POLICY "Admins only access to platform settings" ON public.platform_settings FOR ALL USING (
  public.is_admin()
);

-- 19. admin_ledger policies fix
DROP POLICY IF EXISTS "Admins only access to admin ledger" ON public.admin_ledger;
CREATE POLICY "Admins only access to admin ledger" ON public.admin_ledger FOR ALL USING (
  public.is_admin()
);
