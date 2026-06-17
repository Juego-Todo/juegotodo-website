"use client";

import { motion } from "framer-motion";
import { Minus, Plus, Tag, Truck } from "lucide-react";
import { formatCurrency, FREE_SHIPPING_THRESHOLD, type calculateLineItems } from "@/lib/commerce/pricing";

type CartTotals = ReturnType<typeof calculateLineItems>;

type OrderSummaryProps = {
  totals: CartTotals;
  promoCode?: string;
  onPromoChange?: (code: string) => void;
  onApplyPromo?: () => void;
  promoError?: string | null;
  showShippingNote?: boolean;
  compact?: boolean;
};

export function OrderSummary({
  totals,
  promoCode = "",
  onPromoChange,
  onApplyPromo,
  promoError,
  showShippingNote = true,
  compact = false,
}: OrderSummaryProps) {
  const remainingForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - (totals.subtotal - totals.promoDiscount),
  );

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-[1.75rem] p-5 sm:p-6"
      initial={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.4 }}
    >
      <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">Order Summary</p>

      <dl className={`mt-5 space-y-3 ${compact ? "text-sm" : ""}`}>
        <SummaryRow label="Subtotal" value={formatCurrency(totals.subtotal)} />
        {totals.promoDiscount > 0 ? (
          <SummaryRow label="Promo Discount" value={`-${formatCurrency(totals.promoDiscount)}`} accent />
        ) : null}
        <SummaryRow
          label="Estimated Shipping"
          value={totals.shipping === 0 ? "Free" : formatCurrency(totals.shipping)}
        />
        <SummaryRow label="Tax (12% VAT)" value={formatCurrency(totals.tax)} />
      </dl>

      <div className="mt-5 border-t border-white/10 pt-5">
        <div className="flex items-end justify-between gap-4">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Total</span>
          <span className="font-display text-4xl text-white">{formatCurrency(totals.total)}</span>
        </div>
      </div>

      {onPromoChange ? (
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/35 p-4">
          <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
            <Tag size={14} aria-hidden />
            Promo Code
          </label>
          <div className="mt-3 flex gap-2">
            <input
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 text-sm uppercase text-white outline-none ring-red-500/40 focus:ring-4"
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
          {totals.promoLabel ? (
            <p className="mt-2 text-xs text-emerald-300">{totals.promoLabel} applied</p>
          ) : null}
        </div>
      ) : null}

      {showShippingNote ? (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-5 text-zinc-400">
          <Truck className="mt-0.5 shrink-0 text-red-300" size={14} aria-hidden />
          {remainingForFreeShipping > 0 ? (
            <span>
              Add {formatCurrency(remainingForFreeShipping)} more for free shipping on orders over{" "}
              {formatCurrency(FREE_SHIPPING_THRESHOLD)}.
            </span>
          ) : (
            <span>You qualify for free shipping.</span>
          )}
        </div>
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
}: {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-white/10 bg-black/40">
      <button
        aria-label="Decrease quantity"
        className="rounded-l-full px-3 py-2 text-zinc-300 transition hover:bg-white/10 hover:text-white"
        onClick={onDecrease}
        type="button"
      >
        <Minus size={16} aria-hidden />
      </button>
      <span className="min-w-10 px-2 text-center text-sm font-black text-white">{quantity}</span>
      <button
        aria-label="Increase quantity"
        className="rounded-r-full px-3 py-2 text-zinc-300 transition hover:bg-white/10 hover:text-white"
        onClick={onIncrease}
        type="button"
      >
        <Plus size={16} aria-hidden />
      </button>
    </div>
  );
}
