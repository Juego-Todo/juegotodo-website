import { NextResponse } from "next/server";
import { requireMembershipAdmin } from "@/lib/membership/auth";
import { activateProMembership } from "@/lib/pro/service";
import { generateProMembershipId } from "@/lib/pro/entitlement";
import { PRO_PLAN } from "@/data/pro-membership";
import type { ProMembershipRow } from "@/lib/supabase/types";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

type ProAdminAction = "grant" | "extend" | "cancel";

/** Minimal admin Pro membership controls: grant (comp), extend (+12 months), or cancel. */
export async function POST(request: Request, context: RouteContext) {
  const admin = await requireMembershipAdmin(request);
  if ("response" in admin) {
    return admin.response;
  }

  const { userId } = await context.params;
  if (!userId) {
    return NextResponse.json({ error: "userId is required." }, { status: 400 });
  }

  let body: { action?: ProAdminAction };
  try {
    body = (await request.json()) as { action?: ProAdminAction };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const action = body.action ?? "grant";

  if (action === "grant" || action === "extend") {
    const result = await activateProMembership({
      userId,
      provider: "admin",
      paymentStatus: "comped",
      extendFromExisting: action === "extend",
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ membership: result.membership });
  }

  if (action === "cancel") {
    const now = new Date().toISOString();
    const { data: existing } = await admin.serviceClient
      .from("pro_memberships")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!existing) {
      const { data, error } = await admin.serviceClient
        .from("pro_memberships")
        .insert({
          user_id: userId,
          plan: PRO_PLAN,
          status: "cancelled",
          cancelled_at: now,
          payment_status: "unpaid",
          membership_id: generateProMembershipId(),
        })
        .select("*")
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ membership: data as ProMembershipRow });
    }

    const { data, error } = await admin.serviceClient
      .from("pro_memberships")
      .update({
        status: "cancelled",
        cancelled_at: now,
      })
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ membership: data as ProMembershipRow });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}

export async function GET(request: Request, context: RouteContext) {
  const admin = await requireMembershipAdmin(request);
  if ("response" in admin) {
    return admin.response;
  }

  const { userId } = await context.params;
  const { data, error } = await admin.serviceClient
    .from("pro_memberships")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ membership: (data as ProMembershipRow | null) ?? null });
}
