-- Migration: Harden check_profile_update_restrictions function
-- Sets search_path = '' and qualifies current_setting with pg_catalog to prevent search path hijacking.
CREATE OR REPLACE FUNCTION public.check_profile_update_restrictions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Bypass check if the role is service_role or database admin (representing admin actions/server-side actions)
  IF pg_catalog.current_setting('role', true) = 'service_role' OR pg_catalog.current_setting('role', true) = 'supabase_admin' THEN
    RETURN NEW;
  END IF;

  -- Otherwise, block normal authenticated/anon users from altering administrative/sensitive fields
  IF OLD.role IS DISTINCT FROM NEW.role OR
     OLD.status IS DISTINCT FROM NEW.status OR
     OLD.phone_verified IS DISTINCT FROM NEW.phone_verified OR
     OLD.identity_status IS DISTINCT FROM NEW.identity_status OR
     OLD.risk_score IS DISTINCT FROM NEW.risk_score OR
     OLD.admin_notes IS DISTINCT FROM NEW.admin_notes OR
     OLD.bank_account_flagged IS DISTINCT FROM NEW.bank_account_flagged OR
     OLD.bank_account_flagged_reason IS DISTINCT FROM NEW.bank_account_flagged_reason OR
     OLD.normalized_phone IS DISTINCT FROM NEW.normalized_phone OR
     OLD.identity_legal_name IS DISTINCT FROM NEW.identity_legal_name OR
     OLD.identity_dob IS DISTINCT FROM NEW.identity_dob OR
     OLD.identity_type IS DISTINCT FROM NEW.identity_type OR
     OLD.identity_number IS DISTINCT FROM NEW.identity_number OR
     OLD.bank_name IS DISTINCT FROM NEW.bank_name OR
     OLD.bank_account_number IS DISTINCT FROM NEW.bank_account_number OR
     OLD.bank_account_name IS DISTINCT FROM NEW.bank_account_name
  THEN
    RAISE EXCEPTION 'Unauthorized: You cannot update administrative or sensitive fields directly.';
  END IF;

  RETURN NEW;
END;
$$;
-- Trigger redeploy migrations workflow
