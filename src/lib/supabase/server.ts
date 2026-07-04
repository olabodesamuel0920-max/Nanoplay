// src/lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createMockSupabaseClient } from "./mock";

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const useMock = !url || !key || url.includes("127.0.0.1") || url.includes("localhost");
  const cookieStore = await cookies();

  if (useMock) {
    const sessionCookie = cookieStore.get("nanoplay-session")?.value || null;
    return createMockSupabaseClient(sessionCookie as any);
  }

  return createServerClient(
    url!,
    key!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  );
}

