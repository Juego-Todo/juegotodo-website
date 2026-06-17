"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { OrderSummary, QuantityControl } from "@/components/commerce/OrderSummary";
import { PageNavigation } from "@/components/PageNavigation";
import { getShopProduct } from "@/data/shop";
import { useAuth } from "@/lib/auth/context";
import { useCommerce } from "@/lib/commerce/context";
import { PROMO_CODES } from "@/lib/commerce/pricing";
import { formatCurrency } from "@/lib/commerce/pricing";
import { shopCategoryLabels } from "@/lib/commerce/types";

export function CartPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { cart, totals, updateQuantity, removeFromCart, setCheckoutDraft, checkoutDraft } = useCommerce();
  const [promoInput, setPromoInput] = useState(checkoutDraft.promoCode ?? "");
  const [promoError, setPromoError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?next=/cart");
    }
  }, [loading, user, router]);

  function applyPromo() {
    const code = promoInput.trim().toUpperCase();
    const promo = PROMO_CODES[code];

    if (!promo) {
      setPromoError("Invalid promo code.");
      return;
    }

    if (promo.fighterOnly && user?.accountType !== "athlete") {
      setPromoError("This code is for athlete members only.");
      return;
    }

    setPromoError(null);
    setCheckoutDraft({ ...checkoutDraft, promoCode: code });
  }

  if (loading || !user) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4 pt-24">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-zinc-400">Loading cart...</p>
      </main>
    );
  }

  return (
    <main className="overflow-hidden px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
      <section className="relative mx-auto max-w-7xl py-10 sm:py-14">
        <div className="cinematic-grid absolute inset-0 opacity-30" aria-hidden />
        <div className="relative">
          <PageNavigation currentLabel="Cart" />
          <h1 className="font-display mt-3 text-[clamp(3rem,12vw,5rem)] uppercase leading-[0.9] text-white sm:mt-4">
            Your Cart
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            Premium fighter equipment armory. Review your gear, apply promo codes, and proceed to secure checkout.
          </p>

          {cart.length === 0 ? (
            <div className="glass-panel mt-10 rounded-[1.75rem] p-10 text-center">
              <ShoppingBag className="mx-auto text-red-300" size={40} aria-hidden />
              <p className="font-display mt-6 text-4xl uppercase text-white">Cart Empty</p>
              <p className="mt-3 text-sm text-zinc-400">Browse official gear connected to your athlete profile.</p>
              <Link
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-red-600 px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-white"
                href="/shop"
              >
                Browse Shop
              </Link>
            </div>
          ) : (
            <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {totals.items.map((item) => {
                    const product = getShopProduct(item.productSlug);
                    if (!product) {
                      return null;
                    }

                    return (
                      <motion.div
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-panel rounded-[1.5rem] p-4 sm:p-5"
                        exit={{ opacity: 0, x: -20 }}
                        initial={{ opacity: 0, y: 12 }}
                        key={item.productSlug}
                        layout
                      >
                        <div className="flex gap-4 sm:gap-5">
                          <div
                            className={`h-24 w-24 shrink-0 rounded-2xl bg-gradient-to-br ${product.tone} sm:h-28 sm:w-28`}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-red-300">
                              {shopCategoryLabels[item.category]}
                            </p>
                            <Link
                              className="font-display mt-1 block text-2xl uppercase leading-none text-white hover:text-red-200 sm:text-3xl"
                              href={`/shop/${item.productSlug}`}
                            >
                              {item.name}
                            </Link>
                            <p className="mt-2 text-sm text-zinc-400">{formatCurrency(item.unitPrice)} each</p>
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                              <QuantityControl
                                onDecrease={() => updateQuantity(item.productSlug, item.quantity - 1)}
                                onIncrease={() => updateQuantity(item.productSlug, item.quantity + 1)}
                                quantity={item.quantity}
                              />
                              <button
                                className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.16em] text-zinc-400 transition hover:text-red-300"
                                onClick={() => removeFromCart(item.productSlug)}
                                type="button"
                              >
                                <Trash2 size={14} aria-hidden />
                                Remove
                              </button>
                            </div>
                          </div>
                          <p className="font-display shrink-0 text-2xl text-white sm:text-3xl">
                            {formatCurrency(item.lineTotal)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              <div className="space-y-4">
                <OrderSummary
                  onApplyPromo={applyPromo}
                  onPromoChange={setPromoInput}
                  promoCode={promoInput}
                  promoError={promoError}
                  totals={totals}
                />
                <button
                  className="inline-flex w-full min-h-12 items-center justify-center rounded-full bg-red-600 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-red-500"
                  onClick={() => router.push("/checkout/shipping")}
                  type="button"
                >
                  Continue To Shipping
                  <ArrowRight className="ml-2" size={18} aria-hidden />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
