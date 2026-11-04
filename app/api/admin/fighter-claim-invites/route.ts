import { NextResponse } from "next/server";
import { requireAdminServiceClient } from "@/lib/auth/admin-route";
import { createFighterClaimInvite } from "@/lib/fight-records/claims";

export async function POST(request: Request) {
  const admin = await requireAdminServiceClient(request);
  if ("response" in admin) {
    return admin.response;
  }

  const body = (await request.json().catch(() => null)) as { fighterId?: string } | null;
  const fighterId = body?.fighterId?.trim() ?? "";
  if (!fighterId) {
    return NextResponse.json({ error: "Fighter id is required." }, { status: 400 });
  }

  try {
    const invite = await createFighterClaimInvite(admin.serviceClient, fighterId, admin.user.id);
    const claimPath = `/latayanology/fighters/${invite.fighterSlug}?invite=${invite.token}`;
    return NextResponse.json({
      id: invite.id,
      token: invite.token,
      expiresAt: invite.expiresAt,
      claimPath,
      fighterName: invite.fighterName,
      isMinor: invite.isMinor,
      message: invite.isMinor
        ? "Invite created. Minors still require a guardian request instead of a direct claim."
        : "Invite created. The token is shown once.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create invite." },
      { status: 400 },
    );
  }
}
