import type { AccountType } from "@/lib/auth/types";
import { getShopProduct } from "@/data/shop";
import type { CartItem, MembershipTier } from "@/lib/commerce/types";

export const TAX_RATE = 0.12;
export const FREE_SHIPPING_THRESHOLD = 5000;
export const BASE_SHIPPING = 150;
export const SHIPPING_PER_ITEM = 50;

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

export function calculateLineItems(
  cart: CartItem[],
  options?: {
    accountType?: AccountType;
    membershipTier?: MembershipTier;
    promoCode?: string;
  },
) {
  const items = cart
    .map((entry) => {
      const product = getShopProduct(entry.productSlug);
      if (!product) {
        return null;
      }

      const basePrice = product.priceAmount;
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
        name: product.name,
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
  const normalizedPromo = options?.promoCode?.trim().toUpperCase();
  const promo = normalizedPromo ? PROMO_CODES[normalizedPromo] : undefined;

  if (promo) {
    const eligible =
      (!promo.fighterOnly || options?.accountType === "athlete") &&
      (!promo.eliteOnly || options?.membershipTier === "elite");

    if (eligible) {
      promoDiscount = Math.round(subtotal * (promo.discountPercent / 100));
    }
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
    promoCode: promo ? normalizedPromo : undefined,
    promoLabel: promo?.label,
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
