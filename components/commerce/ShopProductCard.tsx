"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { ProductDisplayImage } from "@/components/commerce/ProductDisplayImage";
import { QuickAddToCart } from "@/components/commerce/QuickAddToCart";
import type { ShopProduct } from "@/data/shop";
import { getProductRating } from "@/lib/commerce/product-visuals";
import { formatCurrency } from "@/lib/commerce/pricing";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          className={index < Math.round(rating) ? "fill-amber-300 text-amber-300" : "text-zinc-700"}
          key={`star-${index}`}
          size={11}
          aria-hidden
        />
      ))}
    </div>
  );
}

export function ShopProductCard({
  product,
  championship = false,
}: {
  product: ShopProduct;
  championship?: boolean;
}) {
  const { rating } = getProductRating(product);

  return (
    <div className="group flex h-full flex-col">
      <div className="relative overflow-hidden rounded-lg bg-white/[0.02]">
        <Link href={`/shop/${product.slug}`}>
          <ProductDisplayImage
            alt={product.name}
            className="!h-[13rem] !min-h-[13rem] sm:!h-[14rem] sm:!min-h-[14rem]"
            product={product}
            size="lg"
          />
        </Link>
        <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <p className="line-clamp-3 text-sm leading-relaxed text-zinc-300">{product.description}</p>
        </div>
      </div>

      <Link className="mt-4 block" href={`/shop/${product.slug}`}>
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-white transition hover:text-[#FF1010]">
          {product.name}
        </h3>
      </Link>

      <p className="mt-1.5 font-display text-xl text-white">{formatCurrency(product.priceAmount)}</p>

      <div className="mt-2">
        <StarRating rating={rating} />
      </div>

      <div className="mt-3">
        <QuickAddToCart className="w-full" compact product={product} />
      </div>
    </div>
  );
}
