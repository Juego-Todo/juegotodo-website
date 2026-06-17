"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductVisual } from "@/components/commerce/ProductVisual";
import { getShopProduct } from "@/data/shop";
import { useAuth } from "@/lib/auth/context";
import { useCommerce } from "@/lib/commerce/context";
import { formatCurrency } from "@/lib/commerce/pricing";
import { getProductImageKey } from "@/lib/commerce/product-visuals";

export function CartDrawer() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    cartDrawerOpen,
    lastAddedSlug,
    closeCartDrawer,
    totals,
    removeFromCart,
    updateQuantity,
  } = useCommerce();

  const addedProduct = lastAddedSlug ? getShopProduct(lastAddedSlug) : null;

  function goCheckout() {
    if (!user) {
      router.push("/login?next=/cart");
      closeCartDrawer();
      return;
    }
    closeCartDrawer();
    router.push("/checkout/shipping");
  }

  return (
    <AnimatePresence>
      {cartDrawerOpen ? (
        <>
          <motion.button
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={closeCartDrawer}
            type="button"
            aria-label="Close cart"
          />
          <motion.aside
            animate={{ x: 0 }}
            className="fixed inset-y-0 right-0 z-[61] flex w-full max-w-md flex-col border-l border-white/10 bg-[#080808] shadow-[-20px_0_60px_rgba(0,0,0,0.6)]"
            exit={{ x: "100%" }}
            initial={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#FF1010]">Added To Cart</p>
                <h2 className="font-display text-3xl uppercase text-white">Your Armory</h2>
              </div>
              <button
                className="rounded-full border border-white/10 p-2 text-zinc-400 transition hover:text-white"
                onClick={closeCartDrawer}
                type="button"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              {addedProduct ? (
                <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4">
                  <p className="text-sm font-bold text-emerald-100">Added successfully</p>
                  <div className="mt-3 flex gap-3">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                      <ProductVisual imageKey={getProductImageKey(addedProduct)} size="sm" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{addedProduct.name}</p>
                      <p className="text-sm text-emerald-200">{formatCurrency(addedProduct.priceAmount)}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mt-5 space-y-3">
                {totals.items.map((item) => {
                  const product = getShopProduct(item.productSlug);
                  if (!product) return null;
                  return (
                    <div className="flex gap-3 rounded-xl border border-white/10 bg-black/40 p-3" key={item.productSlug}>
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                        <ProductVisual imageKey={getProductImageKey(product)} size="sm" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{item.name}</p>
                        <p className="text-xs text-zinc-400">{formatCurrency(item.unitPrice)}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            className="h-7 w-7 rounded-full border border-white/15 text-sm text-white"
                            onClick={() => updateQuantity(item.productSlug, item.quantity - 1)}
                            type="button"
                          >
                            −
                          </button>
                          <span className="text-sm text-white">{item.quantity}</span>
                          <button
                            className="h-7 w-7 rounded-full border border-white/15 text-sm text-white"
                            onClick={() => updateQuantity(item.productSlug, item.quantity + 1)}
                            type="button"
                          >
                            +
                          </button>
                          <button
                            className="ml-auto text-xs uppercase tracking-[0.12em] text-zinc-500 hover:text-red-300"
                            onClick={() => removeFromCart(item.productSlug)}
                            type="button"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-white/10 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Subtotal</span>
                <span className="font-display text-3xl text-white">{formatCurrency(totals.subtotal)}</span>
              </div>
              <button
                className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#FF1010] text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#ff2828]"
                onClick={goCheckout}
                type="button"
              >
                Checkout
                <ArrowRight className="ml-2" size={16} aria-hidden />
              </button>
              <button
                className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/15 text-xs font-black uppercase tracking-[0.16em] text-zinc-300 transition hover:text-white"
                onClick={closeCartDrawer}
                type="button"
              >
                Continue Shopping
              </button>
              <Link className="mt-3 block text-center text-xs font-black uppercase tracking-[0.14em] text-zinc-500 hover:text-white" href="/cart">
                View full cart
              </Link>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
