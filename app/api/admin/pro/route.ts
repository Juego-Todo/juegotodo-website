import { NextResponse } from "next/server";
import { requireMembershipAdmin } from "@/lib/membership/auth";
import { resolveProAccessState } from "@/lib/pro/access";
import type { ProMembershipRow } from "@/lib/supabase/types";

/** List all JuegoTodo Pro memberships for admin monitoring. */
export async function GET(request: Request) {
  const admin = await requireMembershipAdmin(request);
  if ("response" in admin) {
    return admin.response;
  }

  const { data, error } = await admin.serviceClient
    .from("pro_memberships")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const memberships = ((data ?? []) as ProMembershipRow[]).map((row) => {
    const access = resolveProAccessState(row);
    return {
      ...row,
      entitled: access.entitled,
      displayStatus: access.displayStatus,
    };
  });

  return NextResponse.json({
    memberships,
    summary: {
      total: memberships.length,
      active: memberships.filter((row) => row.entitled && row.displayStatus === "active").length,
      entitled: memberships.filter((row) => row.entitled).length,
      expired: memberships.filter((row) => row.displayStatus === "expired").length,
      pending: memberships.filter((row) => row.displayStatus === "pending").length,
    },
  });
}
