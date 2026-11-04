import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/membership/auth";
import { buildPrivateObjectPath, createPendingGuardian } from "@/lib/fight-records/claims";
import { GUARDIAN_PROOF_BUCKET, validateEvidenceFile } from "@/lib/fight-records/evidence";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

type RouteContext = { params: Promise<{ fighterId: string }> };

const FIGHTER_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireAuthenticatedUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  const { fighterId } = await context.params;
  if (!FIGHTER_ID.test(fighterId)) {
    return NextResponse.json({ error: "Fighter id is invalid." }, { status: 400 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Guardian proof is required." }, { status: 400 });
  }

  const relationship = String(formData.get("relationship") ?? "").trim();
  const fileValue = formData.get("file") ?? formData.get("proof");
  if (!relationship || !(fileValue instanceof File)) {
    return NextResponse.json(
      { error: "Relationship and proof are required for a guardian request." },
      { status: 400 },
    );
  }

  const fileError = validateEvidenceFile(fileValue);
  if (fileError) {
    return NextResponse.json({ error: fileError }, { status: 400 });
  }

  const client = createSupabaseServiceClient() ?? auth.supabase;
  const { data: fighter, error: fighterError } = await client
    .from("fighters")
    .select("id, is_minor")
    .eq("id", fighterId)
    .maybeSingle();
  if (fighterError) {
    return NextResponse.json({ error: fighterError.message }, { status: 500 });
  }
  if (!fighter) {
    return NextResponse.json({ error: "Fighter not found." }, { status: 404 });
  }
  if (!fighter.is_minor) {
    return NextResponse.json(
      { error: "Guardian requests are for minor fighters. Use the claim flow for adult records." },
      { status: 400 },
    );
  }

  try {
    const proofPath = buildPrivateObjectPath(auth.user.id, fighterId, fileValue.name);
    const bytes = new Uint8Array(await fileValue.arrayBuffer());
    const { error: uploadError } = await auth.supabase.storage.from(GUARDIAN_PROOF_BUCKET).upload(proofPath, bytes, {
      contentType: fileValue.type || "application/octet-stream",
      upsert: false,
    });
    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const guardian = await createPendingGuardian(client, {
      fighterId,
      guardianUserId: auth.user.id,
      relationship,
      proofPath,
      note: String(formData.get("note") ?? ""),
    });

    return NextResponse.json({
      ok: true,
      alreadyPending: guardian.alreadyPending,
      message: "Guardian request submitted for review.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to submit guardian request." },
      { status: 400 },
    );
  }
}
