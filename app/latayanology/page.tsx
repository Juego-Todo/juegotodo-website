import type { Metadata } from "next";
import Link from "next/link";
import { FighterRecordCard } from "@/components/latayanology/FighterRecordCard";
import { FighterSearchForm } from "@/components/latayanology/FighterSearchForm";
import { formatCardDate } from "@/components/latayanology/format";
import { MotionSection } from "@/components/MotionSection";
import { PageNavigation } from "@/components/PageNavigation";
import { listPublicEvents, listPublicFighters } from "@/lib/fight-records/server";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "LATAYANOLOGY Fight Records",
  description: "Search official Juego Todo fight records, gyms, divisions, and event cards.",
  path: "/latayanology",
  keywords: ["LATAYANOLOGY", "fight records", "Juego Todo fighters"],
});

type PageProps = {
  searchParams: Promise<{
    q?: string;
    gym?: string;
    division?: string;
    category?: string;
    from?: string;
  }>;
};

function uniqueSorted(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

export default async function LatayanologyPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const gym = params.gym?.trim() ?? "";
  const division = params.division?.trim() ?? "";
  const category = params.category?.trim() ?? "";
  const fromProfile = params.from === "profile";
  const hasFilters = Boolean(q || gym || division || category);

  const [roster, filtered, events] = await Promise.all([
    listPublicFighters(),
    hasFilters ? listPublicFighters({ q, gym, division, category }) : Promise.resolve(null),
    listPublicEvents(),
  ]);
  const fighters = filtered ?? roster;
  const gyms = uniqueSorted(roster.map((fighter) => fighter.gym));
  const divisions = uniqueSorted(roster.map((fighter) => fighter.weightClass));

  return (
    <main className="px-4 pb-16 pt-24 sm:px-6 sm:pt-28 lg:px-8">
      <MotionSection className="mx-auto max-w-7xl space-y-8">
        <div>
          <PageNavigation
            backHref={fromProfile ? "/profile" : undefined}
            backLabel={fromProfile ? "Back to Profile" : undefined}
            categoryLabel="Latayanology"
            currentLabel="Fight Records"
          />
          <p className="mt-6 text-xs font-black uppercase tracking-[0.32em] text-[#FF1010]">Athlete Intelligence</p>
          <h1 className="font-display mt-3 text-5xl uppercase leading-none text-white sm:text-7xl">LATAYANOLOGY</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-400">
            Official fight records compiled from Juego Todo event cards. Search by athlete, gym, division, or category.
            Dates of birth stay off this page.
          </p>
        </div>

        <FighterSearchForm
          category={category}
          division={division}
          divisions={divisions}
          fromProfile={fromProfile}
          gym={gym}
          gyms={gyms}
          q={q}
        />

        <p className="text-sm text-zinc-400">
          {`${fighters.length} ${fighters.length === 1 ? "fighter" : "fighters"}${
            hasFilters ? ` matching this search, from ${roster.length} public records` : " with public records"
          }`}
        </p>

        {fighters.length === 0 ? (
          <div className="glass-panel rounded-[1.5rem] px-5 py-12 text-center text-sm leading-7 text-zinc-400">
            No public fight records match this search yet. Records appear here after an admin imports an event card.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {fighters.map((fighter) => (
              <FighterRecordCard fighter={fighter} key={fighter.id} />
            ))}
          </div>
        )}

        <section className="space-y-4">
          <div>
            <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-[#FF1010]">Event cards</p>
            <h2 className="font-display mt-2 text-4xl uppercase text-white">Where these records come from</h2>
          </div>
          {events.length === 0 ? (
            <div className="glass-panel rounded-[1.5rem] px-5 py-8 text-sm text-zinc-400">
              Imported event cards will be listed here.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {events.map((event) => (
                <Link
                  className="glass-panel rounded-[1.35rem] p-4 transition hover:border-[#FF1010]/30"
                  href={`/latayanology/events/${event.id}`}
                  key={event.id}
                >
                  <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">
                    {formatCardDate(event.eventDate)}
                    {event.series ? ` · ${event.series}` : ""}
                  </p>
                  <h3 className="mt-2 font-display text-3xl uppercase leading-none text-white">{event.name}</h3>
                  {event.venue ? <p className="mt-2 text-sm text-zinc-400">{event.venue}</p> : null}
                </Link>
              ))}
            </div>
          )}
        </section>
      </MotionSection>
    </main>
  );
}
