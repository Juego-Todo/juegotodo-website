import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/platform/auth";
import {
  listCoachRoster,
  removeCoachRosterLink,
  upsertCoachRosterLink,
} from "@/lib/platform/coach-roster-server";

export async function GET(request: Request) {
  const auth = await requireAuthenticatedUser(request);
  if ("response" in auth) return auth.response;

  const roster = await listCoachRoster(auth.user.id);
  return NextResponse.json({ roster });
}

export async function POST(request: Request) {
  const auth = await requireAuthenticatedUser(request);
  if ("response" in auth) return auth.response;

  try {
    const body = (await request.json()) as { fighterName?: string; fighterSlug?: string; notes?: string };
    if (!body.fighterName?.trim() || !body.fighterSlug?.trim()) {
      return NextResponse.json({ error: "Fighter name and slug are required." }, { status: 400 });
    }

    const link = await upsertCoachRosterLink({
      coachUserId: auth.user.id,
      fighterName: body.fighterName,
      fighterSlug: body.fighterSlug,
      notes: body.notes,
    });

    return NextResponse.json({ link });
  } catch (caught) {
    return NextResponse.json(
      { error: caught instanceof Error ? caught.message : "Unable to save roster link." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAuthenticatedUser(request);
  if ("response" in auth) return auth.response;

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Roster link id is required." }, { status: 400 });
    }

    await removeCoachRosterLink(id, auth.user.id);
    return NextResponse.json({ ok: true });
  } catch (caught) {
    return NextResponse.json(
      { error: caught instanceof Error ? caught.message : "Unable to remove roster link." },
      { status: 500 },
    );
  }
}
