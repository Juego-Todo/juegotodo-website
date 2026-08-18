import { NextResponse } from "next/server";
import { adminCreateOrRepairMember } from "@/lib/admin/create-member";
import { requireAdminServiceClient } from "@/lib/auth/admin-route";
import { mapProfileRow } from "@/lib/auth/profile-sync";
import type { AdminCreateMemberInput } from "@/lib/auth/types";
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

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const admin = await requireAdminServiceClient(request);
  if ("response" in admin) {
    return admin.response;
  }

  const input = (await request.json().catch(() => null)) as AdminCreateMemberInput | null;
  if (!input) {
    return NextResponse.json({ error: "Member details are required." }, { status: 400 });
  }

  try {
    const result = await adminCreateOrRepairMember(admin.serviceClient, input);
    return NextResponse.json(result, { status: result.created ? 201 : 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create member." },
      { status: 400 },
    );
  }
}
