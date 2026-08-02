import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock3, MapPin } from "lucide-react";
import { SaveEntityButton } from "@/components/commerce/SaveEntityButton";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { CountdownTimer } from "@/components/CountdownTimer";
import { EventCardBackdrop } from "@/components/EventCardBackdrop";
import { JsonLd } from "@/components/JsonLd";
import { PageNavigation } from "@/components/PageNavigation";
import { PrevNextNav } from "@/components/PrevNextNav";
import { getShopProduct } from "@/data/shop";
import { barrioBrawlsEvent } from "@/data/shop-tickets";
import { events } from "@/data/site";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { getEventNeighbors } from "@/lib/navigation/prev-next";
import { eventJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = events.find((item) => item.slug === slug);

  if (!event) {
    return {};
  }

  const dateLabel = new Date(event.date).toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Manila",
  });

  return buildPageMetadata({
    title: `${event.title} Tickets & Fight Card`,
    description: `${event.mainEvent} on ${dateLabel} at ${event.venue}. Buy official Juego Todo tickets and view the fight card.`,
    path: `/events/${slug}`,
    image: event.imageSrc,
    imageAlt: event.title,
    keywords: [event.title, event.venue, "fight tickets", "Juego Todo event"],
  });
}

function formatEventDate(date: string) {
  return new Date(date).toLocaleDateString("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Manila",
  });
}

function formatEventTime(date: string) {
  return new Date(date).toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  });
}

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const event = events.find((item) => item.slug === slug);

  if (!event) {
    notFound();
  }

  const isBarrioBrawls = slug === "barrio-brawls";
  const eventTitle = isBarrioBrawls ? barrioBrawlsEvent.title : event.title.replace("Juego Todo: ", "");
  const eventEyebrow = isBarrioBrawls
    ? `${barrioBrawlsEvent.series} × Juego Todo`
    : event.city;
  const brandLine = isBarrioBrawls ? barrioBrawlsEvent.brandTitle : null;
  const dateLabel = isBarrioBrawls ? barrioBrawlsEvent.dateLabel : formatEventDate(event.date);
  const timeLabel = isBarrioBrawls ? barrioBrawlsEvent.timeLabel : formatEventTime(event.date);
  const fightCard = isBarrioBrawls
    ? barrioBrawlsEvent.fightCard
    : event.bouts.map((bout) => {
        const [matchup, rest] = bout.split(" — ");
        return {
          matchup: matchup?.trim() || bout,
          division: rest?.trim() || "Featured Bout",
          note: undefined as string | undefined,
        };
      });

  const breadcrumbs = resolveBreadcrumbs(`/events/${slug}`, event.title);
  const neighbors = getEventNeighbors(slug);
  const ticketProduct = event.ticketProductSlug ? getShopProduct(event.ticketProductSlug) : undefined;

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <JsonLd
        data={eventJsonLd({
          name: event.title,
          description: `${event.mainEvent} at ${event.venue}.`,
          startDate: event.date,
          venue: event.venue,
          city: event.city,
          image: event.imageSrc,
          url: `/events/${slug}`,
          ticketUrl: event.ticketCheckoutUrl ?? (event.ticketProductSlug ? `/shop/${event.ticketProductSlug}` : undefined),
          price: ticketProduct?.priceAmount,
          status: event.status,
        })}
      />
      <main className="px-4 pb-0 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        <div className="mx-auto max-w-7xl pb-4">
          <PageNavigation currentLabel={eventTitle} />
        </div>
        <section className="mx-auto grid max-w-7xl gap-8 pb-8 lg:grid-cols-[1.05fr_0.95fr]">
          <EventCardBackdrop
            alt={`${event.title} official event poster`}
            className="aspect-[3/4] w-full rounded-[1.5rem] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.46)] sm:rounded-[2rem]"
            imageClassName="object-cover object-top"
            imageSrc={event.imageSrc}
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="space-y-6">
            <div className="glass-panel rounded-[1.5rem] p-5 sm:rounded-[2rem] sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/20 bg-black/35 px-4 py-2 text-xs font-black uppercase tracking-[0.26em] text-white">
                  {event.status}
                </span>
                {event.isChampionship ? (
                  <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.16em] text-yellow-200">
                    Title Fight
                  </span>
                ) : null}
              </div>

              <p className="mt-5 text-[0.68rem] font-black uppercase tracking-[0.28em] text-[#FF1010]">
                {eventEyebrow}
              </p>
              {brandLine ? (
                <p className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-400">
                  {brandLine}
                </p>
              ) : null}
              <h1 className="font-display mt-2 text-[clamp(2.4rem,8vw,4rem)] uppercase leading-[0.92] text-white">
                {eventTitle}
              </h1>

              <dl className="mt-6 space-y-3 border-t border-white/10 pt-5">
                <div className="flex items-start gap-3 text-sm text-zinc-200">
                  <CalendarDays className="mt-0.5 shrink-0 text-[#FF1010]" size={16} aria-hidden />
                  <div>
                    <dt className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">Date</dt>
                    <dd className="mt-1 font-semibold text-white">{dateLabel}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm text-zinc-200">
                  <Clock3 className="mt-0.5 shrink-0 text-[#FF1010]" size={16} aria-hidden />
                  <div>
                    <dt className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">Time</dt>
                    <dd className="mt-1 font-semibold text-white">{timeLabel}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm text-zinc-200">
                  <MapPin className="mt-0.5 shrink-0 text-[#FF1010]" size={16} aria-hidden />
                  <div>
                    <dt className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">Venue</dt>
                    <dd className="mt-1 font-semibold text-white">{event.venue}</dd>
                    <dd className="mt-0.5 text-zinc-400">{event.city}</dd>
                  </div>
                </div>
              </dl>

              {event.status === "Upcoming" ? (
                <div className="mt-6">
                  <CountdownTimer target={event.date} />
                </div>
              ) : null}
            </div>

            <div className="glass-panel rounded-[1.5rem] p-5 sm:rounded-[2rem] sm:p-8">
              <h2 className="font-display text-4xl uppercase text-white sm:text-5xl">Fight Card</h2>
              <ul className="mt-6 divide-y divide-white/10">
                {fightCard.map((bout) => (
                  <li className="py-4" key={`${bout.matchup}-${bout.division}`}>
                    <div className="flex flex-wrap items-center gap-2">
                      {bout.note ? (
                        <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-2.5 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.14em] text-yellow-200">
                          {bout.note}
                        </span>
                      ) : null}
                      <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-[#FF1010]">
                        {bout.division}
                      </p>
                    </div>
                    <p className="mt-2 text-lg font-semibold uppercase tracking-wide text-white sm:text-xl">
                      {bout.matchup}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {event.ticketCheckoutUrl ? (
                  <a
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#FF1010] px-6 py-4 text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-[#ff2828]"
                    href={event.ticketCheckoutUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Buy Tickets
                  </a>
                ) : (
                  <Link
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#FF1010] px-6 py-4 text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-[#ff2828]"
                    href="/login?mode=register"
                  >
                    Register Interest
                  </Link>
                )}
                <SaveEntityButton slug={event.slug} type="event" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <PrevNextNav neighbors={neighbors} />
    </>
  );
}
