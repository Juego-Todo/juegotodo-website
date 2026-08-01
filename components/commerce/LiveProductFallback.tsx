"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductDetailClient } from "@/components/commerce/ProductDetailClient";
import type { ShopProduct } from "@/data/shop";
import { getLiveShopProduct, subscribeCatalogChanges } from "@/lib/commerce/catalog-store";

/**
 * Renders admin-created catalog products that don't exist in the static
 * build-time catalog. Resolves the product from the live catalog client-side.
 */
export function LiveProductFallback({ slug }: { slug: string }) {
  const [product, setProduct] = useState<ShopProduct | null | undefined>(undefined);

  useEffect(() => {
    const refresh = () => setProduct(getLiveShopProduct(slug) ?? null);
    refresh();
    return subscribeCatalogChanges(refresh);
  }, [slug]);

  if (product === undefined) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center text-sm text-zinc-500">Loading product…</div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <p className="font-display text-4xl uppercase text-white">Product Not Found</p>
        <p className="mt-3 text-sm text-zinc-400">This product may have been removed from the shop.</p>
        <Link
          className="mt-6 inline-flex rounded-full bg-[#FF1010] px-6 py-3 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#ff2a2a]"
          href="/shop"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  return <ProductDetailClient product={product} />;
}
