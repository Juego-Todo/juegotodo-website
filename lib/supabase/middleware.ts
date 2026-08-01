import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isServerAdminUser } from "@/lib/auth/admin-access";
import { withTimeout } from "@/lib/auth/timeout";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";
import { fetchSupabaseWithTimeout } from "@/lib/supabase/fetch";
import type { Database } from "@/lib/supabase/types";

function redirectWithCookies(request: NextRequest, response: NextResponse, pathname: string) {
  const redirect = NextResponse.redirect(new URL(pathname, request.url));
  response.cookies.getAll().forEach((cookie) => {
    redirect.cookies.set(cookie);
  });
  return redirect;
}

export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  try {
    const supabase = createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
      global: {
        fetch: fetchSupabaseWithTimeout,
      },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const {
      data: { user },
    } = await withTimeout(supabase.auth.getUser(), 8000, "Session verification timed out.");

    // Only hard-gate page routes under /admin. API routes and profile should
    // refresh cookies without bouncing the user to login on transient failures.
    if (request.nextUrl.pathname.startsWith("/admin") && !request.nextUrl.pathname.startsWith("/api/")) {
      if (!user) {
        return redirectWithCookies(request, response, `/login?next=${encodeURIComponent(request.nextUrl.pathname)}`);
      }

      const { data: adminProfile } = await withTimeout(
        Promise.resolve(
          supabase
            .from("profiles")
            .select("role, email")
            .eq("id", user.id)
            .maybeSingle(),
        ),
        8000,
        "Admin verification timed out.",
      );

      if (!isServerAdminUser(user.email, adminProfile)) {
        return redirectWithCookies(request, response, "/profile");
      }
    }
  } catch {
    // Transient network/timeouts must not force a re-login loop.
    return response;
  }

  return response;
}
