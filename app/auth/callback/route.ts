import { NextResponse } from "next/server";
import { upsertProfileFromAuthUser } from "@/lib/auth/profile-sync";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

function resolveSafeNextPath(nextParam: string | null) {
  const next = decodeURIComponent(nextParam ?? "/profile");
  if (!next.startsWith("/") || next.startsWith("//")) {
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

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await upsertProfileFromAuthUser(user, supabase);
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
}
