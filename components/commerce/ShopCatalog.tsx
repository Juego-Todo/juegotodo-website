"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { MotionSection } from "@/components/MotionSection";
import { ShopProductCard } from "@/components/commerce/ShopProductCard";
import { shopProducts } from "@/data/shop";
import { bestSellerSlugs } from "@/lib/commerce/product-visuals";
import { getShopCollection, matchesShopCollection, type ShopCollectionId } from "@/lib/commerce/shop-collections";
import { shopCategoryLabels, type ShopCategory } from "@/lib/commerce/types";

const filterCategories: { label: string; value: ShopCategory | "all" }[] = [
  { label: "All", value: "all" },
  ...(
    Object.entries(shopCategoryLabels) as [ShopCategory, string][]
  ).map(([value, label]) => ({ label, value })),
];

type ShopCatalogProps = {
  activeCategory: ShopCategory | "all";
  activeCollection: ShopCollectionId;
  onCategoryChange: (category: ShopCategory | "all") => void;
};

export function ShopCatalog({ activeCategory, activeCollection, onCategoryChange }: ShopCatalogProps) {
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
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-[#FF1010]">Full Armory</p>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="font-display text-4xl font-normal uppercase text-white sm:text-5xl">All Products</h2>
        {activeCollectionMeta ? (
          <p className="text-sm text-zinc-400">
            Showing <span className="font-semibold text-white">{activeCollectionMeta.label}</span>
          </p>
        ) : null}
      </div>

      <div className="mb-6 mt-8 rounded-lg bg-white/[0.02] p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} aria-hidden />
            <input
              className="w-full rounded-2xl border border-white/10 bg-black/40 py-3 pl-11 pr-4 text-sm text-white outline-none ring-red-500/40 placeholder:text-zinc-500 focus:ring-4"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search gloves, helmets, sticks, belts..."
              value={query}
            />
          </label>
          <select
            className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-red-500/40 focus:ring-4"
            onChange={(event) => setSort(event.target.value as typeof sort)}
            value={sort}
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {filterCategories.map((category) => (
          <button
            className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition ${
              activeCategory === category.value
                ? "bg-red-600 text-white shadow-[0_0_22px_rgba(229,9,20,0.35)]"
                : "border border-white/10 bg-white/[0.04] text-zinc-300 hover:border-red-500/40 hover:text-white"
            }`}
            key={category.value}
            onClick={() => onCategoryChange(category.value)}
            type="button"
          >
            {category.label}
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="glass-panel rounded-[1.75rem] p-8 text-center">
          <p className="font-display text-4xl uppercase text-white">No Gear Found</p>
          <p className="mt-3 text-sm text-zinc-400">Try another search term, collection, or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
