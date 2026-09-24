import { NextResponse } from "next/server";
import { buildFullName, validateDateOfBirth } from "@/lib/auth/name";
import { validateRegistrationPhone } from "@/lib/auth/phone";
import { buildProfileUpsertFromRegisterInput } from "@/lib/auth/profile-sync";
import { withTimeout } from "@/lib/auth/timeout";
import type { RegisterInput } from "@/lib/auth/types";
import { validateUsername } from "@/lib/auth/username";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

/**
 * Public registration that does not depend on Auth SMTP.
 * Creates the Auth user with email_confirm so signup works when
 * confirmation mail delivery is misconfigured.
 */
export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const serviceClient = createSupabaseServiceClient();
  if (!serviceClient) {
    return NextResponse.json(
      { error: "Registration requires SUPABASE_SERVICE_ROLE_KEY on the server." },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as Partial<RegisterInput>;

    if (
      !body?.firstName?.trim() ||
      !body?.lastName?.trim() ||
      !body?.username?.trim() ||
      !body?.email?.trim() ||
      !body?.password ||
      !body?.gender?.trim() ||
      !body?.dateOfBirth?.trim() ||
      !body?.accountType
    ) {
      return NextResponse.json({ error: "Incomplete registration details." }, { status: 400 });
    }

    if (body.password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const email = body.email.trim().toLowerCase();
    const username = validateUsername(body.username);
    const dateOfBirth = validateDateOfBirth(body.dateOfBirth);
    const fullName = buildFullName({
      firstName: body.firstName,
      middleName: body.middleName,
      lastName: body.lastName,
    });
    const country = body.country?.trim() || "Philippines";
    const phone = validateRegistrationPhone(country, body.phone ?? "");

    const registerInput: RegisterInput = {
      firstName: body.firstName.trim(),
      middleName: body.middleName?.trim() ?? "",
      lastName: body.lastName.trim(),
      gender: body.gender.trim(),
      dateOfBirth,
      username,
      email,
      password: body.password,
      accountType: body.accountType,
      phone,
      country,
      city: body.city?.trim() ?? "",
    };

    const { data: usernameTaken, error: usernameError } = await withTimeout(
      Promise.resolve(
        serviceClient.from("profiles").select("id").ilike("username", username).maybeSingle(),
      ),
      8000,
      "Username check timed out.",
    );

    if (usernameError) {
      return NextResponse.json({ error: usernameError.message }, { status: 500 });
    }
    if (usernameTaken) {
      return NextResponse.json({ error: "That username is already taken." }, { status: 409 });
    }

    const { data: created, error: createError } = await withTimeout(
      serviceClient.auth.admin.createUser({
        email,
        password: body.password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          username,
          gender: registerInput.gender,
          date_of_birth: dateOfBirth,
          account_type: registerInput.accountType,
          city: registerInput.city,
          phone,
          country,
        },
      }),
      15000,
      "Account creation timed out. Check your connection and try again.",
    );

    if (createError || !created.user) {
      const message = (createError?.message ?? "").toLowerCase();
      if (message.includes("already") || message.includes("registered") || message.includes("exists")) {
        return NextResponse.json(
          { error: "An account with this email already exists. Sign in or reset your password." },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { error: createError?.message ?? "Unable to create account." },
        { status: 500 },
      );
    }

    const profilePayload = buildProfileUpsertFromRegisterInput(created.user.id, email, registerInput);
    const { error: profileError } = await withTimeout(
      Promise.resolve(serviceClient.from("profiles").upsert(profilePayload, { onConflict: "id" })),
      8000,
      "Profile synchronization timed out.",
    );

    if (profileError) {
      console.error("registration profile upsert failed", profileError.message);
    }

    return NextResponse.json({ ok: true, email });
  } catch (caught) {
    return NextResponse.json(
      { error: caught instanceof Error ? caught.message : "Unable to create account." },
      { status: 400 },
    );
  }
}
