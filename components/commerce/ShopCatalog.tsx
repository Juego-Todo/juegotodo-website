"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { MotionSection } from "@/components/MotionSection";
import { PremiumProductCard } from "@/components/commerce/shop/ShopExperience";
import { shopProducts } from "@/data/shop";
import { shopCategoryLabels, type ShopCategory } from "@/lib/commerce/types";

const filterCategories: { label: string; value: ShopCategory | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Official Gear", value: "official-gear" },
  { label: "Protective Equipment", value: "protective-equipment" },
  { label: "Competition Equipment", value: "competition-equipment" },
  { label: "Training Equipment", value: "training-equipment" },
  { label: "Apparel", value: "apparel" },
  { label: "Championship", value: "championship-collection" },
  { label: "Digital", value: "digital-products" },
];

type ShopCatalogProps = {
  initialCategory?: ShopCategory;
};

export function ShopCatalog({ initialCategory }: ShopCatalogProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ShopCategory | "all">(initialCategory ?? "all");
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc">("featured");

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    let results = shopProducts.filter((product) => {
      const matchesCategory = activeCategory === "all" || product.category === activeCategory;
      if (!normalized) {
        return matchesCategory;
      }
      const haystack = [product.name, product.description, ...product.searchTags].join(" ").toLowerCase();
      return matchesCategory && haystack.includes(normalized);
    });

    if (sort === "price-asc") {
      results = [...results].sort((a, b) => a.priceAmount - b.priceAmount);
    } else if (sort === "price-desc") {
      results = [...results].sort((a, b) => b.priceAmount - a.priceAmount);
    }

    return results;
  }, [activeCategory, query, sort]);

  return (
    <MotionSection className="mt-20 pb-14 sm:pb-20" id="full-catalog">
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-[#FF1010]">Full Armory</p>
      <h2 className="font-display mt-2 text-4xl font-normal uppercase text-white sm:text-5xl">All Products</h2>

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
            onClick={() => setActiveCategory(category.value)}
            type="button"
          >
            {category.label}
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="glass-panel rounded-[1.75rem] p-8 text-center">
          <p className="font-display text-4xl uppercase text-white">No Gear Found</p>
          <p className="mt-3 text-sm text-zinc-400">Try another search term or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 xl:grid-cols-3">
          {filteredProducts.map((product, index) => (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="h-full"
              initial={{ opacity: 0, y: 16 }}
              key={product.slug}
              transition={{ delay: index * 0.03, duration: 0.35 }}
            >
              <PremiumProductCard product={product} />
            </motion.div>
          ))}
        </div>
      )}
    </MotionSection>
  );
}
