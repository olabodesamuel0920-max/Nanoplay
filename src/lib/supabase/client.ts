// src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";
import { getSessionFromCookies, createMockSupabaseClient } from "./mock";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Use mock client for local development / offline testing
  const useMock = !url || !key || url.includes("127.0.0.1") || url.includes("localhost");
  
  if (useMock) {
    const sessionType = typeof document !== "undefined" ? getSessionFromCookies(document.cookie) : null;
    return createMockSupabaseClient(sessionType);
  }
  
  return createBrowserClient(url, key);
}

