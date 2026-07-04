"use client";

import { motion } from "framer-motion";
import { Truck } from "lucide-react";
import { formatCurrency, FREE_SHIPPING_THRESHOLD, type calculateLineItems } from "@/lib/commerce/pricing";

type CartTotals = ReturnType<typeof calculateLineItems>;

export function FreeShippingBar({ totals, compact = false }: { totals: CartTotals; compact?: boolean }) {
  const eligibleSubtotal = totals.subtotal - totals.promoDiscount;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - eligibleSubtotal);
  const progress = Math.min(100, (eligibleSubtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const qualified = remaining <= 0;

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.03] ${compact ? "p-3" : "p-4"}`}
    >
      <div className="flex items-start gap-2">
        <Truck className={`mt-0.5 shrink-0 ${qualified ? "text-emerald-400" : "text-[#FF1010]"}`} size={16} aria-hidden />
        <div className="min-w-0 flex-1">
          <p className={`text-xs leading-5 ${qualified ? "text-emerald-300" : "text-zinc-300"}`}>
            {qualified
              ? "You unlocked FREE shipping on this order."
              : `You're ${formatCurrency(remaining)} away from FREE shipping.`}
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <motion.div
              animate={{ width: `${progress}%` }}
              className={`h-full rounded-full ${qualified ? "bg-emerald-400" : "bg-[#FF1010]"}`}
              initial={false}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
