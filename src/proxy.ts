import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { updateSession } from "@/lib/supabase/middleware";
import { createMockSupabaseClient } from "@/lib/supabase/mock";

export async function proxy(request: NextRequest) {
  let supabaseResponse = await updateSession(request);

  const url = request.nextUrl.clone();

  // Protect admin control panel routes server-side
  if (url.pathname.startsWith("/admin")) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    const useMock = !supabaseUrl || !supabaseKey || supabaseUrl.includes("127.0.0.1") || supabaseUrl.includes("localhost");
    
    let user = null;
    let profile = null;
    
    if (useMock) {
      const sessionCookie = request.cookies.get("nanoplay-session")?.value || null;
      const supabase = createMockSupabaseClient(sessionCookie as any);
      const { data } = await supabase.auth.getUser();
      user = data?.user;
      
      const { data: profData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user?.id)
        .single();
      profile = profData;
    } else {
      const supabase = createServerClient(
        supabaseUrl!,
        supabaseKey!,
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

      const { data } = await supabase.auth.getUser();
      user = data?.user;
      
      const { data: profData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user?.id)
        .single();
      profile = profData;
    }

    if (!user) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
    const isEmailAdmin = user.email && adminEmails.includes(user.email.toLowerCase());

    if (profile?.role !== "admin" && !isEmailAdmin) {
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}


export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
