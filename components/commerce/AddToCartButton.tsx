"use client";

import { Check, Loader2, ShoppingBag } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCommerce } from "@/lib/commerce/context";
import type { ShopProduct } from "@/data/shop";

type ButtonState = "idle" | "loading" | "added" | "continue";

type AddToCartButtonProps = {
  product: ShopProduct;
  className?: string;
  compact?: boolean;
  variant?: "solid" | "outline";
  quantity?: number;
  variantSelections?: Record<string, string>;
  label?: string;
  fullWidth?: boolean;
};

export function AddToCartButton({
  product,
  className = "",
  compact = false,
  variant = "solid",
  quantity = 1,
  variantSelections,
  label = "Add To Cart",
  fullWidth = false,
}: AddToCartButtonProps) {
  const { addToCart } = useCommerce();
  const [state, setState] = useState<ButtonState>("idle");
  const resetTimer = useRef<number | undefined>(undefined);
  const continueTimer = useRef<number | undefined>(undefined);

  const resetToIdle = useCallback(() => {
    window.clearTimeout(resetTimer.current);
    window.clearTimeout(continueTimer.current);
    resetTimer.current = window.setTimeout(() => setState("idle"), 2800);
  }, []);

  useEffect(() => {
    return () => {
      window.clearTimeout(resetTimer.current);
      window.clearTimeout(continueTimer.current);
    };
  }, []);

  async function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (state === "continue") {
      window.clearTimeout(resetTimer.current);
      setState("idle");
      return;
    }

    if (state !== "idle" || product.stock <= 0) {
      return;
    }

    setState("loading");
    await new Promise((resolve) => window.setTimeout(resolve, 320));
    addToCart(product.slug, quantity, { variantSelections });
    setState("added");
    continueTimer.current = window.setTimeout(() => setState("continue"), 700);
    resetToIdle();
  }

  const isDisabled = product.stock <= 0 || state === "loading";

  return (
    <button
      aria-busy={state === "loading"}
      aria-live="polite"
      className={`inline-flex items-center justify-center rounded-full font-black uppercase tracking-[0.14em] transition-all duration-300 ${
        state === "added" || state === "continue"
          ? state === "continue"
            ? "border border-white/15 bg-white/[0.06] text-white hover:border-white/25"
            : "bg-emerald-500 text-black shadow-[0_0_28px_rgba(16,185,129,0.35)]"
          : state === "loading"
            ? "bg-[#FF1010]/80 text-white"
            : variant === "outline"
              ? "border border-white/15 bg-white/[0.03] text-white hover:border-[#FF1010]/45 hover:bg-[#FF1010]/10 hover:text-[#FF1010]"
              : "bg-[#FF1010] text-white hover:bg-[#ff2828] hover:shadow-[0_0_24px_rgba(255,16,16,0.35)]"
      } ${compact ? "min-h-9 px-4 text-[0.58rem]" : "min-h-11 px-5 text-xs"} ${
        fullWidth ? "w-full" : ""
      } ${isDisabled && state === "idle" ? "cursor-not-allowed opacity-50" : ""} ${className}`}
      disabled={isDisabled}
      onClick={handleClick}
      type="button"
    >
      {state === "loading" ? (
        <>
          <Loader2 className={`animate-spin ${compact ? "mr-1.5" : "mr-2"}`} size={compact ? 12 : 14} aria-hidden />
          Adding...
        </>
      ) : state === "added" ? (
        <>
          <Check className={compact ? "mr-1.5" : "mr-2"} size={compact ? 12 : 14} aria-hidden strokeWidth={3} />
          Added
        </>
      ) : state === "continue" ? (
        "Continue Shopping"
      ) : product.stock <= 0 ? (
        "Out Of Stock"
      ) : (
        <>
          <ShoppingBag className={compact ? "mr-1.5" : "mr-2"} size={compact ? 12 : 14} aria-hidden />
          {label}
        </>
      )}
    </button>
  );
}
