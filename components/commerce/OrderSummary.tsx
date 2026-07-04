"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Loader2, Minus, Plus, Tag } from "lucide-react";
import { useState } from "react";
import { FreeShippingBar } from "@/components/commerce/FreeShippingBar";
import { formatCurrency, type calculateLineItems } from "@/lib/commerce/pricing";

type CartTotals = ReturnType<typeof calculateLineItems>;

type OrderSummaryProps = {
  totals: CartTotals;
  promoCode?: string;
  onPromoChange?: (code: string) => void;
  onApplyPromo?: () => void;
  promoError?: string | null;
  promoSuccess?: boolean;
  showShippingNote?: boolean;
  compact?: boolean;
  sticky?: boolean;
  checkoutLabel?: string;
  onCheckout?: () => void;
  checkoutLoading?: boolean;
};

export function OrderSummary({
  totals,
  promoCode = "",
  onPromoChange,
  onApplyPromo,
  promoError,
  promoSuccess,
  showShippingNote = true,
  compact = false,
  sticky = false,
  checkoutLabel = "Checkout Securely",
  onCheckout,
  checkoutLoading = false,
}: OrderSummaryProps) {
  const rewardPoints = Math.floor(totals.subtotal / 100);

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={`glass-panel rounded-[1.75rem] p-5 sm:p-6 ${sticky ? "lg:sticky lg:top-28" : ""}`}
      initial={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.3 }}
    >
      <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">Order Summary</p>

      <dl className={`mt-5 space-y-3 ${compact ? "text-sm" : ""}`}>
        <SummaryRow label="Subtotal" value={formatCurrency(totals.subtotal)} />
        {totals.promoDiscount > 0 ? (
          <SummaryRow label="Discount" value={`-${formatCurrency(totals.promoDiscount)}`} accent />
        ) : null}
        <SummaryRow
          label="Shipping"
          value={totals.shipping === 0 ? "Free" : formatCurrency(totals.shipping)}
        />
        <SummaryRow label="Tax (12% VAT)" value={formatCurrency(totals.tax)} />
      </dl>

      <div className="mt-5 border-t border-white/10 pt-5">
        <div className="flex items-end justify-between gap-4">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Grand Total</span>
          <span className="font-display text-4xl text-white">{formatCurrency(totals.total)}</span>
        </div>
        {rewardPoints > 0 ? (
          <p className="mt-2 text-xs text-zinc-500">Earn {rewardPoints} reward points with this order</p>
        ) : null}
      </div>

      {onPromoChange ? (
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/35 p-4">
          <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
            <Tag size={14} aria-hidden />
            Promo Code
          </label>
          <div className="mt-3 flex gap-2">
            <input
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 text-sm uppercase text-white outline-none ring-red-500/40 transition focus:ring-4"
              onChange={(event) => onPromoChange(event.target.value)}
              placeholder="JTGC10"
              value={promoCode}
            />
            {onApplyPromo ? (
              <button
                className="shrink-0 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-red-500"
                onClick={onApplyPromo}
                type="button"
              >
                Apply
              </button>
            ) : null}
          </div>
          {promoError ? <p className="mt-2 text-xs text-red-300">{promoError}</p> : null}
          {promoSuccess || totals.promoLabel ? (
            <motion.p animate={{ opacity: 1, y: 0 }} className="mt-2 text-xs text-emerald-300" initial={{ opacity: 0, y: 4 }}>
              {totals.promoLabel ?? "Coupon applied"} ✓
            </motion.p>
          ) : null}
        </div>
      ) : null}

      {showShippingNote ? (
        <div className="mt-4">
          <FreeShippingBar compact totals={totals} />
          <p className="mt-2 text-[0.65rem] text-zinc-500">Estimated delivery: 3–7 business days</p>
        </div>
      ) : null}

      {onCheckout ? (
        <button
          className="group mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#FF1010] px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white shadow-[0_0_28px_rgba(255,16,16,0.25)] transition hover:bg-[#ff2828] hover:shadow-[0_0_36px_rgba(255,16,16,0.4)] disabled:opacity-70"
          disabled={checkoutLoading}
          onClick={onCheckout}
          type="button"
        >
          {checkoutLoading ? (
            <>
              <Loader2 className="mr-2 animate-spin" size={18} aria-hidden />
              Processing
            </>
          ) : (
            <>
              {checkoutLabel}
              <ArrowRight className="ml-2 transition group-hover:translate-x-1" size={18} aria-hidden />
            </>
          )}
        </button>
      ) : null}
    </motion.div>
  );
}

function SummaryRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-zinc-400">{label}</dt>
      <dd className={`font-semibold ${accent ? "text-emerald-300" : "text-white"}`}>{value}</dd>
    </div>
  );
}

export function QuantityControl({
  quantity,
  onDecrease,
  onIncrease,
  maxStock,
  size = "md",
}: {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  maxStock?: number;
  size?: "sm" | "md";
}) {
  const atMax = maxStock !== undefined && quantity >= maxStock;
  const atMin = quantity <= 1;

  return (
    <div>
      <div
        className={`inline-flex items-center rounded-full border border-white/10 bg-black/40 ${
          size === "sm" ? "text-sm" : ""
        }`}
      >
        <button
          aria-label="Decrease quantity"
          className={`rounded-l-full text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:opacity-40 ${
            size === "sm" ? "px-2.5 py-1.5" : "px-3 py-2"
          }`}
          disabled={atMin}
          onClick={onDecrease}
          type="button"
        >
          <Minus size={size === "sm" ? 14 : 16} aria-hidden />
        </button>
        <AnimatePresence mode="popLayout">
          <motion.span
            animate={{ opacity: 1, y: 0 }}
            className={`min-w-10 px-2 text-center font-black text-white ${size === "sm" ? "text-sm" : "text-sm"}`}
            exit={{ opacity: 0, y: -8 }}
            initial={{ opacity: 0, y: 8 }}
            key={quantity}
            transition={{ duration: 0.2 }}
          >
            {quantity}
          </motion.span>
        </AnimatePresence>
        <button
          aria-label="Increase quantity"
          className={`rounded-r-full text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:opacity-40 ${
            size === "sm" ? "px-2.5 py-1.5" : "px-3 py-2"
          }`}
          disabled={atMax}
          onClick={onIncrease}
          type="button"
        >
          <Plus size={size === "sm" ? 14 : 16} aria-hidden />
        </button>
      </div>
      {atMax && maxStock !== undefined ? (
        <p className="mt-1 text-[0.58rem] text-amber-300">Max {maxStock} in stock</p>
      ) : null}
    </div>
  );
}
