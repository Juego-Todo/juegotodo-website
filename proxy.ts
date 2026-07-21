import { type NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  if (!isSupabaseConfigured() || !request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  return updateSupabaseSession(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
