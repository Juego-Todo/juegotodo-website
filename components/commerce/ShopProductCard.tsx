"use client";

import { useRouter } from "next/navigation";
import { AddToCartButton } from "@/components/commerce/AddToCartButton";
import { EventTicketCardBody } from "@/components/commerce/EventTicketCardBody";
import { ProductDisplayImage } from "@/components/commerce/ProductDisplayImage";
import { ProductStarRating } from "@/components/commerce/ProductStarRating";
import type { ShopProduct } from "@/data/shop";
import { formatCurrency } from "@/lib/commerce/pricing";
import {
  getProductCardBadge,
  getProductCardSecondaryBadge,
  getProductCardSocialProof,
  getProductMemberPricing,
} from "@/lib/commerce/product-card";

function StandardProductCardBody({ product }: { product: ShopProduct }) {
  const badge = getProductCardBadge(product);
  const secondaryBadge = getProductCardSecondaryBadge(product);
  const { rating, soldThisMonth } = getProductCardSocialProof(product);
  const { memberPrice, savings } = getProductMemberPricing(product);

  return (
    <>
      <div className="relative overflow-hidden bg-black/40">
        <div className="transition duration-500 group-hover:scale-[1.04]">
          <ProductDisplayImage
            alt={product.name}
            className="rounded-none"
            product={product}
            size="md"
            stage="catalog"
          />
        </div>

        <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-80 transition duration-300 group-hover:opacity-100 sm:block" />

        <div className="pointer-events-none absolute left-1.5 top-1.5 z-[2] max-w-[85%] sm:left-2 sm:top-2 sm:flex sm:flex-wrap sm:gap-1">
          <span className="rounded bg-[#FF1010] px-1.5 py-0.5 text-[0.5rem] font-bold uppercase tracking-[0.06em] text-white sm:rounded-full sm:border sm:border-[#FF1010]/35 sm:bg-black/80 sm:tracking-[0.1em] sm:text-[#FF1010] sm:backdrop-blur-sm">
            {badge}
          </span>
          {secondaryBadge ? (
            <span className="hidden rounded-full border border-white/15 bg-black/70 px-1.5 py-0.5 text-[0.5rem] font-black uppercase tracking-[0.1em] text-zinc-300 backdrop-blur-sm sm:inline-flex">
              {secondaryBadge}
            </span>
          ) : null}
        </div>
      </div>

      {/* Mobile: basic Lazada-style content */}
      <div className="flex flex-1 flex-col gap-1 p-2 sm:hidden">
        <h3 className="line-clamp-2 text-[0.78rem] font-semibold leading-snug text-zinc-100">
          {product.name}
        </h3>
        <p className="text-[0.95rem] font-bold leading-none text-[#FF1010]">
          {formatCurrency(product.priceAmount)}
        </p>
        <p className="text-[0.58rem] leading-4 text-zinc-500">
          {rating.toFixed(1)} ★ · {soldThisMonth} sold
        </p>
      </div>

      {/* Desktop: richer card */}
      <div className="hidden flex-1 flex-col p-3 sm:flex">
        <div className="min-w-0 flex-1">
          <h3 className="font-display line-clamp-2 text-[1.15rem] uppercase leading-[0.95] text-white transition duration-300 group-hover:text-[#FF1010]">
            {product.name}
          </h3>

          <div className="mt-1.5">
            <p className="font-display text-[1.35rem] leading-none text-white transition duration-300 group-hover:text-[#FF1010]">
              {formatCurrency(product.priceAmount)}
            </p>
            <p className="mt-0.5 text-[0.56rem] leading-4 text-zinc-400">
              JT Members{" "}
              <span className="font-semibold text-emerald-300">{formatCurrency(memberPrice)}</span>
              {savings > 0 ? (
                <span className="text-zinc-500"> · Save {formatCurrency(savings)}</span>
              ) : null}
            </p>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
            <ProductStarRating rating={rating} size={10} />
            <span className="text-[0.52rem] font-semibold text-zinc-500">{rating.toFixed(1)}</span>
            <span className="text-[0.5rem] text-zinc-600">·</span>
            <span className="text-[0.52rem] text-zinc-400">{soldThisMonth} sold</span>
          </div>
        </div>

        <div
          className="mt-2.5"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <AddToCartButton
            className="transition duration-300 group-hover:scale-[1.01] group-hover:shadow-[0_0_20px_rgba(255,16,16,0.3)]"
            compact
            fullWidth
            product={product}
          />
        </div>
      </div>
    </>
  );
}

export function ShopProductCard({
  product,
  championship = false,
}: {
  product: ShopProduct;
  championship?: boolean;
}) {
  const router = useRouter();
  const isEventTicket = Boolean(product.eventTicket);

  function openProduct() {
    router.push(`/shop/${product.slug}`);
  }

  return (
    <article
      className={`group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border transition duration-300 sm:rounded-xl sm:hover:-translate-y-1 sm:hover:border-[#FF1010]/55 sm:hover:shadow-[0_16px_40px_rgba(0,0,0,0.5),0_0_24px_rgba(255,16,16,0.12)] ${
        championship
          ? "border-amber-500/20 bg-gradient-to-b from-amber-500/[0.08] to-black/50"
          : isEventTicket
            ? "border-white/10 bg-[#0d0d0d] sm:border-[#FF1010]/20 sm:bg-gradient-to-b sm:from-[#FF1010]/[0.06] sm:to-black/80"
            : "border-white/10 bg-[#0d0d0d] sm:border-[#2A2A2A] sm:bg-gradient-to-b sm:from-white/[0.04] sm:to-black/70"
      }`}
      onClick={openProduct}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openProduct();
        }
      }}
      aria-label={`View ${product.name}`}
      tabIndex={0}
    >
      {isEventTicket ? (
        <>
          <div className="relative overflow-hidden">
            <div className="transition duration-500 group-hover:scale-[1.03]">
              <ProductDisplayImage
                alt={product.name}
                className="rounded-none"
                product={product}
                size="md"
                stage="catalog"
              />
            </div>
          </div>
          <EventTicketCardBody product={product} />
        </>
      ) : (
        <StandardProductCardBody product={product} />
      )}
    </article>
  );
}
