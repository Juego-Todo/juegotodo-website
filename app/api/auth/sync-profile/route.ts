import { NextResponse } from "next/server";
import { buildProfileUpsertFromAuthUser, buildProfileUpsertFromRegisterInput } from "@/lib/auth/profile-sync";
import type { RegisterInput } from "@/lib/auth/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function POST(request: Request) {
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

  const serviceClient = createSupabaseServiceClient();
  const upsertClient = serviceClient ?? supabase;

  let payload = buildProfileUpsertFromAuthUser(user);

  try {
    const body = (await request.json()) as Partial<RegisterInput> | null;
    if (body?.firstName && body.lastName && body.username && body.dateOfBirth && body.gender) {
      payload = buildProfileUpsertFromRegisterInput(user.id, user.email ?? payload.email, body as RegisterInput);
    }
  } catch {
    // No registration payload supplied; metadata sync is enough.
  }

  const { error } = await upsertClient.from("profiles").upsert(payload, { onConflict: "id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
