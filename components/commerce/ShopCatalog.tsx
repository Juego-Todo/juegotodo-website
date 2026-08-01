"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { MotionSection } from "@/components/MotionSection";
import { ShopProductCard } from "@/components/commerce/ShopProductCard";
import { productHasPhoto, shopProducts, type ShopProduct } from "@/data/shop";
import { getPublicShopProducts, subscribeCatalogChanges } from "@/lib/commerce/catalog-store";
import { bestSellerSlugs } from "@/lib/commerce/product-visuals";
import {
  getShopCollection,
  matchesShopCollection,
  shopCollections,
  type ShopCollectionId,
} from "@/lib/commerce/shop-collections";
import type { ShopCategory } from "@/lib/commerce/types";

type ShopCatalogProps = {
  activeCategory: ShopCategory | "all";
  activeCollection: ShopCollectionId;
  onCollectionSelect?: (collectionId: ShopCollectionId) => void;
};

const mobileChips: { id: ShopCollectionId; label: string }[] = [
  { id: "all", label: "All" },
  ...shopCollections.map((collection) => ({
    id: collection.id,
    label: collection.displayTitle,
  })),
];

export function ShopCatalog({
  activeCategory,
  activeCollection,
  onCollectionSelect,
}: ShopCatalogProps) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc">("featured");
  const [catalog, setCatalog] = useState<ShopProduct[]>(() => shopProducts.filter(productHasPhoto));
  const activeCollectionMeta = getShopCollection(activeCollection);

  useEffect(() => {
    const refresh = () => setCatalog(getPublicShopProducts());
    refresh();
    return subscribeCatalogChanges(refresh);
  }, []);

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    let results = catalog.filter((product) => {
      if (!productHasPhoto(product)) {
        return false;
      }
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
  }, [activeCategory, activeCollection, catalog, query, sort]);

  return (
    <MotionSection className="mt-3 pb-28 pt-2 sm:mt-9 sm:border-t sm:border-white/[0.06] sm:pb-32 sm:pt-9" id="full-catalog">
      <div className="mb-2 flex items-center justify-between gap-2 sm:mb-0 sm:flex-col sm:items-stretch sm:gap-2 md:flex-row md:items-end md:justify-between">
        <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-zinc-300 sm:font-display sm:text-3xl sm:font-normal sm:tracking-normal sm:text-white">
          {activeCollectionMeta ? activeCollectionMeta.label : "All Products"}
          <span className="ml-2 font-semibold normal-case tracking-normal text-zinc-500 sm:hidden">
            ({filteredProducts.length})
          </span>
        </h2>
        {activeCollectionMeta ? (
          <p className="hidden text-sm text-zinc-400 sm:block">
            Showing <span className="font-semibold text-white">{activeCollectionMeta.label}</span>
          </p>
        ) : null}
      </div>

      {/* Mobile sticky search + category chips (Lazada-style) */}
      <div className="sticky top-[4.25rem] z-30 -mx-4 mb-3 border-b border-white/[0.06] bg-[#050505]/95 px-4 py-2.5 backdrop-blur-md sm:static sm:mx-0 sm:mb-6 sm:mt-6 sm:rounded-xl sm:border sm:border-white/[0.06] sm:bg-white/[0.02] sm:p-3 sm:backdrop-blur-none">
        <div className="flex items-center gap-2">
          <label className="relative block min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500"
              size={14}
              aria-hidden
            />
            <input
              className="w-full rounded-lg border border-white/10 bg-black/50 py-2 pl-8 pr-2.5 text-sm text-white outline-none ring-red-500/40 placeholder:text-zinc-500 focus:ring-2"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products..."
              type="search"
              value={query}
            />
          </label>

          <select
            aria-label="Sort products"
            className="h-10 shrink-0 rounded-lg border border-white/10 bg-black/50 px-2.5 text-xs text-white outline-none ring-red-500/40 focus:ring-2 sm:text-sm"
            onChange={(event) => setSort(event.target.value as typeof sort)}
            value={sort}
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
          </select>
        </div>

        {onCollectionSelect ? (
          <div className="-mx-1 mt-2.5 flex gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
            {mobileChips.map((chip) => {
              const isActive = activeCollection === chip.id;
              return (
                <button
                  aria-current={isActive ? "true" : undefined}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.08em] transition ${
                    isActive
                      ? "bg-[#FF1010] text-white"
                      : "border border-white/10 bg-white/[0.04] text-zinc-300"
                  }`}
                  key={chip.id}
                  onClick={() => onCollectionSelect(chip.id)}
                  type="button"
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="rounded-xl border border-white/10 px-5 py-10 text-center sm:rounded-[1.75rem] sm:p-8">
          <p className="text-base font-semibold text-white sm:font-display sm:text-4xl sm:uppercase">No products found</p>
          <p className="mt-2 text-sm text-zinc-400">Try another search or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 xl:gap-5">
          {filteredProducts.map((product, index) => (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="h-full"
              initial={{ opacity: 0, y: 12 }}
              key={product.slug}
              transition={{ delay: Math.min(index * 0.02, 0.2), duration: 0.3 }}
            >
              <ShopProductCard product={product} />
            </motion.div>
          ))}
        </div>
      )}
    </MotionSection>
  );
}
