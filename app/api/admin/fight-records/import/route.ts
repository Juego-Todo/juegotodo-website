import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { requireAdminServiceClient } from "@/lib/auth/admin-route";
import type { ImportPreview } from "@/lib/fight-records/import-types";
import { parseWorkbook } from "@/lib/fight-records/parse-fight-cards";
import { applyImportPreview } from "@/lib/fight-records/server";

export const runtime = "nodejs";

const PREVIEW_PATH = path.join(process.cwd(), "data", "imports", "import-preview.json");

function isImportPreview(value: unknown): value is ImportPreview {
  if (!value || typeof value !== "object") return false;
  const record = value as ImportPreview;
  return Array.isArray(record.events) && Array.isArray(record.fighters) && Boolean(record.totals);
}

function isRawWorkbook(value: unknown): value is Record<string, unknown[][]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.values(value).some((sheet) => Array.isArray(sheet));
}

function readSavedPreview(): ImportPreview | null {
  if (!fs.existsSync(PREVIEW_PATH)) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(PREVIEW_PATH, "utf8")) as unknown;
    return isImportPreview(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeSavedPreview(preview: ImportPreview) {
  fs.mkdirSync(path.dirname(PREVIEW_PATH), { recursive: true });
  fs.writeFileSync(PREVIEW_PATH, JSON.stringify(preview, null, 2), "utf8");
}

function previewFromUnknown(value: unknown): ImportPreview {
  if (isImportPreview(value)) return value;
  if (isRawWorkbook(value)) return parseWorkbook(value);
  throw new Error("Upload import-preview.json or the exported workbook JSON.");
}

export async function GET(request: Request) {
  const admin = await requireAdminServiceClient(request);
  if ("response" in admin) {
    return admin.response;
  }
  return NextResponse.json({ preview: readSavedPreview() });
}

export async function POST(request: Request) {
  const admin = await requireAdminServiceClient(request);
  if ("response" in admin) {
    return admin.response;
  }

  const contentType = request.headers.get("content-type") ?? "";
  let action = "";
  let preview: ImportPreview | null = null;

  try {
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      action = String(formData.get("action") ?? "preview");
      const file = formData.get("file");
      if (file instanceof File) {
        const name = file.name.toLowerCase();
        if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
          return NextResponse.json(
            { error: "Upload the JSON workbook export, or run npm run import:fight-cards to refresh import-preview.json." },
            { status: 400 },
          );
        }
        preview = previewFromUnknown(JSON.parse(await file.text()) as unknown);
      }
    } else {
      const body = (await request.json().catch(() => null)) as { action?: string; preview?: unknown } | null;
      action = body?.action ?? "";
      if (body?.preview) preview = previewFromUnknown(body.preview);
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to read the import file." },
      { status: 400 },
    );
  }

  if (action !== "preview" && action !== "apply") {
    return NextResponse.json({ error: "Action must be preview or apply." }, { status: 400 });
  }

  if (action === "preview") {
    const nextPreview = preview ?? readSavedPreview();
    if (!nextPreview) {
      return NextResponse.json({ error: "No import preview is available yet." }, { status: 404 });
    }
    try {
      writeSavedPreview(nextPreview);
    } catch {
      // Hosts with a read-only filesystem can still return the parsed preview.
    }
    return NextResponse.json({ preview: nextPreview });
  }

  const toApply = preview ?? readSavedPreview();
  if (!toApply) {
    return NextResponse.json({ error: "Nothing to import. Preview a workbook first." }, { status: 400 });
  }

  try {
    const result = await applyImportPreview(toApply, `import-${crypto.randomUUID()}`);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Import failed." },
      { status: 500 },
    );
  }
}
