"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ShopCatalog } from "@/components/commerce/ShopCatalog";
import { ShopCollectionButtons } from "@/components/commerce/shop/ShopCollectionButtons";
import { ShopHero } from "@/components/commerce/shop/ShopExperience";
import type { ShopCollectionId } from "@/lib/commerce/shop-collections";
import type { ShopCategory } from "@/lib/commerce/types";

const validCategories: ShopCategory[] = [
  "official-gear",
  "protective-equipment",
  "competition-equipment",
  "training-equipment",
  "apparel",
  "championship-collection",
  "digital-products",
];

function ShopCatalogWithParams() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const initialCategory = validCategories.includes(categoryParam as ShopCategory)
    ? (categoryParam as ShopCategory)
    : undefined;
  const [activeCollection, setActiveCollection] = useState<ShopCollectionId>("all");
  const [activeCategory, setActiveCategory] = useState<ShopCategory | "all">(initialCategory ?? "all");

  function handleCollectionSelect(collectionId: ShopCollectionId) {
    setActiveCollection(collectionId);
    setActiveCategory("all");

    if (collectionId !== "all") {
      window.setTimeout(() => {
        document.getElementById("full-catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  }

  function handleCategoryChange(category: ShopCategory | "all") {
    setActiveCategory(category);
    if (category !== "all") {
      setActiveCollection("all");
    }
  }

  return (
    <>
      <ShopCollectionButtons activeCollection={activeCollection} onSelect={handleCollectionSelect} />
      <ShopCatalog
        activeCategory={activeCategory}
        activeCollection={activeCollection}
        onCategoryChange={handleCategoryChange}
      />
    </>
  );
}

export function ShopPageClient() {
  return (
    <>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-[0.65rem] font-medium uppercase tracking-[0.16em] text-zinc-600">
            <li>
              <Link className="transition hover:text-zinc-300" href="/">
                Home
              </Link>
            </li>
            <li aria-hidden className="text-zinc-700">
              /
            </li>
            <li className="text-zinc-400">Official Store</li>
          </ol>
        </nav>
      </div>

      <ShopHero />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="mt-10 h-40 animate-pulse rounded-lg bg-white/[0.03]" />}>
          <ShopCatalogWithParams />
        </Suspense>
      </div>
    </>
  );
}
