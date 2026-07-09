import { NextResponse } from "next/server";
import { isServerAdminUser } from "@/lib/auth/admin-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function requireAdminServiceClient() {
  if (!isSupabaseConfigured()) {
    return {
      response: NextResponse.json({ error: "Supabase is not configured." }, { status: 503 }),
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      response: NextResponse.json({ error: "Authentication required." }, { status: 401 }),
    };
  }

  const { data: adminProfile, error: adminError } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", user.id)
    .maybeSingle();

  if (adminError) {
    return {
      response: NextResponse.json({ error: adminError.message }, { status: 500 }),
    };
  }

  if (!isServerAdminUser(user.email, adminProfile)) {
    return {
      response: NextResponse.json({ error: "Admin access required." }, { status: 403 }),
    };
  }

  const serviceClient = createSupabaseServiceClient();
  if (!serviceClient) {
    return {
      response: NextResponse.json(
        { error: "Admin mutations require SUPABASE_SERVICE_ROLE_KEY in the server environment." },
        { status: 503 },
      ),
    };
  }

  return { serviceClient, user };
}
