import { NextResponse } from "next/server";
import { requireAdminServiceClient } from "@/lib/auth/admin-route";
import { approveFighterClaim, rejectFighterClaim } from "@/lib/fight-records/claims";

export async function GET(request: Request) {
  const admin = await requireAdminServiceClient(request);
  if ("response" in admin) {
    return admin.response;
  }

  const { data: claims, error } = await admin.serviceClient
    .from("fighter_claims")
    .select("id, fighter_id, user_id, status, evidence_path, note, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = claims ?? [];
  const fighterIds = [...new Set(rows.map((row) => row.fighter_id))];
  const userIds = [...new Set(rows.map((row) => row.user_id))];

  const [{ data: fighters }, { data: profiles }] = await Promise.all([
    fighterIds.length
      ? admin.serviceClient.from("fighters_public").select("id, slug, display_name, is_minor").in("id", fighterIds)
      : Promise.resolve({ data: [] }),
    userIds.length
      ? admin.serviceClient.from("profiles").select("id, email, full_name").in("id", userIds)
      : Promise.resolve({ data: [] }),
  ]);

  const fighterById = new Map((fighters ?? []).map((fighter) => [fighter.id, fighter]));
  const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return NextResponse.json({
    claims: rows.map((row) => {
      const fighter = fighterById.get(row.fighter_id);
      const profile = profileById.get(row.user_id);
      return {
        id: row.id,
        fighterId: row.fighter_id,
        fighterName: fighter?.display_name ?? "Unknown fighter",
        fighterSlug: fighter?.slug ?? "",
        isMinor: Boolean(fighter?.is_minor),
        userId: row.user_id,
        memberName: profile?.full_name ?? "",
        memberEmail: profile?.email ?? "",
        evidencePath: row.evidence_path,
        note: row.note,
        createdAt: row.created_at,
      };
    }),
  });
}

export async function PATCH(request: Request) {
  const admin = await requireAdminServiceClient(request);
  if ("response" in admin) {
    return admin.response;
  }

  const body = (await request.json().catch(() => null)) as { id?: string; action?: string; note?: string } | null;
  const id = body?.id?.trim() ?? "";
  const action = body?.action;
  if (!id || (action !== "approve" && action !== "reject")) {
    return NextResponse.json({ error: "Claim id and action are required." }, { status: 400 });
  }

  try {
    const result =
      action === "approve"
        ? await approveFighterClaim(admin.serviceClient, id, admin.user.id)
        : await rejectFighterClaim(admin.serviceClient, id, admin.user.id, body?.note);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update claim." },
      { status: 400 },
    );
  }
}
