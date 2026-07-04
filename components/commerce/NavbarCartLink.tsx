"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { useCommerce } from "@/lib/commerce/context";
import { formatCurrency } from "@/lib/commerce/pricing";

export function NavbarCartLink() {
  const { cartCount, cartAddedSignal, totals, openCartDrawer } = useCommerce();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (cartAddedSignal === 0) {
      return;
    }

    const startTimer = window.setTimeout(() => setPulse(true), 0);
    const endTimer = window.setTimeout(() => setPulse(false), 700);

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(endTimer);
    };
  }, [cartAddedSignal]);

  return (
    <motion.div
      animate={
        pulse
          ? {
              scale: [1, 1.12, 1],
              boxShadow: [
                "0 0 0 rgba(255,16,16,0)",
                "0 0 24px rgba(255,16,16,0.45)",
                "0 0 0 rgba(255,16,16,0)",
              ],
            }
          : { scale: 1, boxShadow: "0 0 0 rgba(255,16,16,0)" }
      }
      className="rounded-full"
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <button
        aria-label={`Open cart${cartCount > 0 ? `, ${cartCount} items, ${formatCurrency(totals.subtotal)} subtotal` : ""}`}
        className={`relative rounded-full border p-2.5 text-white transition duration-300 ${
          pulse ? "border-[#FF1010]/60 bg-[#FF1010]/10" : "border-white/10 bg-white/5 hover:border-red-500/40"
        }`}
        onClick={openCartDrawer}
        type="button"
      >
        <ShoppingCart size={18} aria-hidden />
        <AnimatePresence mode="popLayout">
          {cartCount > 0 ? (
            <motion.span
              animate={{ scale: pulse ? [1, 1.35, 1] : 1, opacity: 1 }}
              className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF1010] px-1 text-[0.6rem] font-black text-white"
              exit={{ scale: 0, opacity: 0 }}
              initial={{ scale: 0, opacity: 0 }}
              key={cartCount}
              transition={{ type: "spring", stiffness: 500, damping: 18 }}
            >
              {cartCount}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </button>
    </motion.div>
  );
}
