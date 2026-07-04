"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CartItemPhoto } from "@/components/commerce/CartItemPhoto";
import { FreeShippingBar } from "@/components/commerce/FreeShippingBar";
import { getShopProduct } from "@/data/shop";
import { useAuth } from "@/lib/auth/context";
import { useCommerce } from "@/lib/commerce/context";
import { getCheckoutAuthHref } from "@/lib/commerce/checkout-auth";
import { formatCurrency } from "@/lib/commerce/pricing";

const TOAST_MS = 5000;

export function CartAddedToast() {
  const router = useRouter();
  const { user } = useAuth();
  const { lastAddedSlug, lastAddedQuantity, cartAddedSignal, cartCount, totals, closeCartDrawer } = useCommerce();
  const [dismissedSignal, setDismissedSignal] = useState(0);
  const product = lastAddedSlug ? getShopProduct(lastAddedSlug) : null;
  const visible = cartAddedSignal > 0 && cartAddedSignal !== dismissedSignal && Boolean(product);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const timer = window.setTimeout(() => setDismissedSignal(cartAddedSignal), TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [cartAddedSignal, visible]);

  function dismiss() {
    setDismissedSignal(cartAddedSignal);
  }

  function goCheckout() {
    dismiss();
    closeCartDrawer();
    if (!user) {
      router.push(getCheckoutAuthHref("/checkout/shipping"));
      return;
    }
    router.push("/checkout/shipping");
  }

  return (
    <AnimatePresence>
      {visible && product ? (
        <motion.div
          animate={{ opacity: 1, y: 0, scale: 1 }}
          aria-live="polite"
          className="pointer-events-none fixed inset-x-4 bottom-[7.5rem] z-[55] sm:inset-x-auto sm:right-4 sm:bottom-[8.5rem] sm:w-[min(100vw-2rem,22rem)]"
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          role="status"
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
        >
          <div className="pointer-events-auto overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]/95 shadow-[0_24px_70px_rgba(0,0,0,0.6)] backdrop-blur-md">
            <div className="flex items-start gap-3 p-4">
              <div className="relative shrink-0">
                <CartItemPhoto className="h-16 w-16" product={product} sizes="64px" />
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-black">
                  <Check aria-hidden size={13} strokeWidth={3} />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[0.58rem] font-black uppercase tracking-[0.22em] text-emerald-300">Added To Cart</p>
                <p className="mt-1 truncate text-sm font-semibold text-white">{product.name}</p>
                <p className="mt-1 text-xs text-zinc-400">
                  Qty {lastAddedQuantity} · {formatCurrency(product.priceAmount * lastAddedQuantity)}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Cart total {formatCurrency(totals.subtotal)} · {cartCount} item{cartCount === 1 ? "" : "s"}
                </p>
              </div>
              <button
                aria-label="Dismiss"
                className="rounded-full p-1 text-zinc-500 transition hover:text-white"
                onClick={dismiss}
                type="button"
              >
                <X aria-hidden size={14} />
              </button>
            </div>

            <div className="px-4 pb-3">
              <FreeShippingBar compact totals={totals} />
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-white/10 p-3">
              <button
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/10 text-[0.58rem] font-black uppercase tracking-[0.1em] text-zinc-300 transition hover:text-white"
                onClick={dismiss}
                type="button"
              >
                Continue
              </button>
              <Link
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/10 text-[0.58rem] font-black uppercase tracking-[0.1em] text-white transition hover:border-[#FF1010]/40"
                href="/cart"
                onClick={dismiss}
              >
                View Cart
              </Link>
              <button
                className="inline-flex min-h-10 items-center justify-center gap-1 rounded-full bg-[#FF1010] text-[0.58rem] font-black uppercase tracking-[0.1em] text-white transition hover:bg-[#ff2828]"
                onClick={goCheckout}
                type="button"
              >
                Checkout
                <ArrowRight size={12} aria-hidden />
              </button>
            </div>

            <motion.div
              animate={{ scaleX: 0 }}
              className="h-0.5 origin-left bg-[#FF1010]/80"
              initial={{ scaleX: 1 }}
              transition={{ duration: TOAST_MS / 1000, ease: "linear" }}
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
