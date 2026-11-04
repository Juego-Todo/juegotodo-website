import { NextResponse } from "next/server";
import { acceptFighterClaimInvite } from "@/lib/fight-records/claims";
import { requireAuthenticatedUser } from "@/lib/membership/auth";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ fighterId: string }> };

const FIGHTER_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireAuthenticatedUser(request);
  if ("response" in auth) return auth.response;

  const { fighterId } = await context.params;
  if (!FIGHTER_ID.test(fighterId)) {
    return NextResponse.json({ error: "Fighter id is invalid." }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as { token?: string } | null;
  const token = body?.token?.trim() ?? "";
  if (!token) {
    return NextResponse.json({ error: "Invite token is required." }, { status: 400 });
  }

  const client = createSupabaseServiceClient() ?? auth.supabase;
  const userEmail = auth.user.email ?? "";

  try {
    const result = await acceptFighterClaimInvite(client, {
      token,
      fighterId,
      userId: auth.user.id,
      userEmail,
    });
    return NextResponse.json({
      ok: true,
      fighterId: result.fighterId,
      fighterSlug: result.fighterSlug,
      message: `You claimed ${result.fighterName}. Your Latayanology profile is linked.`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to accept invite." },
      { status: 400 },
    );
  }
}
