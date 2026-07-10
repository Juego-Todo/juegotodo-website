import { NextResponse } from "next/server";
import { backfillMissingProfiles } from "@/lib/auth/backfill-profiles";
import { isServerAdminUser } from "@/lib/auth/admin-access";
import { mapProfileRow } from "@/lib/auth/profile-sync";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { data: adminProfile, error: adminError } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", user.id)
    .maybeSingle();

  if (adminError) {
    return NextResponse.json({ error: adminError.message }, { status: 500 });
  }

  if (!isServerAdminUser(user.email, adminProfile)) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const serviceClient = createSupabaseServiceClient();
  const queryClient = serviceClient ?? supabase;

  let backfilled = 0;

  if (serviceClient) {
    try {
      backfilled = await backfillMissingProfiles(serviceClient);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to backfill member profiles.";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  const { data, error } = await queryClient
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    members: (data ?? []).map(mapProfileRow),
    backfilled,
  });
}
