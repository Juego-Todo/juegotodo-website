"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { ProductDisplayImage } from "@/components/commerce/ProductDisplayImage";
import { QuickAddToCart } from "@/components/commerce/QuickAddToCart";
import type { ShopProduct } from "@/data/shop";
import { getProductRating } from "@/lib/commerce/product-visuals";
import { formatCurrency } from "@/lib/commerce/pricing";

export function CompactProductCard({ product }: { product: ShopProduct }) {
  const { rating } = getProductRating(product);

  return (
    <div className="group flex flex-col">
      <Link className="block overflow-hidden rounded-lg bg-white/[0.02]" href={`/shop/${product.slug}`}>
        <ProductDisplayImage
          alt={product.name}
          className="!min-h-[7.5rem] !rounded-lg"
          product={product}
          size="sm"
        />
      </Link>
      <Link className="mt-3 block" href={`/shop/${product.slug}`}>
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-white transition group-hover:text-[#FF1010]">
          {product.name}
        </h3>
      </Link>
      <div className="mt-1.5 flex items-center gap-1 text-xs text-zinc-500">
        <Star className="fill-amber-300 text-amber-300" size={10} aria-hidden />
        <span>{rating}</span>
      </div>
      <p className="mt-1 font-display text-lg text-white">{formatCurrency(product.priceAmount)}</p>
      <div className="mt-2">
        <QuickAddToCart compact product={product} />
      </div>
    </div>
  );
}
