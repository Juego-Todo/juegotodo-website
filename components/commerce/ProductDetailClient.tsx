"use client";

import { useMemo, useState, useEffect } from "react";
import { Check, Plus, Star, Truck } from "lucide-react";
import Link from "next/link";
import { CompactProductCard } from "@/components/commerce/CompactProductCard";
import { ProductActions } from "@/components/commerce/ProductActions";
import { ProductDisplayImage } from "@/components/commerce/ProductDisplayImage";
import { ProductVariantSelector } from "@/components/commerce/ProductVariantSelector";
import { StickyPurchaseBar } from "@/components/commerce/StickyPurchaseBar";
import type { ShopProduct } from "@/data/shop";
import { getShopProduct, shopProducts } from "@/data/shop";
import { useCommerce } from "@/lib/commerce/context";
import {
  getDefaultVariantSelections,
  getSelectedVariantImage,
  getSelectedVariantPrice,
} from "@/lib/commerce/product-options";
import {
  bundleSlugs,
  getAthletesUsingProduct,
  getProductBadges,
  getProductRating,
  getProductSocialProof,
  getStockLabel,
} from "@/lib/commerce/product-visuals";
import { formatCurrency } from "@/lib/commerce/pricing";
import { shopCategoryLabels } from "@/lib/commerce/types";

const galleryAngles = ["Front", "Side", "Usage", "Close-up", "In Action"] as const;

const editorialSections = [
  {
    id: "why-athletes",
    eyebrow: "Why Athletes Use It",
    title: "Built for the transition.",
    body: (product: ShopProduct) => product.competitionUse,
  },
  {
    id: "competition-approved",
    eyebrow: "Competition Approved",
    title: "JTGC certified equipment.",
    body: () =>
      "Every piece in the official armory passes league inspection standards for weapon rounds, Mano y Mano exchanges, and championship events nationwide.",
  },
  {
    id: "used-in-events",
    eyebrow: "Used In JTGC Events",
    title: "Trusted on fight night.",
    body: (product: ShopProduct) => getProductSocialProof(product),
  },
  {
    id: "built-for-competition",
    eyebrow: "Built For Competition",
    title: "Engineered for Filipino martial arts.",
    body: (product: ShopProduct) => product.summary,
  },
] as const;

function SectionRule() {
  return <hr className="border-white/[0.06]" />;
}

function StarRating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <div className="flex items-center gap-2 text-sm text-zinc-400">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            className={index < Math.round(rating) ? "fill-amber-300 text-amber-300" : "text-zinc-700"}
            key={`star-${index}`}
            size={12}
            aria-hidden
          />
        ))}
      </div>
      <span className="text-white">{rating}</span>
      <span>({reviewCount})</span>
    </div>
  );
}

export function ProductDetailClient({ product }: { product: ShopProduct }) {
  const { addToCart, trackProductView } = useCommerce();
  const [activeImage, setActiveImage] = useState(0);
  const [variantSelections, setVariantSelections] = useState(() => getDefaultVariantSelections(product));
  const displayImage = getSelectedVariantImage(product, variantSelections);
  const displayPrice = useMemo(
    () => getSelectedVariantPrice(product, variantSelections),
    [product, variantSelections],
  );
  const { rating, reviewCount } = getProductRating(product);
  const stock = getStockLabel(product.stock);
  const badges = getProductBadges(product);
  const athletesUsing = getAthletesUsingProduct(product.slug);

  useEffect(() => {
    trackProductView(product.slug);
  }, [product.slug, trackProductView]);

  function handleVariantChange(groupId: string, optionId: string) {
    setVariantSelections((current) => ({ ...current, [groupId]: optionId }));
  }

  const relatedProducts = shopProducts
    .filter((item) => item.category === product.category && item.slug !== product.slug)
    .slice(0, 5);

  const bundleItems = [product, ...bundleSlugs.map((slug) => getShopProduct(slug)).filter(Boolean)]
    .filter((item, index, arr) => item && arr.findIndex((entry) => entry?.slug === item.slug) === index)
    .slice(0, 3) as ShopProduct[];

  const bundleTotal = bundleItems.reduce((sum, item) => sum + item.priceAmount, 0);
  const bundleDiscount = Math.round(bundleTotal * 0.15);
  const bundleName =
    bundleItems.length >= 3 ? "Competitor Bundle" : bundleItems.length === 2 ? "Training Pair" : "Essential Add-On";

  function addBundle() {
    bundleItems.forEach((item) => {
      addToCart(item.slug, 1);
    });
  }

  return (
    <>
      <StickyPurchaseBar observeId="purchase-anchor" product={product} variantSelections={variantSelections} />

      <section className="mx-auto max-w-7xl pb-24">
        {/* Hero — photography first */}
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:items-start">
          <div className="space-y-3">
            <div className="overflow-hidden rounded-lg bg-white/[0.02]">
              <ProductDisplayImage
                alt={product.name}
                className="!rounded-lg"
                imageSrc={displayImage}
                priority
                product={product}
                size="hero"
              />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {galleryAngles.map((angle, index) => (
                <button
                  className={`overflow-hidden rounded-lg bg-white/[0.02] p-1.5 text-[0.5rem] font-medium uppercase tracking-[0.08em] transition ${
                    activeImage === index ? "ring-1 ring-[#FF1010]/60 text-white" : "text-zinc-600 hover:text-zinc-300"
                  }`}
                  key={angle}
                  onClick={() => setActiveImage(index)}
                  type="button"
                >
                  <div className="aspect-square w-full overflow-hidden rounded-md">
                    <ProductDisplayImage
                      alt={`${product.name} ${angle}`}
                      className="rounded-none"
                      imageSrc={displayImage}
                      product={product}
                      size="sm"
                      variant="thumb"
                    />
                  </div>
                  <span className="mt-1.5 block">{angle}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Purchase column — typography, no cards */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-zinc-500">
              {shopCategoryLabels[product.category]}
            </p>

            {badges.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {badges.slice(0, 2).map((badge, index) => (
                  <span className="text-[0.62rem] font-medium uppercase tracking-[0.12em] text-[#FF1010]" key={`${badge}-${index}`}>
                    {badge}
                  </span>
                ))}
              </div>
            ) : null}

            <h1 className="font-display mt-4 text-4xl font-normal uppercase leading-[0.95] text-white sm:text-5xl lg:text-[3.25rem]">
              {product.name}
            </h1>

            <div className="mt-4">
              <StarRating rating={rating} reviewCount={reviewCount} />
            </div>

            <p className="font-display mt-6 text-4xl font-normal text-white">{formatCurrency(displayPrice)}</p>

            <p className="mt-4 text-base leading-7 text-zinc-400">{product.summary}</p>

            <ProductVariantSelector
              onChange={handleVariantChange}
              product={product}
              selections={variantSelections}
            />

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs uppercase tracking-[0.12em] text-zinc-500">
              <span className={stock.urgent ? "text-[#FF1010]" : ""}>{stock.label}</span>
              <span className="text-zinc-700">·</span>
              <span className="inline-flex items-center gap-1">
                <Truck size={11} aria-hidden />
                {stock.ships}
              </span>
            </div>

            <div className="mt-8" id="purchase-anchor">
              <ProductActions product={product} variantSelections={variantSelections} />
            </div>

            <ul className="mt-8 space-y-2 border-t border-white/[0.06] pt-6">
              {["JTGC Approved", "Competition Legal", "Official Equipment"].map((item) => (
                <li className="flex items-center gap-2 text-sm text-zinc-400" key={item}>
                  <Check className="shrink-0 text-[#FF1010]" size={14} aria-hidden />
                  {item}
                </li>
              ))}
            </ul>

            {athletesUsing.length > 0 ? (
              <p className="mt-6 text-sm text-zinc-500">
                Used by{" "}
                <span className="text-zinc-300">{athletesUsing.slice(0, 3).join(", ")}</span>
              </p>
            ) : null}
          </div>
        </div>

        {/* Editorial rhythm — whitespace, not boxes */}
        <div className="mt-24 space-y-24">
          {editorialSections.map((section, index) => (
            <div key={section.id}>
              {index > 0 ? <SectionRule /> : null}
              <div className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${index > 0 ? "pt-24" : ""}`}>
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="overflow-hidden rounded-lg bg-white/[0.02]">
                    <ProductDisplayImage
                      alt={product.name}
                      className="rounded-lg"
                      product={product}
                      size="lg"
                      stage="catalog"
                    />
                  </div>
                </div>
                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[#FF1010]">{section.eyebrow}</p>
                  <h2 className="font-display mt-3 text-3xl font-normal uppercase leading-tight text-white sm:text-4xl">
                    {section.title}
                  </h2>
                  <p className="mt-5 max-w-lg text-base leading-7 text-zinc-400">{section.body(product)}</p>
                  {section.id === "why-athletes" ? (
                    <ul className="mt-6 space-y-2">
                      {product.features.slice(0, 4).map((feature) => (
                        <li className="flex items-start gap-2 text-sm text-zinc-400" key={feature}>
                          <Check className="mt-0.5 shrink-0 text-[#FF1010]" size={14} aria-hidden />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {section.id === "used-in-events" && athletesUsing.length > 0 ? (
                    <p className="mt-6 text-sm text-zinc-500">
                      {athletesUsing.join(" · ")}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ))}

          <SectionRule />

          {/* Specs — typography only */}
          <div className="pt-24">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-zinc-500">Technical Specs</p>
            <h2 className="font-display mt-3 text-3xl font-normal uppercase text-white">Specifications</h2>
            <dl className="mt-10 grid gap-x-12 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
              {product.specs.map((spec) => (
                <div key={spec.label}>
                  <dt className="text-xs uppercase tracking-[0.14em] text-zinc-500">{spec.label}</dt>
                  <dd className="mt-2 text-base text-white">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {bundleItems.length > 1 ? (
            <>
              <SectionRule />
              <div className="pt-24">
                <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-zinc-500">Complete The Setup</p>
                <h2 className="font-display mt-3 text-3xl font-normal uppercase text-white">Frequently Bought Together</h2>

                <div className="mt-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    {bundleItems.map((item, index) => (
                      <div className="flex items-center gap-3 sm:gap-4" key={item.slug}>
                        <Link className="group flex items-center gap-3" href={`/shop/${item.slug}`}>
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white/[0.02] sm:h-20 sm:w-20">
                            <ProductDisplayImage
                              alt={item.name}
                              className="rounded-lg"
                              product={item}
                              size="sm"
                              variant="thumb"
                            />
                          </div>
                          <div>
                            <p className="max-w-[8rem] text-sm font-medium text-white transition group-hover:text-[#FF1010] sm:max-w-none">
                              {item.name}
                            </p>
                            <p className="text-sm text-zinc-500">{formatCurrency(item.priceAmount)}</p>
                          </div>
                        </Link>
                        {index < bundleItems.length - 1 ? (
                          <Plus className="shrink-0 text-zinc-600" size={18} aria-hidden />
                        ) : null}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col items-start gap-3 border-t border-white/[0.06] pt-6 lg:items-end lg:border-t-0 lg:pt-0">
                    <div className="text-left lg:text-right">
                      <p className="text-sm text-zinc-500">= {bundleName}</p>
                      <p className="font-display text-2xl text-white">{formatCurrency(bundleTotal - bundleDiscount)}</p>
                      <p className="text-sm text-[#FF1010]">Save {formatCurrency(bundleDiscount)}</p>
                    </div>
                    <button
                      className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#FF1010] px-6 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#ff2828]"
                      onClick={addBundle}
                      type="button"
                    >
                      Add Bundle
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {relatedProducts.length > 0 ? (
            <>
              <SectionRule />
              <div className="pt-24">
                <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-zinc-500">You May Also Like</p>
                <h2 className="font-display mt-3 text-3xl font-normal uppercase text-white">More From The Armory</h2>
                <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
                  {relatedProducts.map((item) => (
                    <CompactProductCard key={item.slug} product={item} />
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </section>
    </>
  );
}
