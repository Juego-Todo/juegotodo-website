import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { FighterProfileView } from "@/components/FighterProfileView";
import { PageNavigation } from "@/components/PageNavigation";
import { PrevNextNav } from "@/components/PrevNextNav";
import { getEnrichedFighter, getAllFighterSlugs } from "@/lib/fighters/profile";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { getFighterNeighbors } from "@/lib/navigation/prev-next";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllFighterSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const fighter = getEnrichedFighter(slug);

  if (!fighter) {
    return {};
  }

  return {
    title: `${fighter.name} "${fighter.nickname}"`,
    description: fighter.highlight,
  };
}

export default async function FighterPage({ params }: PageProps) {
  const { slug } = await params;
  const fighter = getEnrichedFighter(slug);

  if (!fighter) {
    notFound();
  }

  const breadcrumbs = resolveBreadcrumbs(`/fighters/${slug}`, fighter.name);
  const neighbors = getFighterNeighbors(slug);

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <main className="px-4 pb-0 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        <div className="mx-auto max-w-7xl pb-4">
          <PageNavigation categoryLabel="Latayanology" currentLabel={fighter.name} />
        </div>
        <FighterProfileView fighter={fighter} />
      </main>
      <PrevNextNav neighbors={neighbors} />
    </>
  );
}
