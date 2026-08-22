import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/platform/auth";
import { fetchPlatformReportSnapshot } from "@/lib/platform/reports-server";

export async function GET(request: Request) {
  const auth = await requirePlatformAdmin(request);
  if ("response" in auth) return auth.response;

  const snapshot = await fetchPlatformReportSnapshot();
  return NextResponse.json({ snapshot });
}
