"use client";

import { Heart, ShoppingBag, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { useCommerce } from "@/lib/commerce/context";
import type { ShopProduct } from "@/data/shop";
import { shopCategoryLabels } from "@/lib/commerce/types";

type ProductActionsProps = {
  product: ShopProduct;
};

export function ProductActions({ product }: ProductActionsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart, toggleWishlist, userData } = useCommerce();
  const inWishlist = userData.wishlist.includes(product.slug);
  const athleteDiscount = user?.accountType === "athlete";

  function requireAuth(nextPath: string, action: () => void) {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(nextPath)}`);
      return;
    }
    action();
  }

  function handleAddToCart() {
    requireAuth(`/shop/${product.slug}`, () => {
      addToCart(product.slug, 1, { openDrawer: true });
    });
  }

  function handleBuyNow() {
    requireAuth("/checkout/shipping", () => {
      addToCart(product.slug, 1, { openDrawer: false });
      router.push("/checkout/shipping");
    });
  }

  function handleWishlist() {
    requireAuth(`/shop/${product.slug}`, () => toggleWishlist(product.slug));
  }

  return (
    <div className="space-y-4">
      {athleteDiscount ? (
        <p className="text-sm text-emerald-400/90">Athlete member — 10% discount at checkout.</p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-[#FF1010] px-6 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#ff2828]"
          onClick={handleAddToCart}
          type="button"
        >
          <ShoppingBag className="mr-2" size={16} aria-hidden />
          Add To Cart
        </button>
        <button
          className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-white/[0.06] px-6 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-white/10"
          onClick={handleBuyNow}
          type="button"
        >
          <Zap className="mr-2" size={16} aria-hidden />
          Buy Now
        </button>
        <button
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className={`inline-flex min-h-12 items-center justify-center rounded-full px-5 transition ${
            inWishlist ? "bg-white/10 text-red-300" : "bg-white/[0.04] text-zinc-400 hover:text-white"
          }`}
          onClick={handleWishlist}
          type="button"
        >
          <Heart fill={inWishlist ? "currentColor" : "none"} size={16} aria-hidden />
        </button>
      </div>

      <p className="text-xs text-zinc-600">
        {shopCategoryLabels[product.category]}
        {product.digital ? " · Instant delivery" : ` · ${product.stock} available`}
      </p>
    </div>
  );
}
