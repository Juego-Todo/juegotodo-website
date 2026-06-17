import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Trophy } from "lucide-react";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { PageNavigation } from "@/components/PageNavigation";
import { TeamSaveButton } from "@/components/TeamsHub";
import { getTeam, teams } from "@/data/teams";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { getTeamNeighbors } from "@/lib/navigation/prev-next";
import { PrevNextNav } from "@/components/PrevNextNav";
import { teamCategoryLabels } from "@/data/teams";

type PageProps = {
  params: Promise<{ teamSlug: string }>;
};

export function generateStaticParams() {
  return teams.map((team) => ({ teamSlug: team.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { teamSlug } = await params;
  const team = getTeam(teamSlug);
  if (!team) return {};
  return { title: team.name, description: team.summary };
}

export default async function TeamProfilePage({ params }: PageProps) {
  const { teamSlug } = await params;
  const team = getTeam(teamSlug);
  if (!team) notFound();

  const breadcrumbs = resolveBreadcrumbs(`/teams/${teamSlug}`, team.name);
  const neighbors = getTeamNeighbors(teamSlug);

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <main className="px-4 pb-0 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        <div className="mx-auto max-w-7xl pb-4">
          <PageNavigation currentLabel={team.name} />
        </div>

        <section className="mx-auto max-w-7xl pb-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className={`glass-panel overflow-hidden rounded-[1.75rem] bg-gradient-to-br ${team.tone} p-6 sm:p-8`}>
              <div className="flex h-24 w-24 items-center justify-center rounded-[1.5rem] border border-white/15 bg-black/35 text-3xl font-black text-white">
                {team.logoInitials}
              </div>
              <p className="mt-8 text-xs font-black uppercase tracking-[0.24em] text-red-200">
                {teamCategoryLabels[team.category]}
              </p>
              <h1 className="font-display mt-3 text-5xl uppercase leading-none text-white sm:text-7xl">{team.name}</h1>
              <p className="mt-4 text-sm text-zinc-200">{team.region}</p>
            </div>

            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Head Coach", team.headCoach],
                  ["Team Record", team.record],
                  ["Fighters", `${team.fighterCount}`],
                  ["Championships", `${team.championships}`],
                ].map(([label, value]) => (
                  <div className="glass-panel rounded-2xl p-4" key={label}>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-red-300">{label}</p>
                    <p className="mt-2 font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
              <p className="text-base leading-8 text-zinc-300">{team.summary}</p>
              <TeamSaveButton teamSlug={team.slug} />
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <section className="glass-panel rounded-[1.5rem] p-5 sm:p-6">
              <h2 className="font-display text-3xl uppercase text-white sm:text-4xl">Fighter Roster</h2>
              {team.roster.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-400">Roster updates coming soon.</p>
              ) : (
                <ul className="mt-5 space-y-3">
                  {team.roster.map((fighter) => (
                    <li className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3" key={fighter.slug}>
                      <Link className="font-semibold text-white hover:text-red-200" href={`/fighters/${fighter.slug}`}>
                        {fighter.name}
                      </Link>
                      <p className="mt-1 text-sm text-zinc-400">
                        {fighter.division} • {fighter.record}
                        {fighter.rank ? ` • ${fighter.rank}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="glass-panel rounded-[1.5rem] p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <Trophy className="text-red-300" size={18} aria-hidden />
                <h2 className="font-display text-3xl uppercase text-white sm:text-4xl">Recent Results</h2>
              </div>
              {team.recentResults.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-400">No recent team results logged.</p>
              ) : (
                <ul className="mt-5 space-y-3">
                  {team.recentResults.map((result) => (
                    <li className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3" key={`${result.event}-${result.date}`}>
                      <p className={`text-xs font-black uppercase tracking-[0.16em] ${result.result === "Win" ? "text-emerald-300" : result.result === "Loss" ? "text-red-300" : "text-zinc-400"}`}>
                        {result.result} vs {result.opponent}
                      </p>
                      <p className="mt-1 text-sm text-zinc-300">{result.event}</p>
                      <p className="text-xs text-zinc-500">{result.date}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <Link
            className="mt-8 inline-flex items-center text-sm font-black uppercase tracking-[0.18em] text-red-200"
            href="/teams"
          >
            Browse All Teams
            <ArrowRight className="ml-2" size={16} aria-hidden />
          </Link>
        </section>
      </main>
      <PrevNextNav neighbors={neighbors} />
    </>
  );
}
