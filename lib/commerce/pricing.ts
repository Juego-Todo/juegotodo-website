import type { AccountType } from "@/lib/auth/types";
import { getShopProduct } from "@/data/shop";
import { getLiveShopProduct } from "@/lib/commerce/catalog-store";
import { getSelectedVariantPrice, getVariantSummary } from "@/lib/commerce/product-options";
import type { CartItem, MembershipTier } from "@/lib/commerce/types";
import { resolveWelcomePromo } from "@/lib/profile/onboarding";

function resolveCartProduct(slug: string) {
  if (typeof window !== "undefined") {
    return getLiveShopProduct(slug) ?? getShopProduct(slug);
  }
  return getShopProduct(slug);
}

export const TAX_RATE = 0.12;
export const FREE_SHIPPING_THRESHOLD = 5000;
export const BASE_SHIPPING = 150;
export const SHIPPING_PER_ITEM = 50;
/** Shown on product cards to highlight JT member value */
export const JT_MEMBER_CARD_DISCOUNT_PERCENT = 7;

export function getMemberDisplayPricing(priceAmount: number) {
  const memberPrice = Math.round(priceAmount * (1 - JT_MEMBER_CARD_DISCOUNT_PERCENT / 100));
  const savings = Math.max(0, priceAmount - memberPrice);
  return { memberPrice, savings };
}

export const PROMO_CODES: Record<
  string,
  { discountPercent: number; label: string; fighterOnly?: boolean; eliteOnly?: boolean }
> = {
  JTGC10: { discountPercent: 10, label: "10% off official gear" },
  FIGHTER15: { discountPercent: 15, label: "15% athlete discount", fighterOnly: true },
  ELITE20: { discountPercent: 20, label: "20% elite member discount", eliteOnly: true },
  CHAMP5: { discountPercent: 5, label: "5% championship collection" },
};

export function parsePrice(price: string): number {
  const digits = price.replace(/[^\d.]/g, "");
  return Number.parseFloat(digits) || 0;
}

export function formatCurrency(amount: number): string {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function getAthleteDiscountPercent(accountType: AccountType | undefined): number {
  if (accountType === "athlete") {
    return 10;
  }
  return 0;
}

export function getMembershipDiscountPercent(tier: MembershipTier): number {
  if (tier === "elite") {
    return 5;
  }
  if (tier === "pro") {
    return 3;
  }
  return 0;
}

export function resolvePromoCode(
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
    const eligible =
      (!staticPromo.fighterOnly || options?.accountType === "athlete") &&
      (!staticPromo.eliteOnly || options?.membershipTier === "elite");
    if (!eligible) {
      return {
        ok: false as const,
        code: normalized,
        error: staticPromo.fighterOnly
          ? "This code is for athlete members only."
          : "This code is for elite members only.",
      };
    }
    return {
      ok: true as const,
      code: normalized,
      discountPercent: staticPromo.discountPercent,
      label: staticPromo.label,
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

export function calculateLineItems(
  cart: CartItem[],
  options?: {
    accountType?: AccountType;
    membershipTier?: MembershipTier;
    promoCode?: string;
    userId?: string | null;
  },
) {
  const items = cart
    .map((entry) => {
      const product = resolveCartProduct(entry.productSlug);
      if (!product) {
        return null;
      }

      const basePrice = getSelectedVariantPrice(product, entry.variantSelections ?? {});
      let unitPrice = basePrice;

      const athleteDiscount = getAthleteDiscountPercent(options?.accountType);
      if (athleteDiscount > 0) {
        unitPrice -= basePrice * (athleteDiscount / 100);
      }

      const membershipDiscount = getMembershipDiscountPercent(options?.membershipTier ?? "free");
      if (membershipDiscount > 0) {
        unitPrice -= basePrice * (membershipDiscount / 100);
      }

      unitPrice = Math.max(0, Math.round(unitPrice));

      return {
        productSlug: product.slug,
        name: getVariantSummary(product, entry.variantSelections ?? {})
          ? `${product.name} (${getVariantSummary(product, entry.variantSelections ?? {})})`
          : product.name,
        category: product.category,
        unitPrice,
        quantity: entry.quantity,
        lineTotal: unitPrice * entry.quantity,
        basePrice,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  let promoDiscount = 0;
  const resolvedPromo = resolvePromoCode(options?.promoCode, options);

  if (resolvedPromo?.ok) {
    promoDiscount = Math.round(subtotal * (resolvedPromo.discountPercent / 100));
  }

  const discountedSubtotal = Math.max(0, subtotal - promoDiscount);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const shipping =
    discountedSubtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : BASE_SHIPPING + SHIPPING_PER_ITEM * Math.max(0, itemCount - 1);
  const tax = Math.round(discountedSubtotal * TAX_RATE);
  const total = discountedSubtotal + shipping + tax;

  return {
    items,
    subtotal,
    promoDiscount,
    promoCode: resolvedPromo?.ok ? resolvedPromo.code : undefined,
    promoLabel: resolvedPromo?.ok ? resolvedPromo.label : undefined,
    shipping,
    tax,
    total,
    itemCount,
  };
}

export function generatePaymentReference(method: string): string {
  const prefix = method.slice(0, 2).toUpperCase();
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `JT-${prefix}-${stamp}-${random}`;
}
