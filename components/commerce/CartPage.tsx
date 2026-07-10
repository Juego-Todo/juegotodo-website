"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, Heart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CartItemPhoto } from "@/components/commerce/CartItemPhoto";
import { CartRecommendations, EmptyCartState } from "@/components/commerce/CartRecommendations";
import { FreeShippingBar } from "@/components/commerce/FreeShippingBar";
import { OrderSummary, QuantityControl } from "@/components/commerce/OrderSummary";
import { PageNavigation } from "@/components/PageNavigation";
import { getShopProduct } from "@/data/shop";
import { useAuth } from "@/lib/auth/context";
import { useCommerce } from "@/lib/commerce/context";
import { getCheckoutAuthHref } from "@/lib/commerce/checkout-auth";
import { PROMO_CODES, formatCurrency } from "@/lib/commerce/pricing";
import { getStockLabel } from "@/lib/commerce/product-visuals";
import { getVariantSummary } from "@/lib/commerce/product-options";
import { shopCategoryLabels } from "@/lib/commerce/types";

export function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    cart,
    totals,
    savedForLater,
    updateQuantity,
    removeFromCartWithUndo,
    saveForLater,
    moveSavedToCart,
    removeSavedForLater,
    toggleWishlist,
    userData,
    setCheckoutDraft,
    checkoutDraft,
  } = useCommerce();
  const [promoInput, setPromoInput] = useState(checkoutDraft.promoCode ?? "");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState(Boolean(checkoutDraft.promoCode));
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const cartSlugs = new Set(cart.map((item) => item.productSlug));

  function handleCheckout() {
    setCheckoutLoading(true);
    window.setTimeout(() => {
      if (!user) {
        router.push(getCheckoutAuthHref("/checkout/shipping"));
      } else {
        router.push("/checkout/shipping");
      }
      setCheckoutLoading(false);
    }, 350);
  }

  function applyPromo() {
    const code = promoInput.trim().toUpperCase();
    const promo = PROMO_CODES[code];
    if (!promo) {
      setPromoError("Invalid promo code.");
      setPromoSuccess(false);
      return;
    }
    if (promo.fighterOnly && user?.accountType !== "athlete") {
      setPromoError("This code is for athlete members only.");
      setPromoSuccess(false);
      return;
    }
    setPromoError(null);
    setPromoSuccess(true);
    setCheckoutDraft({ ...checkoutDraft, promoCode: code });
  }

  return (
    <main className="overflow-hidden px-4 pt-24 pb-28 sm:px-6 sm:pt-28 sm:pb-14 lg:px-8 lg:pt-32">
      <section className="relative mx-auto max-w-7xl py-10 sm:py-14">
        <div className="cinematic-grid absolute inset-0 opacity-30" aria-hidden />
        <div className="relative">
          <PageNavigation currentLabel="Cart" />
          <h1 className="font-display mt-3 text-[clamp(3rem,12vw,5rem)] uppercase leading-[0.9] text-white sm:mt-4">
            Your Cart
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            Review your gear, apply rewards, and checkout securely — no page reloads.
          </p>

          {cart.length > 0 ? (
            <div className="mt-6">
              <FreeShippingBar totals={totals} />
            </div>
          ) : null}

          {cart.length === 0 ? (
            <EmptyCartState />
          ) : (
            <>
              <div className="mt-10 grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {totals.items.map((item) => {
                      const product = getShopProduct(item.productSlug);
                      if (!product) return null;
                      const stock = getStockLabel(product.stock);
                      const cartEntry = cart.find((entry) => entry.productSlug === item.productSlug);
                      const variantLabel = getVariantSummary(product, cartEntry?.variantSelections ?? {});
                      const inWishlist = userData.wishlist.includes(item.productSlug);

                      return (
                        <motion.div
                          animate={{ opacity: 1, y: 0 }}
                          className="glass-panel rounded-[1.5rem] p-4 sm:p-6"
                          exit={{ opacity: 0, x: -48, height: 0, marginBottom: 0 }}
                          initial={{ opacity: 0, y: 12 }}
                          key={item.productSlug}
                          layout
                          transition={{ duration: 0.28, ease: "easeOut" }}
                        >
                          <div className="flex flex-col gap-5 sm:flex-row">
                            <Link
                              className="mx-auto block shrink-0 sm:mx-0"
                              href={`/shop/${item.productSlug}`}
                            >
                              <CartItemPhoto className="h-36 w-36 sm:h-40 sm:w-40" product={product} sizes="160px" variantSelections={cartEntry?.variantSelections} />
                            </Link>
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
                              {variantLabel ? <p className="mt-2 text-sm text-zinc-500">{variantLabel}</p> : null}
                              <p className="mt-2 text-sm text-zinc-400">{formatCurrency(item.unitPrice)} each</p>
                              <p className={`mt-1 text-xs ${stock.urgent ? "text-amber-300" : "text-emerald-300/90"}`}>
                                {product.stock <= 0 ? "Out of stock" : stock.urgent ? stock.label : `✓ ${stock.label}`}
                              </p>
                              <div className="mt-5 flex flex-wrap items-center gap-3">
                                <QuantityControl
                                  maxStock={product.stock}
                                  onDecrease={() => updateQuantity(item.productSlug, item.quantity - 1, product.stock)}
                                  onIncrease={() => updateQuantity(item.productSlug, item.quantity + 1, product.stock)}
                                  quantity={item.quantity}
                                />
                                <button
                                  aria-label="Remove item"
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-zinc-400 transition hover:border-red-500/40 hover:text-red-300"
                                  onClick={() => removeFromCartWithUndo(item.productSlug)}
                                  type="button"
                                >
                                  <Trash2 size={15} aria-hidden />
                                </button>
                                <button
                                  aria-label="Save for later"
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-zinc-400 transition hover:text-white"
                                  onClick={() => saveForLater(item.productSlug)}
                                  type="button"
                                >
                                  <Bookmark size={15} aria-hidden />
                                </button>
                                <button
                                  aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 transition ${
                                    inWishlist ? "border-red-500/30 text-red-300" : "text-zinc-400 hover:text-white"
                                  }`}
                                  onClick={() => toggleWishlist(item.productSlug)}
                                  type="button"
                                >
                                  <Heart fill={inWishlist ? "currentColor" : "none"} size={15} aria-hidden />
                                </button>
                              </div>
                            </div>
                            <p className="font-display shrink-0 text-3xl text-white sm:text-right">{formatCurrency(item.lineTotal)}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {savedForLater.length > 0 ? (
                    <section className="glass-panel rounded-[1.5rem] p-5 sm:p-6">
                      <h2 className="font-display text-2xl uppercase text-white">Saved For Later</h2>
                      <div className="mt-4 space-y-3">
                        {savedForLater.map((item) => {
                          const product = getShopProduct(item.productSlug);
                          if (!product) return null;
                          return (
                            <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/30 p-3" key={item.productSlug}>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-white">{product.name}</p>
                                <p className="text-xs text-zinc-500">Qty {item.quantity}</p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  className="rounded-full border border-white/10 px-3 py-1.5 text-[0.58rem] font-black uppercase tracking-[0.1em] text-white"
                                  onClick={() => moveSavedToCart(item.productSlug)}
                                  type="button"
                                >
                                  Move To Cart
                                </button>
                                <button
                                  className="text-[0.58rem] font-black uppercase tracking-[0.1em] text-zinc-500 hover:text-red-300"
                                  onClick={() => removeSavedForLater(item.productSlug)}
                                  type="button"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  ) : null}
                </div>

                <div className="space-y-4">
                  <OrderSummary
                    checkoutLabel={user ? "Checkout Securely" : "Create Account To Checkout"}
                    checkoutLoading={checkoutLoading}
                    onApplyPromo={applyPromo}
                    onCheckout={handleCheckout}
                    onPromoChange={setPromoInput}
                    promoCode={promoInput}
                    promoError={promoError}
                    promoSuccess={promoSuccess}
                    sticky
                    totals={totals}
                  />
                </div>
              </div>

              <div className="mt-10 space-y-8">
                <CartRecommendations excludeSlugs={cartSlugs} title="Complete The Look" />
                <CartRecommendations excludeSlugs={cartSlugs} title="Customers Also Bought" />
                <CartRecommendations excludeSlugs={cartSlugs} title="Recently Viewed" />
              </div>
            </>
          )}
        </div>
      </section>

      {cart.length > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#050505]/95 p-4 backdrop-blur-md lg:hidden">
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-500">Total</p>
              <p className="font-display text-2xl text-white">{formatCurrency(totals.total)}</p>
            </div>
            <button
              className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-[#FF1010] text-xs font-black uppercase tracking-[0.14em] text-white"
              onClick={handleCheckout}
              type="button"
            >
              Checkout
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
