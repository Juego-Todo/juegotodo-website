import { NextResponse } from "next/server";
import { requireAdminServiceClient } from "@/lib/auth/admin-route";
import {
  assignEmailAndRefreshFighterClaimInvite,
  createFighterClaimInvite,
  listPendingFighterClaimInvites,
  searchClaimInviteFighters,
} from "@/lib/fight-records/claims";
import { isPlaceholderFighterEmail } from "@/lib/fight-records/provision-claim-account";
import { sendFighterClaimInviteEmail } from "@/lib/platform/email";
import { absoluteUrl } from "@/lib/seo/config";

export const runtime = "nodejs";

async function sendInviteEmail(invite: {
  invitedEmail: string;
  fighterName: string;
  fighterSlug: string;
  token: string;
  existingAccount: boolean;
  accountCreated: boolean;
  temporaryPassword: string | null;
  isMinor: boolean;
  expiresAt: string;
  isPlaceholder: boolean;
}) {
  if (invite.isPlaceholder || isPlaceholderFighterEmail(invite.invitedEmail)) {
    return { queued: false, delivery: "skipped_placeholder" as const };
  }

  const claimPath = `/latayanology/fighters/${invite.fighterSlug}?invite=${invite.token}&accept=1`;
  const acceptUrl = absoluteUrl(claimPath);
  const loginUrl = absoluteUrl(`/login?next=${encodeURIComponent(claimPath)}`);

  return sendFighterClaimInviteEmail({
    toEmail: invite.invitedEmail,
    fighterName: invite.fighterName,
    acceptUrl,
    loginUrl,
    existingAccount: invite.existingAccount,
    accountCreated: invite.accountCreated,
    temporaryPassword: invite.temporaryPassword,
    isMinor: invite.isMinor,
    expiresAt: invite.expiresAt,
  });
}

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
    action?: string;
    fighterId?: string;
    email?: string;
    inviteId?: string;
  } | null;

  const action = body?.action?.trim() || "create";

  try {
    if (action === "assign_email") {
      const inviteId = body?.inviteId?.trim() ?? "";
      const email = body?.email?.trim() ?? "";
      if (!inviteId) return NextResponse.json({ error: "inviteId is required." }, { status: 400 });
      if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 });

      const invite = await assignEmailAndRefreshFighterClaimInvite(admin.serviceClient, {
        inviteId,
        email,
        createdBy: admin.user.id,
      });
      const delivery = await sendInviteEmail(invite);

      return NextResponse.json({
        id: invite.id,
        expiresAt: invite.expiresAt,
        sentTo: invite.invitedEmail,
        accountCreated: invite.accountCreated,
        existingAccount: invite.existingAccount,
        isPlaceholder: invite.isPlaceholder,
        fighterName: invite.fighterName,
        isMinor: invite.isMinor,
        delivery: delivery.delivery,
        message: `Updated ${invite.fighterName} to ${invite.invitedEmail} and emailed login + claim link.`,
      });
    }

    const fighterId = body?.fighterId?.trim() ?? "";
    const email = body?.email?.trim() ?? "";
    if (!fighterId) {
      return NextResponse.json({ error: "Fighter id is required." }, { status: 400 });
    }

    const invite = await createFighterClaimInvite(
      admin.serviceClient,
      fighterId,
      admin.user.id,
      email || null,
    );
    const delivery = await sendInviteEmail(invite);

    return NextResponse.json({
      id: invite.id,
      expiresAt: invite.expiresAt,
      sentTo: invite.invitedEmail,
      existingAccount: invite.existingAccount,
      accountCreated: invite.accountCreated,
      isPlaceholder: invite.isPlaceholder,
      fighterName: invite.fighterName,
      isMinor: invite.isMinor,
      delivery: delivery.delivery,
      message: invite.isPlaceholder
        ? `Created placeholder account for ${invite.fighterName}. Add their real email later to send the claim invite.`
        : invite.accountCreated
          ? invite.isMinor
            ? `Created guardian account for ${invite.invitedEmail} and emailed login + claim link. Guardian proof is still required.`
            : `Created fighter account for ${invite.invitedEmail} and emailed login + temporary password + claim link.`
          : invite.isMinor
            ? `Invite emailed to existing account ${invite.invitedEmail}. Guardian proof is still required after sign-in.`
            : `Invite emailed to existing account ${invite.invitedEmail}. They can sign in and accept in one click.`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to send claim invite." },
      { status: 400 },
    );
  }
}
