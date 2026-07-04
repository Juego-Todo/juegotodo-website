"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Bookmark, Heart, ShoppingCart, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CartItemPhoto } from "@/components/commerce/CartItemPhoto";
import { FreeShippingBar } from "@/components/commerce/FreeShippingBar";
import { QuantityControl } from "@/components/commerce/OrderSummary";
import { getShopProduct } from "@/data/shop";
import { useAuth } from "@/lib/auth/context";
import { useCommerce } from "@/lib/commerce/context";
import { getCheckoutAuthHref } from "@/lib/commerce/checkout-auth";
import { formatCurrency } from "@/lib/commerce/pricing";
import { getStockLabel } from "@/lib/commerce/product-visuals";
import { getVariantSummary } from "@/lib/commerce/product-options";

function CartIconButton({
  ariaLabel,
  children,
  className = "",
  onClick,
}: {
  ariaLabel: string;
  children: ReactNode;
  className?: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/40 text-zinc-400 transition hover:border-white/20 hover:text-white ${className}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

export function CartDrawer() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    cart,
    cartDrawerOpen,
    closeCartDrawer,
    totals,
    removeFromCartWithUndo,
    saveForLater,
    updateQuantity,
    toggleWishlist,
    userData,
  } = useCommerce();

  function goCheckout() {
    closeCartDrawer();
    if (!user) {
      router.push(getCheckoutAuthHref("/checkout/shipping"));
      return;
    }
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
            className="fixed inset-y-0 right-0 z-[61] flex w-full flex-col border-l border-white/10 bg-[#080808] shadow-[-24px_0_80px_rgba(0,0,0,0.65)] sm:max-w-md"
            exit={{ x: "100%" }}
            initial={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#FF1010]">Mini Cart</p>
                <h2 className="font-display text-3xl uppercase text-white">
                  Your Cart {totals.itemCount > 0 ? `(${totals.itemCount})` : ""}
                </h2>
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

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {totals.items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                  <ShoppingCart className="text-zinc-600" size={40} aria-hidden />
                  <p className="font-display mt-4 text-2xl uppercase text-white">Cart Empty</p>
                  <p className="mt-2 text-sm text-zinc-500">Add official Juego Todo gear to get started.</p>
                  <Link
                    className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#FF1010] px-6 text-xs font-black uppercase tracking-[0.14em] text-white"
                    href="/shop"
                    onClick={closeCartDrawer}
                  >
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
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
                          animate={{ opacity: 1, x: 0 }}
                          className="rounded-2xl border border-white/10 bg-black/40 p-3"
                          exit={{ opacity: 0, x: 40, height: 0 }}
                          initial={{ opacity: 0, x: 20 }}
                          key={item.productSlug}
                          layout
                        >
                          <div className="flex gap-3">
                            <Link
                              className="block shrink-0"
                              href={`/shop/${item.productSlug}`}
                              onClick={closeCartDrawer}
                            >
                              <CartItemPhoto product={product} variantSelections={cartEntry?.variantSelections} />
                            </Link>
                            <div className="min-w-0 flex-1">
                              <Link
                                className="block truncate text-sm font-semibold text-white hover:text-[#FF1010]"
                                href={`/shop/${item.productSlug}`}
                                onClick={closeCartDrawer}
                              >
                                {item.name}
                              </Link>
                              {variantLabel ? (
                                <p className="mt-0.5 truncate text-[0.65rem] text-zinc-500">{variantLabel}</p>
                              ) : null}
                              <p className="mt-1 text-xs text-zinc-400">{formatCurrency(item.unitPrice)}</p>
                              {product.stock <= 0 ? (
                                <p className="mt-0.5 text-[0.62rem] text-red-300">Out of stock</p>
                              ) : stock.urgent ? (
                                <p className="mt-0.5 text-[0.62rem] text-amber-300">{stock.label}</p>
                              ) : (
                                <p className="mt-0.5 text-[0.62rem] text-emerald-300/80">✓ {stock.label}</p>
                              )}
                              <div className="mt-3 flex items-center gap-2">
                                <QuantityControl
                                  maxStock={product.stock}
                                  onDecrease={() => updateQuantity(item.productSlug, item.quantity - 1, product.stock)}
                                  onIncrease={() => updateQuantity(item.productSlug, item.quantity + 1, product.stock)}
                                  quantity={item.quantity}
                                  size="sm"
                                />
                                <div className="ml-auto flex items-center gap-1">
                                  <CartIconButton
                                    ariaLabel="Remove item"
                                    className="hover:border-red-500/40 hover:text-red-300"
                                    onClick={() => removeFromCartWithUndo(item.productSlug)}
                                  >
                                    <Trash2 size={14} aria-hidden />
                                  </CartIconButton>
                                  <CartIconButton
                                    ariaLabel="Save for later"
                                    onClick={() => saveForLater(item.productSlug)}
                                  >
                                    <Bookmark size={14} aria-hidden />
                                  </CartIconButton>
                                  <CartIconButton
                                    ariaLabel={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                                    className={inWishlist ? "border-red-500/30 text-red-300" : ""}
                                    onClick={() => toggleWishlist(item.productSlug)}
                                  >
                                    <Heart fill={inWishlist ? "currentColor" : "none"} size={14} aria-hidden />
                                  </CartIconButton>
                                </div>
                              </div>
                            </div>
                            <p className="font-display shrink-0 text-lg text-white">{formatCurrency(item.lineTotal)}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {totals.items.length > 0 ? (
              <div className="border-t border-white/10 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                <FreeShippingBar compact totals={totals} />
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Subtotal</span>
                  <span className="font-display text-3xl text-white">{formatCurrency(totals.subtotal)}</span>
                </div>
                <button
                  className="group mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#FF1010] text-sm font-black uppercase tracking-[0.16em] text-white shadow-[0_0_28px_rgba(255,16,16,0.25)] transition hover:bg-[#ff2828] hover:shadow-[0_0_36px_rgba(255,16,16,0.4)]"
                  onClick={goCheckout}
                  type="button"
                >
                  Checkout Securely
                  <ArrowRight className="ml-2 transition group-hover:translate-x-0.5" size={16} aria-hidden />
                </button>
                <button
                  className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/15 text-xs font-black uppercase tracking-[0.14em] text-zinc-300 transition hover:text-white"
                  onClick={closeCartDrawer}
                  type="button"
                >
                  Continue Shopping
                </button>
                <Link
                  className="mt-3 block text-center text-xs font-black uppercase tracking-[0.14em] text-zinc-500 transition hover:text-white"
                  href="/cart"
                  onClick={closeCartDrawer}
                >
                  View Full Cart
                </Link>
              </div>
            ) : null}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
