import { NextResponse } from "next/server";
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
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (adminError) {
    return NextResponse.json({ error: adminError.message }, { status: 500 });
  }

  if (adminProfile?.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const serviceClient = createSupabaseServiceClient();
  if (!serviceClient) {
    return NextResponse.json(
      { error: "Member directory requires SUPABASE_SERVICE_ROLE_KEY in the server environment." },
      { status: 503 },
    );
  }

  const { data, error } = await serviceClient
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
