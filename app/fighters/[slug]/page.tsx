import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { FighterProfileView } from "@/components/FighterProfileView";
import { PageNavigation } from "@/components/PageNavigation";
import { PrevNextNav } from "@/components/PrevNextNav";
import { getEnrichedFighter, getAllFighterSlugs } from "@/lib/fighters/profile";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { getFighterNeighbors } from "@/lib/navigation/prev-next";
import { personJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/JsonLd";

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

  return buildPageMetadata({
    title: `${fighter.name} "${fighter.nickname}" — ${fighter.division}`,
    description: `${fighter.name} (${fighter.nickname}) is a ${fighter.division} Juego Todo fighter from ${fighter.gym}. Record ${fighter.record}. ${fighter.highlight}`,
    path: `/fighters/${slug}`,
    type: "profile",
    keywords: [fighter.name, fighter.nickname, fighter.division, fighter.style, "LATAYANOLOGY"],
  });
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
      <JsonLd
        data={personJsonLd({
          name: fighter.name,
          description: fighter.highlight,
          url: `/fighters/${slug}`,
          jobTitle: `${fighter.division} Fighter`,
          affiliation: fighter.gym,
          nationality: fighter.country,
        })}
      />
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
