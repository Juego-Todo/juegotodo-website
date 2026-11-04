import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/membership/auth";
import {
  buildPrivateObjectPath,
  createPendingGuardian,
  markInviteUsed,
} from "@/lib/fight-records/claims";
import { CLAIM_EVIDENCE_BUCKET, GUARDIAN_PROOF_BUCKET, validateEvidenceFile } from "@/lib/fight-records/evidence";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

type RouteContext = { params: Promise<{ fighterId: string }> };

const FIGHTER_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function uploadFile(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createSupabaseServerClient>>,
  bucket: string,
  objectPath: string,
  file: File,
) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error } = await supabase.storage.from(bucket).upload(objectPath, bytes, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) {
    throw new Error(error.message);
  }
}

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
    return NextResponse.json({ error: "Claim evidence is required." }, { status: 400 });
  }

  const client = createSupabaseServiceClient() ?? auth.supabase;
  const { data: fighter, error: fighterError } = await client
    .from("fighters")
    .select("id, is_minor, claim_status, user_id, display_name")
    .eq("id", fighterId)
    .maybeSingle();

  if (fighterError) {
    return NextResponse.json({ error: fighterError.message }, { status: 500 });
  }
  if (!fighter) {
    return NextResponse.json({ error: "Fighter not found." }, { status: 404 });
  }
  if (fighter.claim_status === "claimed" || fighter.user_id) {
    return NextResponse.json({ error: "This fighter record is already claimed." }, { status: 409 });
  }

  const inviteToken = String(formData.get("inviteToken") ?? "");
  const fileValue = formData.get("file") ?? formData.get("proof");

  try {
    if (fighter.is_minor) {
      const relationship = String(formData.get("relationship") ?? "").trim();
      if (!relationship || !(fileValue instanceof File)) {
        return NextResponse.json(
          {
            error:
              "This fighter is a minor. A direct claim is not available. Submit a guardian request with relationship and proof.",
            guardianRequired: true,
          },
          { status: 400 },
        );
      }
      const fileError = validateEvidenceFile(fileValue);
      if (fileError) {
        return NextResponse.json({ error: fileError }, { status: 400 });
      }
      const proofPath = buildPrivateObjectPath(auth.user.id, fighterId, fileValue.name);
      await uploadFile(auth.supabase, GUARDIAN_PROOF_BUCKET, proofPath, fileValue);
      const guardian = await createPendingGuardian(client, {
        fighterId,
        guardianUserId: auth.user.id,
        relationship,
        proofPath,
      });
      await markInviteUsed(client, inviteToken, fighterId, auth.user.id);
      return NextResponse.json({
        guardianRequired: true,
        alreadyPending: guardian.alreadyPending,
        message: "Guardian request submitted. A direct claim is not available for minors.",
      });
    }

    if (!(fileValue instanceof File)) {
      return NextResponse.json({ error: "Upload evidence for this claim." }, { status: 400 });
    }
    const fileError = validateEvidenceFile(fileValue);
    if (fileError) {
      return NextResponse.json({ error: fileError }, { status: 400 });
    }

    const { data: existingClaim } = await client
      .from("fighter_claims")
      .select("id")
      .eq("fighter_id", fighterId)
      .eq("user_id", auth.user.id)
      .eq("status", "pending")
      .maybeSingle();
    if (existingClaim) {
      return NextResponse.json({ error: "You already have a pending claim for this fighter." }, { status: 409 });
    }

    const evidencePath = buildPrivateObjectPath(auth.user.id, fighterId, fileValue.name);
    await uploadFile(auth.supabase, CLAIM_EVIDENCE_BUCKET, evidencePath, fileValue);
    const note = String(formData.get("note") ?? "").trim();
    const { error: insertError } = await client.from("fighter_claims").insert({
      fighter_id: fighterId,
      user_id: auth.user.id,
      status: "pending",
      evidence_path: evidencePath,
      note,
    });
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    await client.from("fighters").update({ claim_status: "pending" }).eq("id", fighterId).eq("claim_status", "unclaimed");
    await markInviteUsed(client, inviteToken, fighterId, auth.user.id);

    return NextResponse.json({
      ok: true,
      message: "Claim submitted for review.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to submit claim." },
      { status: 400 },
    );
  }
}
