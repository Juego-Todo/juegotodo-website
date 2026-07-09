import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isServerAdminUser } from "@/lib/auth/admin-access";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";
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

  const supabase = createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
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
  } = await supabase.auth.getUser();

  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      return redirectWithCookies(request, response, `/login?next=${encodeURIComponent(request.nextUrl.pathname)}`);
    }

    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("role, email")
      .eq("id", user.id)
      .maybeSingle();

    if (!isServerAdminUser(user.email, adminProfile)) {
      return redirectWithCookies(request, response, "/profile");
    }
  }

  return response;
}
