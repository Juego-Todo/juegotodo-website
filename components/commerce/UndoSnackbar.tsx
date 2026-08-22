"use client";

import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { getShopProduct } from "@/data/shop";
import { useCommerce } from "@/lib/commerce/context";
import { shouldHideFloatingCartChrome } from "@/lib/commerce/floating-cart-visibility";

export function UndoSnackbar() {
  const pathname = usePathname();
  const { cartCount, pendingRemoval, undoRemove, dismissPendingRemoval } = useCommerce();
  const product = pendingRemoval ? getShopProduct(pendingRemoval.productSlug) : null;
  const floatingCartVisible = cartCount > 0 && !shouldHideFloatingCartChrome(pathname);
  const bottomClass = floatingCartVisible
    ? "bottom-[calc(max(1rem,env(safe-area-inset-bottom))+6.5rem)] sm:bottom-[8.5rem]"
    : "bottom-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-8";

  return (
    <AnimatePresence>
      {pendingRemoval && product ? (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className={`fixed inset-x-4 z-[58] mx-auto max-w-lg sm:left-auto sm:right-6 sm:mx-0 ${bottomClass}`}
          exit={{ opacity: 0, y: 16 }}
          initial={{ opacity: 0, y: 16 }}
          role="status"
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0a0a0a]/95 px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-md">
            <p className="min-w-0 flex-1 text-sm text-zinc-200">
              <span className="font-semibold text-white">{product.name}</span> removed
            </p>
            <button
              className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#FF1010]"
              onClick={undoRemove}
              type="button"
            >
              <RotateCcw aria-hidden size={12} />
              Undo
            </button>
            <button
              aria-label="Dismiss"
              className="rounded-full p-1 text-zinc-500 transition hover:text-white"
              onClick={dismissPendingRemoval}
              type="button"
            >
              <X aria-hidden size={14} />
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
