import { NextResponse } from "next/server";
import { requireAuthenticatedUser, requirePlatformAdmin } from "@/lib/platform/auth";
import {
  createCompetitionEntry,
  listCompetitionEntries,
  updateCompetitionEntryStatus,
} from "@/lib/platform/competitions-server";

export async function GET(request: Request) {
  const auth = await requireAuthenticatedUser(request);
  if ("response" in auth) return auth.response;

  const url = new URL(request.url);
  const adminView = url.searchParams.get("admin") === "1";

  if (adminView) {
    const admin = await requirePlatformAdmin(request);
    if ("response" in admin) return admin.response;
    const entries = await listCompetitionEntries();
    return NextResponse.json({ entries });
  }

  const entries = await listCompetitionEntries(auth.user.id);
  return NextResponse.json({ entries });
}

export async function POST(request: Request) {
  const auth = await requireAuthenticatedUser(request);
  if ("response" in auth) return auth.response;

  try {
    const body = (await request.json()) as {
      eventTitle?: string;
      division?: string;
      notes?: string;
      calendarEventId?: string;
    };

    if (!body.eventTitle?.trim() || !body.division?.trim()) {
      return NextResponse.json({ error: "Event and division are required." }, { status: 400 });
    }

    const entry = await createCompetitionEntry({
      userId: auth.user.id,
      eventTitle: body.eventTitle,
      division: body.division,
      notes: body.notes,
      calendarEventId: body.calendarEventId,
    });

    return NextResponse.json({ entry });
  } catch (caught) {
    return NextResponse.json(
      { error: caught instanceof Error ? caught.message : "Unable to submit entry." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const auth = await requirePlatformAdmin(request);
  if ("response" in auth) return auth.response;

  try {
    const body = (await request.json()) as { id?: string; status?: string };
    if (!body.id || !body.status) {
      return NextResponse.json({ error: "Entry id and status are required." }, { status: 400 });
    }

    await updateCompetitionEntryStatus(body.id, body.status, auth.user.id);
    return NextResponse.json({ ok: true });
  } catch (caught) {
    return NextResponse.json(
      { error: caught instanceof Error ? caught.message : "Unable to update entry." },
      { status: 500 },
    );
  }
}
