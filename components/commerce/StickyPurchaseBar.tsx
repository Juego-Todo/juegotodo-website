"use client";

import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { useCommerce } from "@/lib/commerce/context";
import type { ShopProduct } from "@/data/shop";
import { formatCurrency } from "@/lib/commerce/pricing";
import { getSelectedVariantPrice } from "@/lib/commerce/product-options";

type StickyPurchaseBarProps = {
  product: ShopProduct;
  observeId: string;
  variantSelections?: Record<string, string>;
};

export function StickyPurchaseBar({ product, observeId, variantSelections }: StickyPurchaseBarProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCommerce();
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

  function handleAddToCart() {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/shop/${product.slug}`)}`);
      return;
    }
    addToCart(product.slug, 1, { openDrawer: true, variantSelections });
  }

  const displayPrice = getSelectedVariantPrice(product, variantSelections ?? {});

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.06] bg-[#050505]/95 backdrop-blur-md transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{product.name}</p>
          <p className="font-display text-xl text-white">{formatCurrency(displayPrice)}</p>
        </div>
        <button
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#FF1010] px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#ff2828]"
          onClick={handleAddToCart}
          type="button"
        >
          <ShoppingBag className="mr-2" size={14} aria-hidden />
          Add To Cart
        </button>
      </div>
    </div>
  );
}
