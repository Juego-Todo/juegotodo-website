"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { useCommerce } from "@/lib/commerce/context";
import { getCheckoutAuthHref } from "@/lib/commerce/checkout-auth";
import {
  formatCurrency,
  FREE_SHIPPING_THRESHOLD,
} from "@/lib/commerce/pricing";

export function FloatingCartBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { cartCount, totals, openCartDrawer } = useCommerce();

  const eligibleSubtotal = totals.subtotal - totals.promoDiscount;
  const shippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - eligibleSubtotal);
  const shippingProgress = Math.min(100, (eligibleSubtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const freeShippingUnlocked = shippingRemaining <= 0;

  const hidden =
    cartCount === 0 ||
    pathname.startsWith("/checkout") ||
    pathname === "/cart";

  function goCheckout() {
    if (!user) {
      router.push(getCheckoutAuthHref("/checkout/shipping"));
      return;
    }
    router.push("/checkout/shipping");
  }

  return (
    <AnimatePresence>
      {!hidden ? (
        <motion.aside
          animate={{ opacity: 1, y: 0, scale: 1 }}
          aria-label="Shopping cart summary"
          className="fixed bottom-4 right-4 z-[54] w-[min(100vw-2rem,22rem)]"
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
        >
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]/95 shadow-[0_20px_60px_rgba(0,0,0,0.65)] backdrop-blur-md">
            {!freeShippingUnlocked ? (
              <div className="border-b border-white/10 px-4 py-2.5">
                <div className="flex items-center justify-between gap-2 text-[0.58rem] font-black uppercase tracking-[0.12em]">
                  <span className="text-zinc-400">Free Shipping</span>
                  <span className="text-[#FF1010]">{formatCurrency(shippingRemaining)} to go</span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    animate={{ width: `${shippingProgress}%` }}
                    className="h-full rounded-full bg-[#FF1010]"
                    initial={false}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  />
                </div>
              </div>
            ) : (
              <div className="border-b border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-[0.58rem] font-black uppercase tracking-[0.12em] text-emerald-300">
                Free Shipping Unlocked
              </div>
            )}

            <div className="flex items-center gap-3 p-3">
              <button
                aria-label={`Open cart, ${cartCount} items`}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white transition hover:border-[#FF1010]/40"
                onClick={() => openCartDrawer()}
                type="button"
              >
                <ShoppingCart size={18} aria-hidden />
              </button>
              <button
                className="min-w-0 flex-1 text-left"
                onClick={() => openCartDrawer()}
                type="button"
              >
                <p className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-500">
                  {cartCount} Item{cartCount === 1 ? "" : "s"}
                </p>
                <p className="font-display text-2xl leading-none text-white">{formatCurrency(totals.subtotal)}</p>
              </button>
              <button
                className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1 rounded-full bg-[#FF1010] px-4 text-[0.58rem] font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#ff2828]"
                onClick={goCheckout}
                type="button"
              >
                Checkout
                <ArrowRight size={13} aria-hidden />
              </button>
            </div>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
