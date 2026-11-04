import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BoutHistoryList } from "@/components/latayanology/BoutHistoryList";
import { ClaimFighterButton } from "@/components/latayanology/ClaimFighterButton";
import { FighterPortrait } from "@/components/latayanology/FighterPortrait";
import { formatRecord } from "@/components/latayanology/format";
import { JsonLd } from "@/components/JsonLd";
import { MotionSection } from "@/components/MotionSection";
import { PageNavigation } from "@/components/PageNavigation";
import { getPublicFighterBySlug } from "@/lib/fight-records/server";
import { personJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ invite?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const record = await getPublicFighterBySlug(slug);
  if (!record) return {};

  const { fighter } = record;
  const score = formatRecord(fighter.wins, fighter.losses, fighter.draws);
  const place = fighter.hometown ? ` from ${fighter.hometown}` : "";

  return buildPageMetadata({
    title: `${fighter.displayName}${fighter.nickname ? ` "${fighter.nickname}"` : ""}`,
    description: `${fighter.displayName} fight record ${score}${place}. ${fighter.gym || "Independent"} ${fighter.weightClass}.`.trim(),
    path: `/latayanology/fighters/${slug}`,
    type: "profile",
    keywords: [fighter.displayName, fighter.nickname, fighter.weightClass, "LATAYANOLOGY"].filter(Boolean),
  });
}

export default async function LatayanologyFighterPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const record = await getPublicFighterBySlug(slug);
  if (!record) notFound();

  const { fighter, history } = record;
  const score = formatRecord(fighter.wins, fighter.losses, fighter.draws);
  const description = `${fighter.displayName} official Juego Todo record ${score}.`;

  return (
    <main className="px-4 pb-16 pt-24 sm:px-6 sm:pt-28 lg:px-8">
      <JsonLd
        data={personJsonLd({
          name: fighter.displayName,
          description,
          url: `/latayanology/fighters/${slug}`,
          jobTitle: fighter.weightClass ? `${fighter.weightClass} Fighter` : "Fighter",
          affiliation: fighter.gym,
        })}
      />
      <MotionSection className="mx-auto max-w-7xl space-y-8">
        <PageNavigation categoryLabel="Latayanology" currentLabel={fighter.displayName} />
        <section className="glass-panel rounded-[1.75rem] p-5 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <FighterPortrait name={fighter.displayName} photoUrl={fighter.photoUrl} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#FF1010]">Record {score}</p>
              <h1 className="font-display mt-2 text-5xl uppercase leading-none text-white sm:text-7xl">
                {fighter.displayName}
              </h1>
              {fighter.nickname ? (
                <p className="mt-3 text-lg text-zinc-300">&ldquo;{fighter.nickname}&rdquo;</p>
              ) : null}
              <dl className="mt-6 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
                <div>
                  <dt className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">Gym</dt>
                  <dd className="mt-1">{fighter.gym || "Independent"}</dd>
                </div>
                <div>
                  <dt className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">Weight class</dt>
                  <dd className="mt-1">{fighter.weightClass || "Open"}</dd>
                </div>
                {fighter.height ? (
                  <div>
                    <dt className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">Height</dt>
                    <dd className="mt-1">{fighter.height}</dd>
                  </div>
                ) : null}
                {fighter.hometown ? (
                  <div>
                    <dt className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">Hometown</dt>
                    <dd className="mt-1">{fighter.hometown}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">Wins</dt>
                  <dd className="mt-1 font-display text-3xl text-white">{fighter.wins}</dd>
                </div>
                <div>
                  <dt className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">Losses / draws</dt>
                  <dd className="mt-1 font-display text-3xl text-white">
                    {fighter.losses}-{fighter.draws}
                  </dd>
                </div>
              </dl>
              {fighter.isMinor ? (
                <p className="mt-4 text-sm text-zinc-500">Youth athlete. Hometown stays private.</p>
              ) : null}
              {fighter.claimStatus === "unclaimed" ? (
                <div className="mt-6">
                  <ClaimFighterButton
                    fighterId={fighter.id}
                    fighterName={fighter.displayName}
                    inviteToken={query.invite}
                    isMinor={fighter.isMinor}
                    slug={fighter.slug}
                  />
                </div>
              ) : (
                <p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
                  {fighter.claimStatus === "claimed" ? "Claimed profile" : "Claim in review"}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-4xl uppercase text-white">Bout history</h2>
          <BoutHistoryList history={history} />
        </section>
      </MotionSection>
    </main>
  );
}
