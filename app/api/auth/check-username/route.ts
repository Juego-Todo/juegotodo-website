import { NextResponse } from "next/server";
import { normalizeUsername, validateUsername } from "@/lib/auth/username";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const usernameParam = new URL(request.url).searchParams.get("username") ?? "";

  try {
    const normalized = validateUsername(usernameParam);

    const serviceClient = createSupabaseServiceClient();
    if (serviceClient) {
      const { data, error } = await serviceClient
        .from("profiles")
        .select("id")
        .eq("username", normalized)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const available = !data;
      return NextResponse.json({
        available,
        username: normalized,
        message: available ? "Username is available." : "That username is already taken.",
      });
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("is_username_available", {
      check_username: normalized,
    });

    if (error) {
      return NextResponse.json(
        {
          error:
            "Username check is not set up yet. Run supabase/migrations/20260705000000_is_username_available.sql in the Supabase SQL editor, or add SUPABASE_SERVICE_ROLE_KEY to your environment.",
        },
        { status: 503 },
      );
    }

    const available = Boolean(data);
    return NextResponse.json({
      available,
      username: normalized,
      message: available ? "Username is available." : "That username is already taken.",
    });
  } catch (caught) {
    return NextResponse.json(
      {
        available: false,
        username: normalizeUsername(usernameParam),
        message: caught instanceof Error ? caught.message : "Invalid username.",
      },
      { status: 400 },
    );
  }
}
