import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InteriorPage } from "@/components/InteriorPage";
import { pageContent, type PageSlug } from "@/data/site";

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

  return {
    title: content.title,
    description: content.intro,
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  if (!(slug in pageContent)) {
    notFound();
  }

  return <InteriorPage slug={slug as PageSlug} />;
}
