import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/platform/auth";
import { listAnnouncements, upsertAnnouncement } from "@/lib/platform/announcements-server";

export async function GET(request: Request) {
  const auth = await requirePlatformAdmin(request);
  if ("response" in auth) return auth.response;

  const announcements = await listAnnouncements(false);
  return NextResponse.json({ announcements });
}

export async function POST(request: Request) {
  const auth = await requirePlatformAdmin(request);
  if ("response" in auth) return auth.response;

  try {
    const body = (await request.json()) as {
      id?: string;
      title?: string;
      body?: string;
      audience?: string;
      published?: boolean;
    };

    if (!body.title?.trim() || !body.body?.trim()) {
      return NextResponse.json({ error: "Title and body are required." }, { status: 400 });
    }

    const record = await upsertAnnouncement({
      id: body.id,
      title: body.title,
      body: body.body,
      audience: body.audience,
      published: body.published,
      createdBy: auth.user.id,
    });

    return NextResponse.json({ announcement: record });
  } catch (caught) {
    return NextResponse.json(
      { error: caught instanceof Error ? caught.message : "Unable to save announcement." },
      { status: 500 },
    );
  }
}
