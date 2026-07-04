"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Link from "next/link";
import { AddToCartButton } from "@/components/commerce/AddToCartButton";
import { ProductDisplayImage } from "@/components/commerce/ProductDisplayImage";
import type { ShopProduct } from "@/data/shop";
import { formatCurrency } from "@/lib/commerce/pricing";
import { getProductBadges, getProductRating, getStockLabel } from "@/lib/commerce/product-visuals";

export function ProductQuickViewModal({
  product,
  open,
  onClose,
}: {
  product: ShopProduct;
  open: boolean;
  onClose: () => void;
}) {
  const { rating, reviewCount } = getProductRating(product);
  const badges = getProductBadges(product);
  const stock = getStockLabel(product.stock);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={onClose}
            type="button"
            aria-label="Close quick view"
          />
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="fixed inset-x-4 top-[10vh] z-[71] mx-auto max-h-[80vh] max-w-2xl overflow-y-auto rounded-[1.5rem] border border-white/10 bg-[#0a0a0a] shadow-[0_40px_100px_rgba(0,0,0,0.7)] sm:inset-x-auto sm:left-1/2 sm:w-full sm:-translate-x-1/2"
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Quick view: ${product.name}`}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#FF1010]">Quick View</p>
              <button className="rounded-full p-2 text-zinc-400 hover:text-white" onClick={onClose} type="button" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="grid gap-5 p-5 sm:grid-cols-2">
              <ProductDisplayImage alt={product.name} product={product} size="lg" stage="catalog" />
              <div>
                <div className="flex flex-wrap gap-1.5">
                  {badges.slice(0, 3).map((badge) => (
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.12em] text-zinc-400" key={badge}>
                      {badge}
                    </span>
                  ))}
                </div>
                <h2 className="font-display mt-3 text-3xl uppercase text-white">{product.name}</h2>
                <p className="mt-2 text-sm text-zinc-400">{product.summary}</p>
                <p className="font-display mt-4 text-3xl text-white">{formatCurrency(product.priceAmount)}</p>
                <p className="mt-2 text-xs text-zinc-500">
                  {rating.toFixed(1)} · {reviewCount} reviews · {stock.label}
                </p>
                <div className="mt-5 space-y-2">
                  <AddToCartButton fullWidth product={product} />
                  <Link
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/10 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/5"
                    href={`/shop/${product.slug}`}
                    onClick={onClose}
                  >
                    View Full Details
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
