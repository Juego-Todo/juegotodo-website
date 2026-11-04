import { NextResponse } from "next/server";
import { getFighterClaimInvitePreview } from "@/lib/fight-records/claims";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ fighterId: string }> };

const FIGHTER_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: Request, context: RouteContext) {
  const { fighterId } = await context.params;
  if (!FIGHTER_ID.test(fighterId)) {
    return NextResponse.json({ error: "Fighter id is invalid." }, { status: 400 });
  }

  const token = new URL(request.url).searchParams.get("token")?.trim() ?? "";
  if (!token) {
    return NextResponse.json({ error: "Invite token is required." }, { status: 400 });
  }

  const client = createSupabaseServiceClient();
  if (!client) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const preview = await getFighterClaimInvitePreview(client, fighterId, token);
    if (!preview) {
      return NextResponse.json({ error: "Invite not found." }, { status: 404 });
    }
    return NextResponse.json({
      invitedEmail: preview.invitedEmail,
      expiresAt: preview.expiresAt,
      used: preview.used,
      expired: preview.expired,
      isMinor: preview.isMinor,
      fighterName: preview.fighterName,
      fighterSlug: preview.fighterSlug,
      claimStatus: preview.claimStatus,
      valid: !preview.used && !preview.expired && preview.claimStatus !== "claimed",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load invite." },
      { status: 500 },
    );
  }
}
