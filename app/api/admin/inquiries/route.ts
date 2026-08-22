import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/platform/auth";
import { listInquiriesAdmin } from "@/lib/platform/inquiries-server";
import { listInquiriesLocal } from "@/lib/platform/inquiries";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function GET(request: Request) {
  const auth = await requirePlatformAdmin(request);
  if ("response" in auth) return auth.response;

  const url = new URL(request.url);
  const type = url.searchParams.get("type") as "partnership" | "contact" | "seminar" | null;

  try {
    const inquiries = isSupabaseConfigured()
      ? await listInquiriesAdmin(type ?? undefined)
      : listInquiriesLocal(type ?? undefined);
    return NextResponse.json({ inquiries });
  } catch (caught) {
    return NextResponse.json(
      { error: caught instanceof Error ? caught.message : "Unable to load inquiries." },
      { status: 500 },
    );
  }
}
