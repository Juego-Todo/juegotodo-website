import { NextResponse } from "next/server";
import { listFightRecords } from "@/lib/platform/fight-records-server";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  try {
    const records = await listFightRecords(decodeURIComponent(slug));
    return NextResponse.json({ records });
  } catch (caught) {
    return NextResponse.json(
      { error: caught instanceof Error ? caught.message : "Unable to load fight records." },
      { status: 500 },
    );
  }
}
