import { NextResponse } from "next/server";
import { upsertProfileFromAuthUser } from "@/lib/auth/profile-sync";
import { withTimeout } from "@/lib/auth/timeout";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

function resolveSafeNextPath(nextParam: string | null) {
  let next = nextParam ?? "/profile";
  try {
    next = decodeURIComponent(next);
  } catch {
    return "/profile";
  }

  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return "/profile";
  }

  return next;
}

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = resolveSafeNextPath(requestUrl.searchParams.get("next"));
  const providerError = requestUrl.searchParams.get("error_description");

  if (providerError) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("authError", providerError);
    return NextResponse.redirect(loginUrl);
  }

  if (code) {
    try {
      const supabase = await createSupabaseServerClient();
      const { error } = await withTimeout(
        supabase.auth.exchangeCodeForSession(code),
        12000,
        "Authentication callback timed out.",
      );

      if (error) {
        throw new Error(error.message);
      }

      const {
        data: { user },
      } = await withTimeout(supabase.auth.getUser(), 8000, "Session verification timed out.");

      if (user) {
        await withTimeout(
          upsertProfileFromAuthUser(user, supabase),
          8000,
          "Profile synchronization timed out.",
        ).catch(() => undefined);
      }
    } catch {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set(
        "authError",
        "The sign-in link is invalid, expired, or could not be verified. Please try again.",
      );
      return NextResponse.redirect(loginUrl);
    }
  } else {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("authError", "The sign-in link is missing or invalid. Please request a new one.");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL(next, request.url));
}
