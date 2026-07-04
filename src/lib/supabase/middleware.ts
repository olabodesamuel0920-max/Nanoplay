import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { createMockSupabaseClient } from "./mock";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const useMock = !url || !key || url.includes("127.0.0.1") || url.includes("localhost");

  if (useMock) {
    const sessionCookie = request.cookies.get("nanoplay-session")?.value || null;
    const supabase = createMockSupabaseClient(sessionCookie as any);
    await supabase.auth.getUser();
    return supabaseResponse;
  }

  const supabase = createServerClient(
    url!,
    key!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not modify this sequence: retrieving user session refreshed tokens
  await supabase.auth.getUser();

  return supabaseResponse;
}

