import { NextResponse } from "next/server";
import { fetchPublishedCalendarEventsFromDb } from "@/lib/platform/calendar-server";
import { getPublicCalendarEntries } from "@/lib/calendar/storage";

export async function GET() {
  try {
    const staticEntries = getPublicCalendarEntries();
    const remoteEntries = await fetchPublishedCalendarEventsFromDb();

    const merged = [...staticEntries];
    const slugs = new Set(staticEntries.map((entry) => entry.slug));
    for (const entry of remoteEntries) {
      if (!slugs.has(entry.slug)) {
        merged.push(entry);
      }
    }

    merged.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return NextResponse.json({ entries: merged });
  } catch (caught) {
    return NextResponse.json(
      { error: caught instanceof Error ? caught.message : "Unable to load calendar." },
      { status: 500 },
    );
  }
}
