"use client";

import Link from "next/link";
import { ProductDisplayImage } from "@/components/commerce/ProductDisplayImage";
import { ProductStarRating } from "@/components/commerce/ProductStarRating";
import { QuickAddToCart } from "@/components/commerce/QuickAddToCart";
import type { ShopProduct } from "@/data/shop";
import { getProductRating } from "@/lib/commerce/product-visuals";
import { formatCurrency } from "@/lib/commerce/pricing";

export function CompactProductCard({ product }: { product: ShopProduct }) {
  const { rating } = getProductRating(product);

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-[1.15rem] border border-white/10 bg-gradient-to-b from-white/[0.04] to-black/50 transition hover:border-[#FF1010]/30">
      <Link className="block" href={`/shop/${product.slug}`}>
        <ProductDisplayImage
          alt={product.name}
          className="rounded-none"
          product={product}
          size="lg"
          stage="catalog"
        />
      </Link>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <Link className="block flex-1" href={`/shop/${product.slug}`}>
          <h3 className="line-clamp-2 font-display text-lg uppercase leading-tight text-white transition group-hover:text-[#FF1010]">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2">
          <ProductStarRating rating={rating} size={12} />
        </div>
        <p className="mt-1 font-display text-xl text-white">{formatCurrency(product.priceAmount)}</p>
        <div className="mt-3">
          <QuickAddToCart compact product={product} variant="outline" />
        </div>
      </div>
    </div>
  );
}
