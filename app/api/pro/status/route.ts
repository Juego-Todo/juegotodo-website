import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/membership/auth";
import { hasUnlimitedPlan } from "@/lib/pro/plan";
import { resolveProAccessState } from "@/lib/pro/entitlement";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type { ProMembershipRow } from "@/lib/supabase/types";

/** Current user's JuegoTodo Pro / Unlimited plan status. */
export async function GET(request: Request) {
  const auth = await requireAuthenticatedUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  const { data: profile } = await auth.supabase
    .from("profiles")
    .select("role, email, assigned_tags")
    .eq("id", auth.user.id)
    .maybeSingle();

  const unlimited = hasUnlimitedPlan({
    email: auth.user.email ?? profile?.email,
    role: profile?.role,
    assignedTags: (profile?.assigned_tags as string[] | null) ?? [],
  });

  if (unlimited) {
    return NextResponse.json({
      membership: null,
      entitled: true,
      displayStatus: "active",
      plan: "unlimited",
    });
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
    plan: access.entitled ? "pro" : "free",
  });
}
