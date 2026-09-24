import { NextResponse } from "next/server";
import { isServerAdminUser } from "@/lib/auth/admin-access";
import { PRO_PAGE_PATH } from "@/data/pro-membership";
import {
  hasActiveProMembership,
  resolveProAccessState,
  type ProAccessRecord,
} from "@/lib/pro/access";
import type { ProMembershipRow } from "@/lib/supabase/types";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export type ProMembershipRecord = ProAccessRecord;

export {
  hasActiveProMembership,
  resolveProAccessState,
  generateProMembershipId,
  computeProExpiry,
} from "@/lib/pro/access";

export async function fetchProMembershipForUser(
  userId: string,
): Promise<ProMembershipRow | null> {
  const supabase = createSupabaseServiceClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("pro_memberships")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  return (data as ProMembershipRow | null) ?? null;
}

export async function userHasActiveProMembership(userId: string, now?: Date): Promise<boolean> {
  const record = await fetchProMembershipForUser(userId);
  return hasActiveProMembership(record, now);
}

type RequireProResult =
  | { ok: true; record: ProMembershipRow | null; isAdmin: boolean }
  | { ok: false; response: NextResponse };

/**
 * API gate for License Center writes. Admins bypass. Returns 403 + redirectTo /pro when locked.
 */
export async function requireProMembership(input: {
  userId: string;
  authEmail?: string | null;
  profile?: { role?: string | null; email?: string | null } | null;
}): Promise<RequireProResult> {
  if (isServerAdminUser(input.authEmail, input.profile)) {
    return { ok: true, record: null, isAdmin: true };
  }

  const record = await fetchProMembershipForUser(input.userId);
  if (hasActiveProMembership(record) || resolveProAccessState(record).entitled) {
    return { ok: true, record, isAdmin: false };
  }

  return {
    ok: false,
    response: NextResponse.json(
      {
        error: "JuegoTodo Pro membership is required to access the License Center.",
        redirectTo: PRO_PAGE_PATH,
      },
      { status: 403 },
    ),
  };
}
