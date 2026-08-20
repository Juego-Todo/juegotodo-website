import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { isServerAdminUser } from "@/lib/auth/admin-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/env";

async function resolveUser(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  request?: Request,
): Promise<User | null> {
  const {
    data: { user: cookieUser },
  } = await supabase.auth.getUser();

  if (cookieUser) {
    return cookieUser;
  }

  const header = request?.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) {
    return null;
  }

  const {
    data: { user: tokenUser },
  } = await supabase.auth.getUser(token);

  return tokenUser ?? null;
}

export async function requireAuthenticatedUser(request?: Request) {
  if (!isSupabaseConfigured()) {
    return {
      response: NextResponse.json({ error: "Supabase is not configured." }, { status: 503 }),
    };
  }

  const supabase = await createSupabaseServerClient();
  const user = await resolveUser(supabase, request);

  if (!user) {
    return {
      response: NextResponse.json({ error: "Authentication required." }, { status: 401 }),
    };
  }

  return { supabase, user };
}

export async function requireMembershipAdmin(request?: Request): Promise<
  | { response: NextResponse }
  | {
      supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
      serviceClient: NonNullable<ReturnType<typeof createSupabaseServiceClient>>;
      user: User;
    }
> {
  const auth = await requireAuthenticatedUser(request);
  if ("response" in auth) {
    return { response: auth.response as NextResponse };
  }

  const { data: adminProfile, error } = await auth.supabase
    .from("profiles")
    .select("role, email")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (error) {
    return {
      response: NextResponse.json({ error: error.message }, { status: 500 }),
    };
  }

  if (!isServerAdminUser(auth.user.email, adminProfile)) {
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

  return {
    supabase: auth.supabase,
    serviceClient,
    user: auth.user,
  };
}
