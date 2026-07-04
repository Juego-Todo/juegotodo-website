"use client";

import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { AddToCartButton } from "@/components/commerce/AddToCartButton";
import { EventTicketCardBody } from "@/components/commerce/EventTicketCardBody";
import { ProductDisplayImage } from "@/components/commerce/ProductDisplayImage";
import { ProductStarRating } from "@/components/commerce/ProductStarRating";
import type { ShopProduct } from "@/data/shop";
import { formatCurrency } from "@/lib/commerce/pricing";
import {
  getProductCardBadge,
  getProductCardBenefits,
  getProductCardSecondaryBadge,
  getProductCardSocialProof,
  getProductEcosystemLine,
  getProductMemberPricing,
  getProductTrustLines,
  getShippingConfidence,
} from "@/lib/commerce/product-card";

function StandardProductCardBody({ product }: { product: ShopProduct }) {
  const badge = getProductCardBadge(product);
  const secondaryBadge = getProductCardSecondaryBadge(product);
  const benefits = getProductCardBenefits(product);
  const ecosystemLine = getProductEcosystemLine(product);
  const trustLines = getProductTrustLines(product);
  const shippingLine = getShippingConfidence(product);
  const { rating, soldThisMonth, proofLine } = getProductCardSocialProof(product);
  const { memberPrice, savings } = getProductMemberPricing(product);

  return (
    <>
      <div className="relative overflow-hidden">
        <div className="transition duration-500 group-hover:scale-[1.06]">
          <ProductDisplayImage
            alt={product.name}
            className="rounded-none"
            product={product}
            size="lg"
            stage="catalog"
          />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-80 transition duration-300 group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(255,16,16,0.18),transparent_55%)] opacity-0 transition duration-300 group-hover:opacity-100" />

        <div className="pointer-events-none absolute left-2.5 top-2.5 z-[2] flex max-w-[75%] flex-wrap gap-1">
          <span className="rounded-full border border-[#FF1010]/35 bg-black/80 px-2 py-0.5 text-[0.52rem] font-black uppercase tracking-[0.12em] text-[#FF1010] backdrop-blur-sm">
            {badge}
          </span>
          {secondaryBadge ? (
            <span className="rounded-full border border-white/15 bg-black/70 px-2 py-0.5 text-[0.52rem] font-black uppercase tracking-[0.12em] text-zinc-300 backdrop-blur-sm">
              {secondaryBadge}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="min-w-0 flex-1">
          <p className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-[#FF1010]/90">{ecosystemLine}</p>
          <h3 className="font-display mt-1 text-[1.35rem] uppercase leading-[0.92] text-white transition duration-300 group-hover:text-[#FF1010] sm:text-[1.55rem]">
            {product.name}
          </h3>

          <div className="mt-2">
            <p className="font-display text-[1.65rem] leading-none text-white transition duration-300 group-hover:text-[#FF1010] group-hover:drop-shadow-[0_0_14px_rgba(255,16,16,0.35)] sm:text-[1.75rem]">
              {formatCurrency(product.priceAmount)}
            </p>
            <p className="mt-1 text-[0.62rem] leading-5 text-zinc-400">
              JT Members Pay{" "}
              <span className="font-semibold text-emerald-300">{formatCurrency(memberPrice)}</span>
              {savings > 0 ? (
                <span className="text-zinc-500"> · Save {formatCurrency(savings)}</span>
              ) : null}
            </p>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
            <ProductStarRating rating={rating} size={12} />
            <span className="text-[0.58rem] font-semibold text-zinc-500">{rating.toFixed(1)}</span>
            <span className="text-[0.58rem] text-zinc-600">·</span>
            <span className="text-[0.58rem] text-zinc-400">{soldThisMonth} sold this month</span>
          </div>
          <p className="mt-1 text-[0.58rem] text-zinc-500">{proofLine}</p>

          <ul className="mt-2.5 space-y-1">
            {benefits.map((benefit) => (
              <li className="flex items-start gap-1.5 text-[0.68rem] leading-5 text-zinc-400" key={benefit}>
                <Check className="mt-0.5 shrink-0 text-emerald-400/90" size={11} aria-hidden />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          <p className="mt-2 text-[0.58rem] text-zinc-500">{shippingLine}</p>
        </div>

        <ul className="mt-3 space-y-0.5 border-t border-white/8 pt-3">
          {trustLines.map((line) => (
            <li className="flex items-center gap-1.5 text-[0.58rem] text-zinc-400" key={line}>
              <Check className="shrink-0 text-emerald-400/80" size={10} aria-hidden />
              {line}
            </li>
          ))}
        </ul>

        <div className="mt-3" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
          <AddToCartButton
            className="transition duration-300 group-hover:scale-[1.02] group-hover:shadow-[0_0_28px_rgba(255,16,16,0.35)]"
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
      className={`group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[1.25rem] border transition duration-300 hover:-translate-y-1.5 hover:border-[#FF1010]/55 hover:shadow-[0_24px_60px_rgba(0,0,0,0.55),0_0_32px_rgba(255,16,16,0.14)] ${
        championship
          ? "border-amber-500/20 bg-gradient-to-b from-amber-500/[0.08] to-black/50"
          : isEventTicket
            ? "border-[#FF1010]/20 bg-gradient-to-b from-[#FF1010]/[0.06] to-black/80"
            : "border-[#2A2A2A] bg-gradient-to-b from-white/[0.04] to-black/70"
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
                size="lg"
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
