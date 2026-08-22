import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function validatePromoCodeServer(code: string, userId: string | null) {
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return { invalid: true as const, reason: "Enter a promo code." };
  }

  if (!isSupabaseConfigured()) {
    if (!/^JT10-[A-Z0-9]{8,20}$/.test(normalized)) {
      return { invalid: true as const, reason: "Invalid promo code format." };
    }
    return { invalid: false as const, discountPercent: 10, code: normalized };
  }

  const service = createSupabaseServiceClient();
  if (!service) {
    return { invalid: true as const, reason: "Promo validation unavailable." };
  }

  const { data, error } = await service.from("promo_codes").select("*").eq("code", normalized).maybeSingle();
  if (error) return { invalid: true as const, reason: error.message };
  if (!data) return { invalid: true as const, reason: "Promo code not found." };
  if (data.redeemed) return { invalid: true as const, reason: "Promo code already used." };
  if (data.user_id && userId && data.user_id !== userId) {
    return { invalid: true as const, reason: "Promo code is not assigned to this account." };
  }
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { invalid: true as const, reason: "Promo code expired." };
  }

  return {
    invalid: false as const,
    discountPercent: Number(data.discount_percent) || 10,
    code: normalized,
  };
}

export async function redeemPromoCodeServer(code: string, userId: string, orderId?: string) {
  const service = createSupabaseServiceClient();
  if (!service) return;

  const normalized = code.trim().toUpperCase();
  const { error } = await service
    .from("promo_codes")
    .update({
      redeemed: true,
      redeemed_at: new Date().toISOString(),
      user_id: userId,
      order_id: orderId ?? null,
    })
    .eq("code", normalized)
    .eq("redeemed", false);

  if (error) throw new Error(error.message);
}

export async function issueWelcomePromoCode(userId: string, code: string) {
  const service = createSupabaseServiceClient();
  if (!service) return;

  await service.from("promo_codes").upsert(
    {
      code: code.toUpperCase(),
      user_id: userId,
      discount_percent: 10,
      redeemed: false,
    },
    { onConflict: "code" },
  );
}
