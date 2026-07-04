"use client";

import { Heart, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { AddToCartButton } from "@/components/commerce/AddToCartButton";
import { useAuth } from "@/lib/auth/context";
import { useCommerce } from "@/lib/commerce/context";
import type { ShopProduct } from "@/data/shop";
import { getCheckoutAuthHref } from "@/lib/commerce/checkout-auth";
import { shopCategoryLabels } from "@/lib/commerce/types";

type ProductActionsProps = {
  product: ShopProduct;
  variantSelections?: Record<string, string>;
};

export function ProductActions({ product, variantSelections }: ProductActionsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart, toggleWishlist, userData } = useCommerce();
  const inWishlist = userData.wishlist.includes(product.slug);
  const athleteDiscount = user?.accountType === "athlete";

  function handleBuyNow() {
    addToCart(product.slug, 1, { variantSelections });
    if (!user) {
      router.push(getCheckoutAuthHref("/checkout/shipping"));
      return;
    }
    router.push("/checkout/shipping");
  }

  function handleWishlist() {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/shop/${product.slug}`)}`);
      return;
    }
    toggleWishlist(product.slug);
  }

  return (
    <div className="space-y-4">
      {athleteDiscount ? (
        <p className="text-sm text-emerald-400/90">Athlete member — 10% discount at checkout.</p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <AddToCartButton fullWidth product={product} variantSelections={variantSelections} />
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
