import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/membership/auth";
import { resolveProAccessState } from "@/lib/pro/entitlement";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type { ProMembershipRow } from "@/lib/supabase/types";

/** Current user's JuegoTodo Pro entitlement status. */
export async function GET(request: Request) {
  const auth = await requireAuthenticatedUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  const service = createSupabaseServiceClient();
  let record: ProMembershipRow | null = null;

  if (service) {
    const { data } = await service
      .from("pro_memberships")
      .select("*")
      .eq("user_id", auth.user.id)
      .maybeSingle();
    record = (data as ProMembershipRow | null) ?? null;
  } else {
    const { data } = await auth.supabase
      .from("pro_memberships")
      .select("*")
      .eq("user_id", auth.user.id)
      .maybeSingle();
    record = (data as ProMembershipRow | null) ?? null;
  }

  const access = resolveProAccessState(record);

  return NextResponse.json({
    membership: record,
    entitled: access.entitled,
    displayStatus: access.displayStatus,
  });
}
