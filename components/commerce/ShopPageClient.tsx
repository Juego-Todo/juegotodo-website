"use client";

import { useSearchParams } from "next/navigation";
import { ShopCatalog } from "@/components/commerce/ShopCatalog";
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

export function ShopPageClient() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const initialCategory = validCategories.includes(categoryParam as ShopCategory)
    ? (categoryParam as ShopCategory)
    : undefined;

  return <ShopCatalog initialCategory={initialCategory} />;
}
