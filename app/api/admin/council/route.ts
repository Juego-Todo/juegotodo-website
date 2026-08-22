import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/platform/auth";
import { listCouncilRecords, upsertCouncilRecord } from "@/lib/platform/council-server";

export async function GET(request: Request) {
  const auth = await requirePlatformAdmin(request);
  if ("response" in auth) return auth.response;

  const records = await listCouncilRecords(false);
  return NextResponse.json({ records });
}

export async function POST(request: Request) {
  const auth = await requirePlatformAdmin(request);
  if ("response" in auth) return auth.response;

  try {
    const body = (await request.json()) as {
      id?: string;
      recordType?: string;
      title?: string;
      summary?: string;
      status?: string;
    };

    if (!body.recordType || !body.title?.trim()) {
      return NextResponse.json({ error: "Record type and title are required." }, { status: 400 });
    }

    await upsertCouncilRecord({
      id: body.id,
      recordType: body.recordType,
      title: body.title,
      summary: body.summary ?? "",
      status: body.status,
      createdBy: auth.user.id,
    });

    return NextResponse.json({ ok: true });
  } catch (caught) {
    return NextResponse.json(
      { error: caught instanceof Error ? caught.message : "Unable to save council record." },
      { status: 500 },
    );
  }
}
