"use client";

import { useEffect, useState } from "react";
import { AddToCartButton } from "@/components/commerce/AddToCartButton";
import type { ShopProduct } from "@/data/shop";
import { formatCurrency } from "@/lib/commerce/pricing";
import { getSelectedVariantPrice } from "@/lib/commerce/product-options";

type StickyPurchaseBarProps = {
  product: ShopProduct;
  observeId: string;
  variantSelections?: Record<string, string>;
};

export function StickyPurchaseBar({ product, observeId, variantSelections }: StickyPurchaseBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById(observeId);
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [observeId]);

  const displayPrice = getSelectedVariantPrice(product, variantSelections ?? {});

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.06] bg-[#050505]/95 backdrop-blur-md transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:gap-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{product.name}</p>
          <p className="font-display text-xl text-white">{formatCurrency(displayPrice)}</p>
        </div>
        <AddToCartButton product={product} variantSelections={variantSelections} />
      </div>
    </div>
  );
}
