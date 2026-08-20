import { NextResponse } from "next/server";
import { isServerAdminUser } from "@/lib/auth/admin-access";
import { requireAuthenticatedUser } from "@/lib/membership/auth";
import { fetchMembershipApplicationBundle } from "@/lib/membership/service";

type RouteContext = { params: Promise<{ applicationId: string; documentId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireAuthenticatedUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  const { applicationId, documentId } = await context.params;

  try {
    const application = await fetchMembershipApplicationBundle(auth.supabase, applicationId);
    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    const { data: profile } = await auth.supabase
      .from("profiles")
      .select("role, email")
      .eq("id", auth.user.id)
      .maybeSingle();

    const isAdmin = isServerAdminUser(auth.user.email, profile);
    if (application.userId !== auth.user.id && !isAdmin) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const document = application.documents?.find((item) => item.id === documentId);
    if (!document) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    const { data, error } = await auth.supabase.storage
      .from("application-documents")
      .createSignedUrl(document.storagePath, 60);

    if (error || !data?.signedUrl) {
      return NextResponse.json({ error: error?.message || "Unable to create download URL." }, { status: 500 });
    }

    return NextResponse.json({
      url: data.signedUrl,
      filename: document.originalFilename,
      mimeType: document.mimeType,
      expiresIn: 60,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to download document." },
      { status: 500 },
    );
  }
}
