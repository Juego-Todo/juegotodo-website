import { shopProducts } from "@/data/shop";
import { resolveWelcomePromo } from "@/lib/profile/onboarding";
import { fetchCatalogOverrides } from "@/lib/platform/catalog-server";
import type { AccountType } from "@/lib/auth/types";
import type { MembershipTier } from "@/lib/commerce/types";
import { PROMO_CODES, resolvePromoCode } from "@/lib/commerce/pricing";
import { validatePromoCodeServer } from "@/lib/platform/promo-server";
import type { ShopProduct } from "@/data/shop";

async function buildServerProductLookup(): Promise<Map<string, ShopProduct>> {
  const lookup = new Map(shopProducts.map((product) => [product.slug, product]));
  const remote = await fetchCatalogOverrides();
  for (const [slug, product] of Object.entries(remote)) {
    lookup.set(slug, product);
  }
  return lookup;
}

export async function resolvePromoCodeServer(
  promoCode: string | undefined,
  options?: {
    accountType?: AccountType;
    membershipTier?: MembershipTier;
    userId?: string | null;
  },
) {
  const normalized = promoCode?.trim().toUpperCase();
  if (!normalized) {
    return null;
  }

  const staticPromo = PROMO_CODES[normalized];
  if (staticPromo) {
    return resolvePromoCode(promoCode, options);
  }

  if (/^JT10-[A-Z0-9]{8,20}$/.test(normalized)) {
    const validated = await validatePromoCodeServer(normalized, options?.userId ?? null);
    if (validated.invalid) {
      return { ok: false as const, code: normalized, error: validated.reason };
    }
    return {
      ok: true as const,
      code: validated.code,
      discountPercent: validated.discountPercent,
      label: "Welcome onboarding reward",
    };
  }

  const welcome = resolveWelcomePromo(normalized, options?.userId);
  if (!welcome) {
    return { ok: false as const, code: normalized, error: "Invalid promo code." };
  }
  if (welcome.invalid) {
    return { ok: false as const, code: normalized, error: welcome.reason };
  }

  return {
    ok: true as const,
    code: welcome.code,
    discountPercent: welcome.discountPercent,
    label: welcome.label,
  };
}

export async function calculateLineItemsServer(
  cart: Parameters<typeof import("@/lib/commerce/pricing").calculateLineItems>[0],
  options?: Parameters<typeof import("@/lib/commerce/pricing").calculateLineItems>[1],
) {
  const { calculateLineItems } = await import("@/lib/commerce/pricing");
  const productLookup = await buildServerProductLookup();
  const promo = await resolvePromoCodeServer(options?.promoCode, options);
  const totals = calculateLineItems(cart, {
    ...options,
    promoCode: undefined,
    resolveProduct: (slug) => productLookup.get(slug),
  });

  if (promo?.ok) {
    const promoDiscount = Math.round(totals.subtotal * (promo.discountPercent / 100));
    const discountedSubtotal = Math.max(0, totals.subtotal - promoDiscount);
    const shipping =
      discountedSubtotal >= 5000 ? 0 : 150 + 50 * Math.max(0, totals.itemCount - 1);
    const tax = Math.round(discountedSubtotal * 0.12);
    return {
      ...totals,
      promoDiscount,
      promoCode: promo.code,
      promoLabel: promo.label,
      shipping,
      tax,
      total: discountedSubtotal + shipping + tax,
    };
  }

  if (promo && !promo.ok) {
    return { ...totals, promoError: promo.error };
  }

  return totals;
}
