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
    } = await withTimeout(supabase.auth.getUser(), 5000, "Session verification timed out.");

    if (request.nextUrl.pathname.startsWith("/admin")) {
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
        5000,
        "Admin verification timed out.",
      );

      if (!isServerAdminUser(user.email, adminProfile)) {
        return redirectWithCookies(request, response, "/profile");
      }
    }
  } catch {
    if (request.nextUrl.pathname.startsWith("/admin")) {
      const loginPath = `/login?next=${encodeURIComponent(request.nextUrl.pathname)}&authError=${encodeURIComponent(
        "Your session could not be verified. Please sign in again.",
      )}`;
      return redirectWithCookies(request, response, loginPath);
    }
  }

  return response;
}
