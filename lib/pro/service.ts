import {
  PRO_DURATION_MONTHS,
  PRO_PLAN,
  type ProPaymentStatus,
} from "@/data/pro-membership";
import {
  computeProExpiry,
  generateProMembershipId,
} from "@/lib/pro/entitlement";
import type { ProMembershipRow } from "@/lib/supabase/types";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export async function activateProMembership(input: {
  userId: string;
  orderId?: string | null;
  provider?: string | null;
  paymentStatus?: ProPaymentStatus;
  /** When renewing, extend from max(now, current expires_at). */
  extendFromExisting?: boolean;
}): Promise<{ ok: true; membership: ProMembershipRow } | { ok: false; error: string }> {
  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY is not configured." };
  }

  const now = new Date();
  const { data: existing } = await supabase
    .from("pro_memberships")
    .select("*")
    .eq("user_id", input.userId)
    .maybeSingle();

  const existingRow = existing as ProMembershipRow | null;
  let startFrom = now;
  if (input.extendFromExisting && existingRow?.expires_at) {
    const currentExpiry = new Date(existingRow.expires_at);
    if (!Number.isNaN(currentExpiry.getTime()) && currentExpiry > now) {
      startFrom = currentExpiry;
    }
  }

  const expiresAt = computeProExpiry(startFrom, PRO_DURATION_MONTHS);
  const membershipId = existingRow?.membership_id || generateProMembershipId();
  const startedAt = existingRow?.started_at || now.toISOString();

  const payload = {
    user_id: input.userId,
    plan: PRO_PLAN,
    status: "active",
    started_at: startedAt,
    expires_at: expiresAt.toISOString(),
    cancelled_at: null,
    payment_status: input.paymentStatus ?? "paid",
    provider: input.provider ?? "paymongo",
    order_id: input.orderId ?? existingRow?.order_id ?? null,
    membership_id: membershipId,
  };

  const { data, error } = await supabase
    .from("pro_memberships")
    .upsert(payload, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  await supabase.from("notifications").insert({
    user_id: input.userId,
    title: "JuegoTodo Pro Activated",
    body: `Your Pro membership is active through ${expiresAt.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}. License Center is unlocked.`,
  });

  return { ok: true, membership: data as ProMembershipRow };
}

export async function markProMembershipPending(input: {
  userId: string;
  orderId: string;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY is not configured." };
  }

  const { error } = await supabase.from("pro_memberships").upsert(
    {
      user_id: input.userId,
      plan: PRO_PLAN,
      status: "pending",
      payment_status: "pending",
      provider: "paymongo",
      order_id: input.orderId,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
