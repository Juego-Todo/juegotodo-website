import { NextResponse } from "next/server";
import { listAnnouncements } from "@/lib/platform/announcements-server";

export async function GET() {
  try {
    const announcements = await listAnnouncements(true);
    return NextResponse.json({ announcements });
  } catch (caught) {
    return NextResponse.json(
      { error: caught instanceof Error ? caught.message : "Unable to load announcements." },
      { status: 500 },
    );
  }
}
