import { NextResponse } from "next/server";
import type { CalendarEntry } from "@/data/calendar-entries";
import { requirePlatformAdmin } from "@/lib/platform/auth";
import { deleteCalendarEventBySlug, upsertCalendarEvent } from "@/lib/platform/calendar-server";

export async function POST(request: Request) {
  const auth = await requirePlatformAdmin(request);
  if ("response" in auth) return auth.response;

  try {
    const body = (await request.json()) as { entry?: CalendarEntry };
    if (!body.entry?.slug || !body.entry.title || !body.entry.date) {
      return NextResponse.json({ error: "Calendar entry payload is incomplete." }, { status: 400 });
    }

    const saved = await upsertCalendarEvent(body.entry, auth.user.id);
    return NextResponse.json({ entry: saved });
  } catch (caught) {
    return NextResponse.json(
      { error: caught instanceof Error ? caught.message : "Unable to save calendar event." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const auth = await requirePlatformAdmin(request);
  if ("response" in auth) return auth.response;

  const slug = new URL(request.url).searchParams.get("slug")?.trim();
  if (!slug) {
    return NextResponse.json({ error: "Slug is required." }, { status: 400 });
  }

  try {
    await deleteCalendarEventBySlug(slug);
    return NextResponse.json({ ok: true });
  } catch (caught) {
    return NextResponse.json(
      { error: caught instanceof Error ? caught.message : "Unable to delete calendar event." },
      { status: 500 },
    );
  }
}
