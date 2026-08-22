import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/platform/auth";
import { listOfficialAssignments } from "@/lib/platform/officials-server";

export async function GET(request: Request) {
  const auth = await requireAuthenticatedUser(request);
  if ("response" in auth) return auth.response;

  const assignments = await listOfficialAssignments(auth.user.id);
  return NextResponse.json({ assignments });
}
