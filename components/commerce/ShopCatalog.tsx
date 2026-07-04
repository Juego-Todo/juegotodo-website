"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { MotionSection } from "@/components/MotionSection";
import { ShopProductCard } from "@/components/commerce/ShopProductCard";
import { shopProducts } from "@/data/shop";
import { bestSellerSlugs } from "@/lib/commerce/product-visuals";
import { getShopCollection, matchesShopCollection, type ShopCollectionId } from "@/lib/commerce/shop-collections";
import type { ShopCategory } from "@/lib/commerce/types";

type ShopCatalogProps = {
  activeCategory: ShopCategory | "all";
  activeCollection: ShopCollectionId;
};

export function ShopCatalog({ activeCategory, activeCollection }: ShopCatalogProps) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc">("featured");
  const activeCollectionMeta = getShopCollection(activeCollection);

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    let results = shopProducts.filter((product) => {
      const matchesCategory = activeCategory === "all" || product.category === activeCategory;
      const matchesCollection = matchesShopCollection(product, activeCollection);
      if (!normalized) {
        return matchesCategory && matchesCollection;
      }
      const haystack = [product.name, product.description, ...product.searchTags].join(" ").toLowerCase();
      return matchesCategory && matchesCollection && haystack.includes(normalized);
    });

    if (sort === "price-asc") {
      results = [...results].sort((a, b) => a.priceAmount - b.priceAmount);
    } else if (sort === "price-desc") {
      results = [...results].sort((a, b) => b.priceAmount - a.priceAmount);
    } else {
      results = [...results].sort((a, b) => {
        const aIndex = bestSellerSlugs.indexOf(a.slug as (typeof bestSellerSlugs)[number]);
        const bIndex = bestSellerSlugs.indexOf(b.slug as (typeof bestSellerSlugs)[number]);
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
    }

    return results;
  }, [activeCategory, activeCollection, query, sort]);

  return (
    <MotionSection className="mt-10 border-t border-white/[0.06] pb-14 pt-10 sm:mt-12 sm:pb-20 sm:pt-12" id="full-catalog">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="font-display text-4xl font-normal uppercase text-white sm:text-5xl">All Products</h2>
        {activeCollectionMeta ? (
          <p className="text-sm text-zinc-400">
            Showing <span className="font-semibold text-white">{activeCollectionMeta.label}</span>
          </p>
        ) : null}
      </div>

      <div className="mb-8 mt-8 rounded-[1.25rem] border border-white/[0.06] bg-white/[0.02] p-3 sm:p-4">
        <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:thin]">
          <label className="relative block min-w-[10rem] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} aria-hidden />
            <input
              className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pl-9 pr-3 text-sm text-white outline-none ring-red-500/40 placeholder:text-zinc-500 focus:ring-4"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products..."
              value={query}
            />
          </label>

          <select
            aria-label="Sort products"
            className="h-10 shrink-0 rounded-xl border border-white/10 bg-black/40 px-3 text-sm text-white outline-none ring-red-500/40 focus:ring-4"
            onChange={(event) => setSort(event.target.value as typeof sort)}
            value={sort}
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
          </select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="glass-panel rounded-[1.75rem] p-8 text-center">
          <p className="font-display text-4xl uppercase text-white">No Gear Found</p>
          <p className="mt-3 text-sm text-zinc-400">Try another search term or collection filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 sm:gap-8 xl:grid-cols-3 xl:gap-9">
          {filteredProducts.map((product, index) => (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="h-full"
              initial={{ opacity: 0, y: 16 }}
              key={product.slug}
              transition={{ delay: index * 0.03, duration: 0.35 }}
            >
              <ShopProductCard product={product} />
            </motion.div>
          ))}
        </div>
      )}
    </MotionSection>
  );
}
