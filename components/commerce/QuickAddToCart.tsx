"use client";

import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { useCommerce } from "@/lib/commerce/context";
import type { ShopProduct } from "@/data/shop";

export function QuickAddToCart({
  product,
  className = "",
  compact = false,
}: {
  product: ShopProduct;
  className?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCommerce();

  function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/shop/${product.slug}`)}`);
      return;
    }

    addToCart(product.slug, 1, { openDrawer: true });
  }

  return (
    <button
      className={`inline-flex items-center justify-center rounded-full bg-[#FF1010] font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#ff2828] ${
        compact ? "min-h-9 px-4 text-[0.58rem]" : "min-h-11 px-5 text-xs"
      } ${className}`}
      onClick={handleClick}
      type="button"
    >
      <ShoppingBag className={compact ? "mr-1.5" : "mr-2"} size={compact ? 12 : 14} aria-hidden />
      Add To Cart
    </button>
  );
}
