import { NextResponse } from "next/server";
import { buildFullName, validateDateOfBirth } from "@/lib/auth/name";
import { buildProfileUpsertFromAuthUser, buildProfileUpsertFromRegisterInput } from "@/lib/auth/profile-sync";
import { withTimeout } from "@/lib/auth/timeout";
import type { RegisterInput } from "@/lib/auth/types";
import { validateUsername } from "@/lib/auth/username";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/** Fields an authenticated user may refresh through sync-profile. */
const SAFE_SYNC_FIELDS = [
  "full_name",
  "username",
  "gender",
  "date_of_birth",
  "city",
  "phone",
  "country",
  "bio",
] as const;

type SafeSyncField = (typeof SAFE_SYNC_FIELDS)[number];

function pickSafeSyncFields(source: Record<string, unknown>): Partial<Record<SafeSyncField, string>> {
  const next: Partial<Record<SafeSyncField, string>> = {};
  for (const field of SAFE_SYNC_FIELDS) {
    if (typeof source[field] === "string") {
      next[field] = source[field];
    }
  }
  return next;
}

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

    const { data: existingProfile, error: existingError } = await withTimeout(
      Promise.resolve(upsertClient.from("profiles").select("id, role, account_type").eq("id", user.id).maybeSingle()),
      8000,
      "Profile lookup timed out.",
    );

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }

    const authDefaults = buildProfileUpsertFromAuthUser(user);
    let payload: Record<string, unknown> = {
      id: user.id,
      email: authDefaults.email,
      ...pickSafeSyncFields(authDefaults),
    };

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

        const registerPayload = buildProfileUpsertFromRegisterInput(
          user.id,
          user.email ?? authDefaults.email,
          body as RegisterInput,
        );

        payload = {
          id: user.id,
          email: registerPayload.email,
          full_name: buildFullName(body as RegisterInput),
          username: validateUsername(body.username),
          gender: body.gender.trim(),
          date_of_birth: validateDateOfBirth(body.dateOfBirth),
          city: body.city?.trim() ?? "",
          phone: body.phone?.trim() ?? "",
          country: body.country?.trim() || "Philippines",
          bio: body.bio?.trim() ?? "",
        };

        // First-time profile creation may set account_type/role from trusted server rules.
        // Existing users cannot change privilege fields through this endpoint.
        if (!existingProfile) {
          payload.account_type = registerPayload.account_type;
          payload.role = registerPayload.role;
        }
      } catch (error) {
        return NextResponse.json(
          { error: error instanceof Error ? error.message : "Invalid registration profile." },
          { status: 400 },
        );
      }
    } else if (!existingProfile) {
      // Empty-body bootstrap for brand-new auth users only.
      payload = {
        id: user.id,
        email: authDefaults.email,
        ...pickSafeSyncFields(authDefaults),
        account_type: authDefaults.account_type,
        role: authDefaults.role,
      };
    }

    // Never accept client-supplied role / account_type for an existing profile.
    if (existingProfile) {
      delete payload.role;
      delete payload.account_type;
      delete payload.assigned_tags;
      delete payload.membership_tier;
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
