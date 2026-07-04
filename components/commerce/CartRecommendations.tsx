"use client";

import Link from "next/link";
import { CompactProductCard } from "@/components/commerce/CompactProductCard";
import { getShopProduct, shopProducts } from "@/data/shop";
import { useCommerce } from "@/lib/commerce/context";
import { bestSellerSlugs } from "@/lib/commerce/product-visuals";

type CartRecommendationsProps = {
  title: string;
  subtitle?: string;
  excludeSlugs?: Set<string>;
  slugs?: string[];
  limit?: number;
};

export function CartRecommendations({
  title,
  subtitle,
  excludeSlugs = new Set(),
  slugs,
  limit = 4,
}: CartRecommendationsProps) {
  const { recentlyViewed } = useCommerce();

  const sourceSlugs =
    slugs ??
    (title.includes("Recent")
      ? recentlyViewed
      : title.includes("Bought")
        ? [...bestSellerSlugs]
        : shopProducts.filter((p) => p.badge === "Best Seller").map((p) => p.slug));

  const products = sourceSlugs
    .map((slug) => getShopProduct(slug))
    .filter((product): product is NonNullable<typeof product> => Boolean(product))
    .filter((product) => !excludeSlugs.has(product.slug))
    .slice(0, limit);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="glass-panel rounded-[1.5rem] p-5 sm:p-6">
      <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-[#FF1010]">{subtitle ?? "Recommended"}</p>
      <h2 className="font-display mt-2 text-2xl uppercase text-white sm:text-3xl">{title}</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <CompactProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}

export function EmptyCartState() {
  const cartSlugs = new Set<string>();

  return (
    <div className="mt-10">
      <div className="glass-panel rounded-[1.75rem] px-6 py-14 text-center sm:px-10">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-[#FF1010]/20 bg-[#FF1010]/10">
          <span className="font-display text-5xl text-[#FF1010]">JT</span>
        </div>
        <p className="font-display mt-6 text-4xl uppercase text-white sm:text-5xl">Your Cart Is Empty</p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-zinc-400">
          Official Juego Todo gear, competition equipment, and league apparel — built for athletes and fans.
        </p>
        <Link
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[#FF1010] px-8 text-xs font-black uppercase tracking-[0.16em] text-white shadow-[0_0_28px_rgba(255,16,16,0.3)] transition hover:bg-[#ff2828]"
          href="/shop"
        >
          Continue Shopping
        </Link>
      </div>

      <div className="mt-8">
        <CartRecommendations excludeSlugs={cartSlugs} limit={4} title="Trending Products" />
      </div>
    </div>
  );
}
