import { NextResponse } from "next/server";
import { requireAdminServiceClient } from "@/lib/auth/admin-route";
import {
  createFighterClaimInvite,
  listPendingFighterClaimInvites,
  searchClaimInviteFighters,
} from "@/lib/fight-records/claims";
import { sendFighterClaimInviteEmail } from "@/lib/platform/email";
import { absoluteUrl } from "@/lib/seo/config";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const admin = await requireAdminServiceClient(request);
  if ("response" in admin) return admin.response;

  const url = new URL(request.url);
  const view = url.searchParams.get("view") ?? "invites";

  try {
    if (view === "fighters") {
      const q = url.searchParams.get("q") ?? "";
      const fighters = await searchClaimInviteFighters(admin.serviceClient, q);
      return NextResponse.json({ fighters });
    }

    const invites = await listPendingFighterClaimInvites(admin.serviceClient);
    return NextResponse.json({ invites });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load claim invites." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const admin = await requireAdminServiceClient(request);
  if ("response" in admin) return admin.response;

  const body = (await request.json().catch(() => null)) as {
    fighterId?: string;
    email?: string;
  } | null;
  const fighterId = body?.fighterId?.trim() ?? "";
  const email = body?.email?.trim() ?? "";
  if (!fighterId) {
    return NextResponse.json({ error: "Fighter id is required." }, { status: 400 });
  }
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  try {
    const invite = await createFighterClaimInvite(admin.serviceClient, fighterId, admin.user.id, email);
    const claimPath = `/latayanology/fighters/${invite.fighterSlug}?invite=${invite.token}&accept=1`;
    const acceptUrl = absoluteUrl(claimPath);

    const delivery = await sendFighterClaimInviteEmail({
      toEmail: invite.invitedEmail,
      fighterName: invite.fighterName,
      acceptUrl,
      existingAccount: invite.existingAccount,
      isMinor: invite.isMinor,
      expiresAt: invite.expiresAt,
    });

    return NextResponse.json({
      id: invite.id,
      expiresAt: invite.expiresAt,
      sentTo: invite.invitedEmail,
      existingAccount: invite.existingAccount,
      fighterName: invite.fighterName,
      isMinor: invite.isMinor,
      delivery: delivery.delivery,
      message: invite.isMinor
        ? `Invite emailed to ${invite.invitedEmail}. Minors still require a guardian request with proof after sign-in.`
        : invite.existingAccount
          ? `Invite emailed to ${invite.invitedEmail}. They can sign in and accept in one click.`
          : `Invite emailed to ${invite.invitedEmail}. They should create an account with that email, then accept.`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to send claim invite." },
      { status: 400 },
    );
  }
}
