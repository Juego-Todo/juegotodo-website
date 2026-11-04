import { NextResponse } from "next/server";
import { requireAdminServiceClient } from "@/lib/auth/admin-route";
import { approveFighterGuardian, revokeFighterGuardian } from "@/lib/fight-records/claims";

export async function GET(request: Request) {
  const admin = await requireAdminServiceClient(request);
  if ("response" in admin) {
    return admin.response;
  }

  const { data: guardians, error } = await admin.serviceClient
    .from("fighter_guardians")
    .select("id, fighter_id, guardian_user_id, relationship, status, proof_path, note, created_at")
    .in("status", ["pending", "approved"])
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = guardians ?? [];
  const fighterIds = [...new Set(rows.map((row) => row.fighter_id))];
  const userIds = [...new Set(rows.map((row) => row.guardian_user_id))];
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
    guardians: rows.map((row) => {
      const fighter = fighterById.get(row.fighter_id);
      const profile = profileById.get(row.guardian_user_id);
      return {
        id: row.id,
        fighterId: row.fighter_id,
        fighterName: fighter?.display_name ?? "Unknown fighter",
        fighterSlug: fighter?.slug ?? "",
        relationship: row.relationship,
        status: row.status,
        proofPath: row.proof_path,
        note: row.note,
        guardianName: profile?.full_name ?? "",
        guardianEmail: profile?.email ?? "",
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
  if (!id || (action !== "approve" && action !== "revoke")) {
    return NextResponse.json({ error: "Guardian id and action are required." }, { status: 400 });
  }

  try {
    const result =
      action === "approve"
        ? await approveFighterGuardian(admin.serviceClient, id, admin.user.id)
        : await revokeFighterGuardian(admin.serviceClient, id, admin.user.id, body?.note);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update guardian." },
      { status: 400 },
    );
  }
}
