import { NextResponse } from "next/server";
import { requireAdminServiceClient } from "@/lib/auth/admin-route";
import { mapProfileRow } from "@/lib/auth/profile-sync";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const admin = await requireAdminServiceClient(request);
  if ("response" in admin) {
    return admin.response;
  }

  const { data, error } = await admin.serviceClient
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    members: (data ?? []).map(mapProfileRow),
  });
}
