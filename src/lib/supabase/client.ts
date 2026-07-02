// src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    // Return a mock client for build-time when env vars aren't available
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        signInWithPassword: async () => ({ data: null, error: new Error("Auth not configured") }),
        signUp: async () => ({ data: null, error: new Error("Auth not configured") }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }), maybeSingle: async () => ({ data: null, error: null }) }), order: () => ({ limit: () => ({ maybeSingle: async () => ({ data: null, error: null }) }), maybeSingle: async () => ({ data: null, error: null }) }), count: () => ({ single: async () => ({ data: null, count: 0, error: null }) }), limit: () => ({ single: async () => ({ data: null, error: null }) }), maybeSingle: async () => ({ data: null, error: null }) }),
        insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
        upsert: () => ({ error: null }),
        update: () => ({ eq: () => ({ error: null }) }),
        delete: () => ({ eq: () => ({ error: null }) }),
      }),
      rpc: () => ({ error: null }),
    } as any;
  }
  
  return createBrowserClient(url, key);
}
