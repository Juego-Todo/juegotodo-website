import type { ProductVariantGroup, ShopProduct } from "@/data/shop";
import { formatCurrency } from "@/lib/commerce/pricing";

export function getDefaultVariantSelections(product: ShopProduct) {
  if (!product.variantGroups?.length) {
    return {};
  }

  return Object.fromEntries(
    product.variantGroups.map((group) => [group.id, group.options[0]?.id ?? ""]),
  );
}

export function getSelectedVariantImage(
  product: ShopProduct,
  selections: Record<string, string>,
) {
  if (!product.variantGroups?.length) {
    return product.imageSrc;
  }

  for (const group of product.variantGroups) {
    const selected = group.options.find((option) => option.id === selections[group.id]);
    if (selected?.imageSrc) {
      return selected.imageSrc;
    }
  }

  return product.imageSrc;
}

export function getSelectedVariantPrice(
  product: ShopProduct,
  selections: Record<string, string>,
) {
  let price = product.priceAmount;

  if (!product.variantGroups?.length) {
    return price;
  }

  for (const group of product.variantGroups) {
    const selected = group.options.find((option) => option.id === selections[group.id]);
    if (selected?.priceAmount) {
      price = selected.priceAmount;
    }
  }

  return price;
}

export function formatProductPrice(product: ShopProduct, selections: Record<string, string>) {
  return formatCurrency(getSelectedVariantPrice(product, selections));
}

export function getVariantSummary(
  product: ShopProduct,
  selections: Record<string, string>,
) {
  if (!product.variantGroups?.length) {
    return "";
  }

  return product.variantGroups
    .map((group) => {
      const selected = group.options.find((option) => option.id === selections[group.id]);
      return selected ? `${group.label}: ${selected.label}` : null;
    })
    .filter(Boolean)
    .join(" · ");
}

export function getVariantGroup(product: ShopProduct, groupId: string): ProductVariantGroup | undefined {
  return product.variantGroups?.find((group) => group.id === groupId);
}
