import { NextResponse } from "next/server";
import { buildProfileUpsertFromAuthUser, buildProfileUpsertFromRegisterInput } from "@/lib/auth/profile-sync";
import { withTimeout } from "@/lib/auth/timeout";
import type { RegisterInput } from "@/lib/auth/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await withTimeout(supabase.auth.getUser(), 8000, "Session verification timed out.");

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const serviceClient = createSupabaseServiceClient();
    const upsertClient = serviceClient ?? supabase;

    let payload = buildProfileUpsertFromAuthUser(user);

    const rawBody = await request.text();
    if (rawBody.trim()) {
      try {
        const body = JSON.parse(rawBody) as Partial<RegisterInput> | null;
        if (
          !body?.firstName ||
          !body.lastName ||
          !body.username ||
          !body.dateOfBirth ||
          !body.gender ||
          !body.accountType
        ) {
          return NextResponse.json({ error: "Incomplete registration profile." }, { status: 400 });
        }

        payload = buildProfileUpsertFromRegisterInput(
          user.id,
          user.email ?? payload.email,
          body as RegisterInput,
        );
      } catch (error) {
        return NextResponse.json(
          { error: error instanceof Error ? error.message : "Invalid registration profile." },
          { status: 400 },
        );
      }
    }

    const { error } = await withTimeout(
      Promise.resolve(upsertClient.from("profiles").upsert(payload, { onConflict: "id" })),
      8000,
      "Profile synchronization timed out.",
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Profile synchronization is temporarily unavailable." },
      { status: 503 },
    );
  }
}
