import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/platform/auth";
import { listMemberDocuments } from "@/lib/platform/documents-server";

export async function GET(request: Request) {
  const auth = await requireAuthenticatedUser(request);
  if ("response" in auth) return auth.response;

  const documents = await listMemberDocuments(auth.user.id);
  return NextResponse.json({ documents });
}
