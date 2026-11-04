import { createHash, randomBytes } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/supabase/types";

export type FightRecordsClient = SupabaseClient<Database>;

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function buildPrivateObjectPath(userId: string, fighterId: string, fileName: string) {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(-80) || "evidence";
  return `${userId}/${fighterId}/${Date.now()}-${safe}`;
}

export async function createPendingGuardian(
  client: FightRecordsClient,
  input: {
    fighterId: string;
    guardianUserId: string;
    relationship: string;
    proofPath: string;
    note?: string;
  },
) {
  const relationship = input.relationship.trim();
  if (!relationship) {
    throw new Error("Relationship is required for a guardian request.");
  }
  if (!input.proofPath) {
    throw new Error("Guardian proof is required.");
  }

  const { data: existing, error: existingError } = await client
    .from("fighter_guardians")
    .select("id, status")
    .eq("fighter_id", input.fighterId)
    .eq("guardian_user_id", input.guardianUserId)
    .maybeSingle();
  if (existingError) throw new Error(existingError.message);
  if (existing?.status === "approved") {
    throw new Error("This guardian is already approved.");
  }
  if (existing?.status === "pending") {
    return { id: existing.id, alreadyPending: true as const };
  }

  const note =
    input.note?.trim() ||
    "Direct claims are not available for minors. This request is a guardian review.";

  const payload = {
    fighter_id: input.fighterId,
    guardian_user_id: input.guardianUserId,
    relationship,
    status: "pending",
    proof_path: input.proofPath,
    note,
  };

  const write = existing
    ? client.from("fighter_guardians").update(payload).eq("id", existing.id).select("id").single()
    : client.from("fighter_guardians").insert(payload).select("id").single();

  const { data, error } = await write;
  if (error) throw new Error(error.message);

  await client.from("fighter_guardian_actions").insert({
    fighter_id: input.fighterId,
    guardian_user_id: input.guardianUserId,
    actor_user_id: input.guardianUserId,
    action: "guardian_requested",
    details: { guardianRequest: true } as Json,
  });

  return { id: data.id, alreadyPending: false as const };
}

export async function approveFighterClaim(client: FightRecordsClient, claimId: string, reviewerId: string) {
  const { data: claim, error } = await client.from("fighter_claims").select("*").eq("id", claimId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!claim) throw new Error("Claim not found.");
  if (claim.status !== "pending") throw new Error("Claim is not pending.");

  const { data: fighter, error: fighterError } = await client
    .from("fighters_public")
    .select("id, is_minor, user_id")
    .eq("id", claim.fighter_id)
    .maybeSingle();
  if (fighterError) throw new Error(fighterError.message);
  if (!fighter) throw new Error("Fighter not found.");
  if (fighter.is_minor) {
    throw new Error("Minor fighters must be linked through an approved guardian, not a direct claim.");
  }
  if (fighter.user_id && fighter.user_id !== claim.user_id) {
    throw new Error("Fighter is already claimed by another member.");
  }

  const reviewedAt = new Date().toISOString();
  const { error: updateClaimError } = await client
    .from("fighter_claims")
    .update({
      status: "approved",
      reviewed_by: reviewerId,
      reviewed_at: reviewedAt,
    })
    .eq("id", claim.id);
  if (updateClaimError) throw new Error(updateClaimError.message);

  const { error: updateFighterError } = await client
    .from("fighters")
    .update({
      user_id: claim.user_id,
      claim_status: "claimed",
    })
    .eq("id", claim.fighter_id);
  if (updateFighterError) throw new Error(updateFighterError.message);

  await client
    .from("fighter_claims")
    .update({
      status: "rejected",
      reviewed_by: reviewerId,
      reviewed_at: reviewedAt,
      note: "Another claim was approved.",
    })
    .eq("fighter_id", claim.fighter_id)
    .eq("status", "pending");

  return { ok: true as const, fighterId: claim.fighter_id };
}

export async function rejectFighterClaim(
  client: FightRecordsClient,
  claimId: string,
  reviewerId: string,
  note?: string,
) {
  const { data: claim, error } = await client.from("fighter_claims").select("*").eq("id", claimId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!claim) throw new Error("Claim not found.");
  if (claim.status !== "pending") throw new Error("Claim is not pending.");

  const reviewedAt = new Date().toISOString();
  const { error: updateError } = await client
    .from("fighter_claims")
    .update({
      status: "rejected",
      reviewed_by: reviewerId,
      reviewed_at: reviewedAt,
      note: note?.trim() || claim.note,
    })
    .eq("id", claim.id);
  if (updateError) throw new Error(updateError.message);

  const { count } = await client
    .from("fighter_claims")
    .select("id", { count: "exact", head: true })
    .eq("fighter_id", claim.fighter_id)
    .eq("status", "pending");

  if (!count) {
    await client
      .from("fighters")
      .update({ claim_status: "unclaimed" })
      .eq("id", claim.fighter_id)
      .eq("claim_status", "pending");
  }

  return { ok: true as const };
}

export async function approveFighterGuardian(client: FightRecordsClient, guardianId: string, reviewerId: string) {
  const { data: guardian, error } = await client
    .from("fighter_guardians")
    .select("*")
    .eq("id", guardianId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!guardian) throw new Error("Guardian request not found.");
  if (guardian.status !== "pending") throw new Error("Guardian request is not pending.");

  const { error: updateError } = await client
    .from("fighter_guardians")
    .update({
      status: "approved",
      reviewed_by: reviewerId,
    })
    .eq("id", guardian.id);
  if (updateError) throw new Error(updateError.message);

  await client.from("fighter_guardian_actions").insert({
    fighter_id: guardian.fighter_id,
    guardian_user_id: guardian.guardian_user_id,
    actor_user_id: reviewerId,
    action: "guardian_approved",
    details: { guardianId: guardian.id } as Json,
  });

  return { ok: true as const, fighterId: guardian.fighter_id };
}

export async function revokeFighterGuardian(
  client: FightRecordsClient,
  guardianId: string,
  reviewerId: string,
  note?: string,
) {
  const { data: guardian, error } = await client
    .from("fighter_guardians")
    .select("*")
    .eq("id", guardianId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!guardian) throw new Error("Guardian record not found.");
  if (guardian.status === "revoked") throw new Error("Guardian access is already revoked.");

  const { error: updateError } = await client
    .from("fighter_guardians")
    .update({
      status: "revoked",
      reviewed_by: reviewerId,
      note: note?.trim() || guardian.note,
    })
    .eq("id", guardian.id);
  if (updateError) throw new Error(updateError.message);

  await client.from("fighter_guardian_actions").insert({
    fighter_id: guardian.fighter_id,
    guardian_user_id: guardian.guardian_user_id,
    actor_user_id: reviewerId,
    action: "guardian_revoked",
    details: { guardianId: guardian.id } as Json,
  });

  return { ok: true as const };
}

export async function createFighterClaimInvite(
  client: FightRecordsClient,
  fighterId: string,
  createdBy: string,
) {
  const { data: fighter, error: fighterError } = await client
    .from("fighters_public")
    .select("id, slug, display_name, is_minor")
    .eq("id", fighterId)
    .maybeSingle();
  if (fighterError) throw new Error(fighterError.message);
  if (!fighter) throw new Error("Fighter not found.");

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS).toISOString();
  const { data, error } = await client
    .from("fighter_claim_invites")
    .insert({
      fighter_id: fighterId,
      token_hash: hashInviteToken(token),
      created_by: createdBy,
      expires_at: expiresAt,
    })
    .select("id, expires_at")
    .single();
  if (error) throw new Error(error.message);

  return {
    id: data.id,
    token,
    expiresAt: data.expires_at,
    fighterSlug: fighter.slug,
    fighterName: fighter.display_name,
    isMinor: fighter.is_minor,
  };
}

export async function markInviteUsed(
  client: FightRecordsClient,
  token: string,
  fighterId: string,
  userId: string,
) {
  const trimmed = token.trim();
  if (!trimmed) return;
  const { data } = await client
    .from("fighter_claim_invites")
    .select("id, fighter_id, expires_at, used_at")
    .eq("token_hash", hashInviteToken(trimmed))
    .maybeSingle();
  if (!data || data.used_at || data.fighter_id !== fighterId) return;
  if (new Date(data.expires_at).getTime() < Date.now()) return;
  await client
    .from("fighter_claim_invites")
    .update({ used_at: new Date().toISOString(), used_by: userId })
    .eq("id", data.id);
}
