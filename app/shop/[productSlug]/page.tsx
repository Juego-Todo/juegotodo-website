import { CheckCircle2, ShieldCheck, ShoppingBag } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductActions } from "@/components/commerce/ProductActions";
import { shopCategoryLabels } from "@/lib/commerce/types";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { PageNavigation } from "@/components/PageNavigation";
import { PrevNextNav } from "@/components/PrevNextNav";
import { getShopProduct, shopProducts } from "@/data/shop";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { getShopNeighbors } from "@/lib/navigation/prev-next";

type PageProps = {
  params: Promise<{ productSlug: string }>;
};

export function generateStaticParams() {
  return shopProducts.map((product) => ({ productSlug: product.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { productSlug } = await params;
  const product = getShopProduct(productSlug);

  if (!product) {
    return {};
  }

  return {
    title: product.name,
    description: product.summary,
  };
}

export default async function ShopProductPage({ params }: PageProps) {
  const { productSlug } = await params;
  const product = getShopProduct(productSlug);

  if (!product) {
    notFound();
  }

  const relatedProducts = shopProducts
    .filter((item) => item.category === product.category && item.slug !== product.slug)
    .slice(0, 3);
  const breadcrumbs = resolveBreadcrumbs(`/shop/${productSlug}`, product.name);
  const neighbors = getShopNeighbors(productSlug);

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <main className="px-4 pb-0 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        <div className="mx-auto max-w-7xl pb-4">
          <PageNavigation
            currentLabel={product.name}
          />
        </div>
      <section className="mx-auto max-w-7xl pb-8">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className={`glass-panel overflow-hidden rounded-[1.75rem] bg-gradient-to-br ${product.tone} p-6 sm:rounded-[2rem] sm:p-8`}>
            <div className="flex items-start justify-between gap-4">
              {product.badge ? (
                <span className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-white">
                  {product.badge}
                </span>
              ) : (
                <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-white">
                  {shopCategoryLabels[product.category]}
                </span>
              )}
              <ShoppingBag className="text-red-200" size={28} aria-hidden />
            </div>
            <h1 className="font-display mt-16 text-5xl uppercase leading-[0.92] text-white sm:mt-24 sm:text-7xl">
              {product.name}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-200 sm:text-base">
              {product.description}
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300 sm:text-sm">
                {shopCategoryLabels[product.category]}
              </p>
              <p className="font-display mt-4 text-6xl text-white">{product.price}</p>
              <p className="mt-5 text-base leading-8 text-zinc-300 sm:text-lg">{product.summary}</p>
            </div>

            <ProductActions product={product} />

            <Link
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/15 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-white/10 sm:w-auto"
              href="/contact"
            >
              Request Bulk Order
            </Link>

            <div className="glass-panel rounded-[1.5rem] p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-red-400" size={18} aria-hidden />
                <h2 className="font-display text-3xl uppercase text-white">Competition Use</h2>
              </div>
              <p className="mt-4 text-sm leading-7 text-zinc-300 sm:text-base">{product.competitionUse}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="glass-panel rounded-[1.5rem] p-5 sm:p-6">
            <h2 className="font-display text-3xl uppercase text-white sm:text-4xl">Key Features</h2>
            <ul className="mt-5 space-y-3">
              {product.features.map((feature) => (
                <li className="flex gap-3 text-sm leading-6 text-zinc-300 sm:text-base sm:leading-7" key={feature}>
                  <CheckCircle2 className="mt-0.5 shrink-0 text-red-400" size={18} aria-hidden />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="glass-panel rounded-[1.5rem] p-5 sm:p-6">
            <h2 className="font-display text-3xl uppercase text-white sm:text-4xl">Specifications</h2>
            <dl className="mt-5 space-y-3">
              {product.specs.map((spec) => (
                <div className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3" key={spec.label}>
                  <dt className="text-xs font-black uppercase tracking-[0.18em] text-red-300">{spec.label}</dt>
                  <dd className="mt-1 text-sm font-semibold text-white sm:text-base">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        {relatedProducts.length > 0 ? (
          <section className="mt-10">
            <h2 className="font-display text-4xl uppercase text-white sm:text-5xl">Related Gear</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((item) => (
                <Link
                  className="glass-panel group rounded-[1.5rem] p-5 transition hover:-translate-y-1 hover:border-red-500/40"
                  href={`/shop/${item.slug}`}
                  key={item.slug}
                >
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">{shopCategoryLabels[item.category]}</p>
                  <h3 className="font-display mt-3 text-3xl uppercase leading-none text-white">{item.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{item.description}</p>
                  <p className="mt-4 font-display text-2xl text-white">{item.price}</p>
                  <span className="mt-4 inline-flex items-center text-xs font-black uppercase tracking-[0.16em] text-red-200">
                    View Product
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </section>
      </main>
      <PrevNextNav neighbors={neighbors} />
    </>
  );
}
