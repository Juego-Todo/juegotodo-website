"use client";

import type { ShopProduct } from "@/data/shop";
import { AddToCartButton } from "@/components/commerce/AddToCartButton";

export function QuickAddToCart({
  product,
  className = "",
  compact = false,
  variant = "solid",
}: {
  product: ShopProduct;
  className?: string;
  compact?: boolean;
  variant?: "solid" | "outline";
}) {
  return (
    <AddToCartButton
      className={className}
      compact={compact}
      fullWidth={Boolean(className?.includes("w-full"))}
      product={product}
      variant={variant}
    />
  );
}
