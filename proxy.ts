import { type NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.next();
  }

  const path = request.nextUrl.pathname;
  const needsSession =
    path.startsWith("/admin") || path.startsWith("/api/admin") || path.startsWith("/profile");

  if (!needsSession) {
    return NextResponse.next();
  }

  return updateSupabaseSession(request);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/profile", "/profile/:path*"],
};
