"use client";

import { motion } from "framer-motion";
import { ArrowRight, Search, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MotionSection } from "@/components/MotionSection";
import { shopProducts } from "@/data/shop";
import { shopCategoryLabels, type ShopCategory } from "@/lib/commerce/types";
import { formatCurrency } from "@/lib/commerce/pricing";

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
    <MotionSection className="mx-auto max-w-7xl pb-14 sm:pb-20">
      <div className="glass-panel mb-6 rounded-[1.75rem] p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} aria-hidden />
            <input
              className="w-full rounded-2xl border border-white/10 bg-black/40 py-3 pl-11 pr-4 text-sm text-white outline-none ring-red-500/40 placeholder:text-zinc-500 focus:ring-4"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search the armory — sticks, gloves, belts, courses..."
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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product, index) => (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 16 }}
              key={product.slug}
              transition={{ delay: index * 0.04, duration: 0.35 }}
            >
              <Link
                className="glass-panel group block overflow-hidden rounded-[1.75rem] transition hover:-translate-y-2 hover:border-red-500/40"
                href={`/shop/${product.slug}`}
              >
                <div className={`relative min-h-48 bg-gradient-to-br ${product.tone} p-5 sm:min-h-56`}>
                  {product.badge ? (
                    <span className="rounded-full bg-red-600 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.18em] text-white">
                      {product.badge}
                    </span>
                  ) : (
                    <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.18em] text-zinc-200">
                      {shopCategoryLabels[product.category]}
                    </span>
                  )}
                  <ShoppingBag
                    className="absolute bottom-5 right-5 text-red-200/80 transition group-hover:scale-110"
                    size={28}
                    aria-hidden
                  />
                  <h2 className="font-display mt-16 text-3xl uppercase leading-none text-white sm:mt-20 sm:text-4xl">
                    {product.name}
                  </h2>
                </div>
                <div className="space-y-4 p-5">
                  <p className="text-sm leading-6 text-zinc-400">{product.description}</p>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-display text-3xl text-white">{formatCurrency(product.priceAmount)}</p>
                    <span className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-200 transition group-hover:border-red-500/40 group-hover:text-white">
                      View Details
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      <div className="glass-panel mt-8 rounded-[1.75rem] p-6 sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300 sm:text-sm">
          Fighter Equipment Armory
        </p>
        <h2 className="font-display mt-3 text-4xl uppercase leading-none text-white sm:text-5xl">
          Connected To Athlete Profiles
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
          Official Juego Todo gear links to your member profile, order history, and athlete discounts.
          Sign in to checkout — guest purchases are disabled to protect the fighter ecosystem.
        </p>
        <Link
          className="mt-5 inline-flex items-center text-sm font-black uppercase tracking-[0.18em] text-red-200 transition hover:text-white"
          href="/login?next=/shop"
        >
          Sign In To Shop
          <ArrowRight className="ml-2" size={16} aria-hidden />
        </Link>
      </div>
    </MotionSection>
  );
}
