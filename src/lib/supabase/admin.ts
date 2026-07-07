import { createClient } from "@supabase/supabase-js";

/**
 * Creates a server-side Supabase client with the service role key
 * WARNING: This client bypasses RLS. Use only inside secure Server Actions or API routes.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Supabase URL and Service Role Key must be configured.");
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

