"use client";

import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { MotionSection } from "@/components/MotionSection";
import { ShopProductCard } from "@/components/commerce/ShopProductCard";
import { ProductVisual } from "@/components/commerce/ProductVisual";
import { getShopProduct, shopProducts } from "@/data/shop";
import {
  athletePicks,
  bestSellerSlugs,
  memberBenefits,
  newArrivalSlugs,
  shopBundles,
  shopCategoryTiles,
  shopCollections,
  shopEditorialSections,
} from "@/lib/commerce/product-visuals";
import { formatCurrency } from "@/lib/commerce/pricing";
import { useCommerce } from "@/lib/commerce/context";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-10">
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-zinc-500">{eyebrow}</p>
      <h2 className="font-display mt-2 text-4xl font-normal uppercase text-white sm:text-5xl">{title}</h2>
    </div>
  );
}

function SectionDivider() {
  return <hr className="border-white/[0.06]" />;
}

export function ShopHero() {
  return (
    <section className="pb-6 pt-2">
      <div className="grid items-center gap-10 lg:grid-cols-[38%_62%] lg:gap-12">
        <div className="order-2 lg:order-1">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-[#FF1010]">Juego Todo Combat Commerce</p>
          <h1 className="font-display mt-5 text-[clamp(2.75rem,7vw,4.5rem)] font-normal uppercase leading-[0.92] text-white">
            The Official
            <br />
            Juego Todo Armory
          </h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-zinc-400">
            Competition-certified equipment used by JTGC athletes nationwide.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#FF1010] px-8 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#ff2828]"
              href="#categories"
            >
              Shop Collection
              <ArrowRight className="ml-2" size={16} aria-hidden />
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-white/[0.06] px-8 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-white/10"
              href="#best-sellers"
            >
              Best Sellers
            </Link>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="relative min-h-[22rem] overflow-hidden rounded-lg border border-[#FF1010]/15 sm:min-h-[28rem] lg:min-h-[36rem]">
            <Image
              alt="Official Juego Todo competition gear including gloves, helmet, shin guards, and sticks"
              className="object-cover object-center"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 62vw"
              src="/shop-hero-banner.png"
            />
            <div
              className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.35)_0%,transparent_40%,rgba(0,0,0,0.15)_100%)]"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function ShopCategoryGrid() {
  return (
    <MotionSection className="mt-20" id="categories">
      <SectionHeading eyebrow="Shop By Category" title="Category Collections" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shopCategoryTiles.map((tile) => (
          <Link className="group relative overflow-hidden rounded-lg bg-white/[0.02]" href={tile.href} key={tile.href}>
            <ProductVisual
              className="!h-[14rem] !min-h-[14rem] sm:!h-[16rem] sm:!min-h-[16rem]"
              imageKey={tile.imageKey}
              photographic
              size="lg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <h3 className="font-display text-2xl font-normal uppercase text-white transition group-hover:text-[#FF1010]">
                {tile.label}
              </h3>
              <p className="mt-1 text-sm text-zinc-400">{tile.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </MotionSection>
  );
}

export function ShopCollections() {
  return (
    <MotionSection className="mt-20" id="collections">
      <SectionHeading eyebrow="Curated Sets" title="Shop Collections" />
      <div className="grid gap-6 lg:grid-cols-2">
        {shopCollections.map((collection) => (
          <Link
            className="group grid overflow-hidden rounded-lg bg-white/[0.02] sm:grid-cols-[1fr_1.1fr]"
            href={collection.href}
            key={collection.id}
          >
            <ProductVisual
              className="!h-full !min-h-[12rem]"
              imageKey={collection.imageKey}
              photographic
              size="lg"
            />
            <div className="flex flex-col justify-center p-6 sm:p-8">
              <p className="text-[0.62rem] font-medium uppercase tracking-[0.18em] text-[#FF1010]">Collection</p>
              <h3 className="font-display mt-2 text-3xl font-normal uppercase text-white transition group-hover:text-[#FF1010]">
                {collection.name}
              </h3>
              <p className="mt-3 text-sm leading-7 text-zinc-400">{collection.description}</p>
              <ul className="mt-4 space-y-1">
                {collection.items.map((item) => (
                  <li className="text-sm text-zinc-500" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Link>
        ))}
      </div>
    </MotionSection>
  );
}

export function ShopEditorialStrip({ variant }: { variant: (typeof shopEditorialSections)[number]["id"] }) {
  const section = shopEditorialSections.find((item) => item.id === variant);
  if (!section) return null;

  const imageRight = variant === "athletes";

  return (
    <MotionSection className="mt-20">
      <SectionDivider />
      <div className={`mt-20 grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${imageRight ? "" : ""}`}>
        <div className={imageRight ? "lg:order-2" : ""}>
          <ProductVisual
            className="!min-h-[16rem] sm:!min-h-[20rem]"
            imageKey={section.imageKey}
            photographic
            size="hero"
          />
        </div>
        <div className={imageRight ? "lg:order-1" : ""}>
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-[#FF1010]">{section.eyebrow}</p>
          <h2 className="font-display mt-3 text-3xl font-normal uppercase leading-tight text-white sm:text-4xl">
            {section.title}
          </h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-zinc-400">{section.body}</p>
        </div>
      </div>
    </MotionSection>
  );
}

export function ShopBestSellers() {
  const products = bestSellerSlugs.map((slug) => getShopProduct(slug)).filter(Boolean).slice(0, 4);

  return (
    <MotionSection className="mt-20" id="best-sellers">
      <SectionHeading eyebrow="Most Purchased" title="Best Sellers" />
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {products.map((product) => (
          <ShopProductCard key={product!.slug} product={product!} />
        ))}
      </div>
    </MotionSection>
  );
}

export function ShopAthletePicks() {
  return (
    <MotionSection className="mt-20" id="athlete-picks">
      <SectionHeading eyebrow="Trusted By Champions" title="Athlete Picks" />
      <div className="grid gap-8 lg:grid-cols-2">
        {athletePicks.map((pick) => {
          const product = getShopProduct(pick.productSlug);
          if (!product) return null;
          return (
            <div className="grid gap-6 sm:grid-cols-[0.85fr_1.15fr] sm:items-center" key={pick.athlete}>
              <ProductVisual
                className="!min-h-[14rem]"
                imageKey="gloves"
                photographic
                size="lg"
              />
              <div>
                <p className="text-[0.62rem] font-medium uppercase tracking-[0.18em] text-amber-300">Athlete Pick</p>
                <h3 className="font-display mt-2 text-3xl font-normal uppercase text-white">{pick.athlete}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-zinc-500">{pick.title}</p>
                <p className="mt-4 text-sm italic leading-7 text-zinc-400">&ldquo;{pick.quote}&rdquo;</p>
                <Link className="mt-4 block text-sm font-medium text-white hover:text-[#FF1010]" href={`/shop/${product.slug}`}>
                  {product.name} — {formatCurrency(product.priceAmount)}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </MotionSection>
  );
}

export function ShopChampionshipSection() {
  const products = shopProducts.filter((product) => product.category === "championship-collection").slice(0, 3);

  return (
    <MotionSection className="mt-20" id="championship-collection">
      <SectionHeading eyebrow="Premium Collection" title="Championship Collection" />
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
        {products.map((product) => (
          <ShopProductCard championship key={product.slug} product={product} />
        ))}
      </div>
    </MotionSection>
  );
}

export function ShopBundles() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCommerce();

  function addBundle(slugs: readonly string[]) {
    if (!user) {
      router.push("/login?next=/shop");
      return;
    }
    slugs.forEach((slug, index) => {
      addToCart(slug, 1, { openDrawer: index === slugs.length - 1 });
    });
  }

  return (
    <MotionSection className="mt-20" id="bundles">
      <SectionHeading eyebrow="Complete The Setup" title="Competitor Bundles" />
      <div className="grid gap-8 lg:grid-cols-3">
        {shopBundles.map((bundle) => {
          const items = bundle.slugs.map((slug) => getShopProduct(slug)).filter(Boolean);
          return (
            <div className="flex flex-col border-t border-white/[0.06] pt-6" key={bundle.id}>
              <p className="text-[0.62rem] font-medium uppercase tracking-[0.16em] text-[#FF1010]">
                Save {formatCurrency(bundle.savings)}
              </p>
              <h3 className="font-display mt-2 text-2xl font-normal uppercase text-white">{bundle.name}</h3>
              <ul className="mt-4 flex-1 space-y-2">
                {items.map((item) => (
                  <li className="text-sm text-zinc-400" key={item!.slug}>
                    {item!.name}
                  </li>
                ))}
              </ul>
              <p className="mt-5 font-display text-3xl text-white">{formatCurrency(bundle.price)}</p>
              <button
                className="mt-4 inline-flex min-h-11 w-fit items-center justify-center rounded-full bg-[#FF1010] px-6 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#ff2828]"
                onClick={() => addBundle(bundle.slugs)}
                type="button"
              >
                Add Bundle
              </button>
            </div>
          );
        })}
      </div>
    </MotionSection>
  );
}

export function ShopNewArrivals() {
  const products = newArrivalSlugs.map((slug) => getShopProduct(slug)).filter(Boolean).slice(0, 4);

  return (
    <MotionSection className="mt-20" id="new-arrivals">
      <SectionHeading eyebrow="Just Dropped" title="New Arrivals" />
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {products.map((product) => (
          <ShopProductCard key={product!.slug} product={product!} />
        ))}
      </div>
    </MotionSection>
  );
}

export function ShopMembershipSection() {
  return (
    <MotionSection className="mt-20 pb-4">
      <SectionDivider />
      <div className="mt-20">
        <SectionHeading eyebrow="Member Advantage" title="JTGC Member Benefits" />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {memberBenefits.map((benefit) => (
            <li className="flex items-center gap-3 text-base text-zinc-300" key={benefit}>
              <Check className="shrink-0 text-[#FF1010]" size={16} aria-hidden />
              {benefit}
            </li>
          ))}
        </ul>
        <Link
          className="mt-8 inline-flex min-h-11 items-center rounded-full bg-white/[0.06] px-6 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-white/10"
          href="/login?mode=register&next=/shop"
        >
          Become A Member
          <ArrowRight className="ml-2" size={14} aria-hidden />
        </Link>
      </div>
    </MotionSection>
  );
}

/** @deprecated Use ShopProductCard — kept for catalog compatibility */
export function PremiumProductCard({
  product,
  championship = false,
}: {
  product: NonNullable<ReturnType<typeof getShopProduct>>;
  large?: boolean;
  championship?: boolean;
}) {
  return <ShopProductCard championship={championship} product={product} />;
}
