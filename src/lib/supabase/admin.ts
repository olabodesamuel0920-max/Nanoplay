// src/lib/supabase/admin.ts
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createMockSupabaseClient } from "./mock";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const useMock = !url || !serviceKey || url.includes("127.0.0.1") || url.includes("localhost");

  if (useMock) {
    let sessionCookie: string | null = null;
    try {
      // Access server cookies if in request context
      const cookieStore = cookies() as any;
      if (cookieStore && typeof cookieStore.get === "function") {
        sessionCookie = cookieStore.get("nanoplay-session")?.value || null;
      }
    } catch {
      // Not in request context
    }
    return createMockSupabaseClient(sessionCookie as any);
  }

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

