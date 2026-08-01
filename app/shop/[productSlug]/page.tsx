import { LiveProductFallback } from "@/components/commerce/LiveProductFallback";
import { ProductDetailClient } from "@/components/commerce/ProductDetailClient";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { JsonLd } from "@/components/JsonLd";
import { PageNavigation } from "@/components/PageNavigation";
import { PrevNextNav } from "@/components/PrevNextNav";
import { getShopProduct, shopProducts } from "@/data/shop";
import { shopCategoryLabels } from "@/lib/commerce/types";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { getShopNeighbors } from "@/lib/navigation/prev-next";
import { productJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

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

  const title = product.eventTicket
    ? `${product.name} | Buy Official Tickets`
    : `${product.name} | Official Juego Todo Shop`;

  return buildPageMetadata({
    title,
    description: `${product.summary} Price ${product.price}.`,
    path: `/shop/${productSlug}`,
    image: product.imageSrc,
    imageAlt: product.name,
    keywords: [product.name, shopCategoryLabels[product.category], ...product.searchTags.slice(0, 6)],
  });
}

export default async function ShopProductPage({ params }: PageProps) {
  const { productSlug } = await params;
  const product = getShopProduct(productSlug);

  if (!product) {
    // Admin-created products only exist in the live catalog (client-side).
    return (
      <main className="px-4 pb-0 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        <LiveProductFallback slug={productSlug} />
      </main>
    );
  }

  const breadcrumbs = resolveBreadcrumbs(`/shop/${productSlug}`, product.name);
  const neighbors = getShopNeighbors(productSlug);

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <JsonLd
        data={productJsonLd({
          name: product.name,
          description: product.summary,
          image: product.imageSrc,
          url: `/shop/${productSlug}`,
          sku: product.slug,
          price: product.priceAmount,
          availability: product.stock > 0 ? "InStock" : "OutOfStock",
          category: shopCategoryLabels[product.category],
        })}
      />
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
