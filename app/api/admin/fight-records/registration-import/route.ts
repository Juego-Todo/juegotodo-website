import { NextResponse } from "next/server";
import { requireAdminServiceClient } from "@/lib/auth/admin-route";
import {
  applyRegistrationImport,
  previewRegistrationImport,
} from "@/lib/fight-records/registration-import";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const admin = await requireAdminServiceClient(request);
  if ("response" in admin) return admin.response;

  try {
    const preview = await previewRegistrationImport();
    return NextResponse.json({ preview });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to preview registration roster." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const admin = await requireAdminServiceClient(request);
  if ("response" in admin) return admin.response;

  const body = (await request.json().catch(() => null)) as {
    action?: string;
    createAccounts?: boolean;
  } | null;

  const action = body?.action ?? "apply";

  try {
    if (action === "preview") {
      const preview = await previewRegistrationImport();
      return NextResponse.json({ preview });
    }

    if (action !== "apply") {
      return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }

    const result = await applyRegistrationImport({
      createAccounts: body?.createAccounts !== false,
    });

    return NextResponse.json({
      ...result,
      message: `Imported ${result.created + result.updated} fighters (${result.created} new, ${result.updated} updated). Accounts: ${result.accountsCreated} created, ${result.accountsExisting} already existed.`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to import registration roster." },
      { status: 500 },
    );
  }
}
