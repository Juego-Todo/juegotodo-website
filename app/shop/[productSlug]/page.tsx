import { ProductDetailClient } from "@/components/commerce/ProductDetailClient";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { PageNavigation } from "@/components/PageNavigation";
import { PrevNextNav } from "@/components/PrevNextNav";
import { getShopProduct, shopProducts } from "@/data/shop";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { getShopNeighbors } from "@/lib/navigation/prev-next";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

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

  const breadcrumbs = resolveBreadcrumbs(`/shop/${productSlug}`, product.name);
  const neighbors = getShopNeighbors(productSlug);

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <main className="px-4 pb-0 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        <div className="mx-auto max-w-7xl pb-4">
          <PageNavigation currentLabel={product.name} />
        </div>
        <ProductDetailClient product={product} />
      </main>
      <PrevNextNav neighbors={neighbors} />
    </>
  );
}
