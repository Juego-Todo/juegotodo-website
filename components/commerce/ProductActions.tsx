"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart, ShoppingBag, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  const [added, setAdded] = useState(false);
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
      addToCart(product.slug, 1);
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1800);
    });
  }

  function handleBuyNow() {
    requireAuth("/checkout/shipping", () => {
      addToCart(product.slug, 1);
      router.push("/checkout/shipping");
    });
  }

  function handleWishlist() {
    requireAuth(`/shop/${product.slug}`, () => toggleWishlist(product.slug));
  }

  return (
    <div className="space-y-4">
      {athleteDiscount ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Athlete Member — 10% gear discount applied at checkout.
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-red-600 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-white shadow-[0_0_40px_rgba(229,9,20,0.48)] transition hover:bg-red-500"
          onClick={handleAddToCart}
          type="button"
        >
          <ShoppingBag className="mr-2" size={18} aria-hidden />
          Add To Cart
        </button>
        <button
          className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:border-red-500/40 hover:bg-white/10"
          onClick={handleBuyNow}
          type="button"
        >
          <Zap className="mr-2" size={18} aria-hidden />
          Buy Now
        </button>
        <button
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className={`inline-flex min-h-12 items-center justify-center rounded-full border px-5 py-4 transition ${
            inWishlist
              ? "border-red-500/50 bg-red-500/10 text-red-200"
              : "border-white/15 text-zinc-300 hover:border-red-500/40 hover:text-white"
          }`}
          onClick={handleWishlist}
          type="button"
        >
          <Heart fill={inWishlist ? "currentColor" : "none"} size={18} aria-hidden />
        </button>
      </div>

      <AnimatePresence>
        {added ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
            exit={{ opacity: 0, y: -8 }}
            initial={{ opacity: 0, y: 8 }}
          >
            Added to cart.{" "}
            <Link className="font-bold underline" href="/cart">
              View cart
            </Link>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
        {shopCategoryLabels[product.category]}
        {product.digital ? " • Instant digital delivery" : ` • ${product.stock} in stock`}
      </p>
    </div>
  );
}
