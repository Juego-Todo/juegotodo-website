"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ShopCatalog } from "@/components/commerce/ShopCatalog";
import {
  ShopAthletePicks,
  ShopBestSellers,
  ShopBundles,
  ShopCategoryGrid,
  ShopChampionshipSection,
  ShopCollections,
  ShopEditorialStrip,
  ShopHero,
  ShopMembershipSection,
  ShopNewArrivals,
} from "@/components/commerce/shop/ShopExperience";
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

  return <ShopCatalog initialCategory={initialCategory} />;
}

export function ShopPageClient() {
  return (
    <div className="mx-auto max-w-7xl">
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
      <ShopHero />
      <ShopCategoryGrid />
      <ShopCollections />
      <ShopEditorialStrip variant="competition" />
      <ShopBestSellers />
      <ShopEditorialStrip variant="athletes" />
      <ShopAthletePicks />
      <ShopChampionshipSection />
      <ShopEditorialStrip variant="official" />
      <ShopBundles />
      <ShopNewArrivals />
      <ShopMembershipSection />
      <Suspense fallback={<div className="mt-20 h-40 animate-pulse rounded-lg bg-white/[0.03]" />}>
        <ShopCatalogWithParams />
      </Suspense>
    </div>
  );
}
