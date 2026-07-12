-- Migration: Grant EXECUTE privilege on nanoplay_private.is_admin() to anon role
-- This prevents RLS evaluation crash for anonymous SELECT queries on tables with admin policies (like winners, profiles, account_tiers, etc.)
GRANT EXECUTE ON FUNCTION nanoplay_private.is_admin() TO anon;
