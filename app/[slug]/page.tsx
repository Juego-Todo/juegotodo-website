import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InteriorPage } from "@/components/InteriorPage";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { pageContent, type PageSlug } from "@/data/site";
import { getLegalPage, isLegalPageSlug } from "@/data/legal-pages";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { hubSeo } from "@/lib/seo/hub-meta";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return Object.keys(pageContent).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = pageContent[slug as PageSlug];

  if (!content) {
    return {};
  }

  const seo = hubSeo[slug as PageSlug];
  const legalDescription = isLegalPageSlug(slug) ? getLegalPage(slug)?.metaDescription : undefined;

  return buildPageMetadata({
    title: seo?.title ?? content.title,
    description: seo?.description ?? legalDescription ?? content.intro,
    path: `/${slug}`,
    image: seo?.image,
    keywords: seo?.keywords,
  });
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  if (!(slug in pageContent)) {
    notFound();
  }

  return (
    <>
      <BreadcrumbJsonLd items={resolveBreadcrumbs(`/${slug}`)} />
      <InteriorPage slug={slug as PageSlug} />
    </>
  );
}
