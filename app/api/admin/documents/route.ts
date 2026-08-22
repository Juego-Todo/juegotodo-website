import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/platform/auth";
import { listAllMemberDocuments, updateMemberDocumentStatus } from "@/lib/platform/documents-server";

export async function GET(request: Request) {
  const auth = await requirePlatformAdmin(request);
  if ("response" in auth) return auth.response;

  const documents = await listAllMemberDocuments();
  return NextResponse.json({ documents });
}

export async function PATCH(request: Request) {
  const auth = await requirePlatformAdmin(request);
  if ("response" in auth) return auth.response;

  try {
    const body = (await request.json()) as { id?: string; status?: "pending" | "approved" | "rejected" | "expired" };
    if (!body.id || !body.status) {
      return NextResponse.json({ error: "Document id and status are required." }, { status: 400 });
    }

    await updateMemberDocumentStatus(body.id, body.status, auth.user.id);
    return NextResponse.json({ ok: true });
  } catch (caught) {
    return NextResponse.json(
      { error: caught instanceof Error ? caught.message : "Unable to update document." },
      { status: 500 },
    );
  }
}
