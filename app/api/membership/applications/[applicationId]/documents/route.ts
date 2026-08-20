import { NextResponse } from "next/server";
import {
  MEMBERSHIP_ALLOWED_MIME_TYPES,
  MEMBERSHIP_MAX_UPLOAD_BYTES,
  type MembershipDocumentType,
} from "@/data/membership-applications";
import { requireAuthenticatedUser } from "@/lib/membership/auth";
import {
  buildStoragePath,
  fetchMembershipApplicationBundle,
  registerUploadedDocument,
} from "@/lib/membership/service";

type RouteContext = { params: Promise<{ applicationId: string }> };

const ALLOWED_TYPES = new Set<MembershipDocumentType>([
  "VALID_ID",
  "PHOTO_1X1",
  "E_SIGNATURE",
  "PAYMENT_SCREENSHOT",
  "ADDITIONAL_DOCUMENT",
]);

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireAuthenticatedUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  const { applicationId } = await context.params;

  try {
    const application = await fetchMembershipApplicationBundle(auth.supabase, applicationId);
    if (!application || application.userId !== auth.user.id) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    if (
      !["DRAFT", "ACTION_REQUIRED", "PAYMENT_PENDING", "PAYMENT_VERIFICATION", "SUBMITTED"].includes(
        application.applicationStatus,
      )
    ) {
      return NextResponse.json({ error: "Documents can no longer be uploaded for this application." }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const documentTypeRaw = String(formData.get("documentType") ?? "");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "A file is required." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(documentTypeRaw as MembershipDocumentType)) {
      return NextResponse.json({ error: "Invalid document type." }, { status: 400 });
    }

    if (file.size <= 0 || file.size > MEMBERSHIP_MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "File must be between 1 byte and 5MB." }, { status: 400 });
    }

    if (!MEMBERSHIP_ALLOWED_MIME_TYPES.includes(file.type as (typeof MEMBERSHIP_ALLOWED_MIME_TYPES)[number])) {
      return NextResponse.json({ error: "Only JPG, PNG, and PDF files are allowed." }, { status: 400 });
    }

    const documentType = documentTypeRaw as MembershipDocumentType;
    const storagePath = buildStoragePath(auth.user.id, applicationId, documentType, file.name);
    const bytes = new Uint8Array(await file.arrayBuffer());

    const { error: uploadError } = await auth.supabase.storage
      .from("application-documents")
      .upload(storagePath, bytes, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const document = await registerUploadedDocument(auth.supabase, {
      applicationId,
      userId: auth.user.id,
      documentType,
      storagePath,
      originalFilename: file.name,
      mimeType: file.type,
      fileSize: file.size,
    });

    return NextResponse.json({ document });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 500 },
    );
  }
}
