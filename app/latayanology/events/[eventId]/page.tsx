import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventBoutList } from "@/components/latayanology/EventBoutList";
import { formatCardDate } from "@/components/latayanology/format";
import { MotionSection } from "@/components/MotionSection";
import { PageNavigation } from "@/components/PageNavigation";
import { getPublicEventById } from "@/lib/fight-records/server";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ eventId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { eventId } = await params;
  const card = await getPublicEventById(eventId);
  if (!card) return {};

  return buildPageMetadata({
    title: `${card.event.name} Fight Card`,
    description: `${card.event.name} on ${formatCardDate(card.event.eventDate)}${card.event.venue ? ` at ${card.event.venue}` : ""}. ${card.bouts.length} bouts.`,
    path: `/latayanology/events/${eventId}`,
    keywords: [card.event.name, card.event.series, "Juego Todo event card"].filter(Boolean),
  });
}

export default async function LatayanologyEventPage({ params }: PageProps) {
  const { eventId } = await params;
  const card = await getPublicEventById(eventId);
  if (!card) notFound();

  return (
    <main className="px-4 pb-16 pt-24 sm:px-6 sm:pt-28 lg:px-8">
      <MotionSection className="mx-auto max-w-7xl space-y-8">
        <PageNavigation categoryLabel="Latayanology" currentLabel={card.event.name} />
        <section className="glass-panel rounded-[1.75rem] p-5 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#FF1010]">
            {card.event.series || "Event card"}
          </p>
          <h1 className="font-display mt-3 text-5xl uppercase leading-none text-white sm:text-7xl">{card.event.name}</h1>
          <p className="mt-4 text-base text-zinc-300">
            {formatCardDate(card.event.eventDate)}
            {card.event.venue ? ` · ${card.event.venue}` : ""}
          </p>
          <p className="mt-2 text-sm text-zinc-500">{card.bouts.length} bouts</p>
        </section>
        <EventBoutList bouts={card.bouts} />
      </MotionSection>
    </main>
  );
}
