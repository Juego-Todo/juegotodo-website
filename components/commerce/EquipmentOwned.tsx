"use client";

import Link from "next/link";
import { ProductVisual } from "@/components/commerce/ProductVisual";
import { getShopProduct } from "@/data/shop";
import { useCommerce } from "@/lib/commerce/context";
import { getProductImageKey } from "@/lib/commerce/product-visuals";

export function EquipmentOwned() {
  const { orders } = useCommerce();

  const ownedSlugs = [...new Set(orders.flatMap((order) => order.items.map((item) => item.productSlug)))];
  const ownedProducts = ownedSlugs
    .map((slug) => getShopProduct(slug))
    .filter((product): product is NonNullable<typeof product> => Boolean(product));

  if (ownedProducts.length === 0) {
    return null;
  }

  return (
    <div className="glass-panel rounded-[1.5rem] p-5 sm:p-6">
      <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#FF1010]">Equipment Owned</p>
      <h2 className="font-display mt-2 text-3xl uppercase text-white">Your JTGC Gear</h2>
      <p className="mt-2 text-sm text-zinc-400">Official purchases linked to your league credential.</p>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {ownedProducts.map((product) => (
          <li key={product.slug}>
            <Link
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 p-3 transition hover:border-[#FF1010]/30"
              href={`/shop/${product.slug}`}
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                <ProductVisual imageKey={getProductImageKey(product)} size="sm" />
              </div>
              <span className="text-sm font-semibold text-white">{product.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
