"use client";

import { CalendarDays, Clock3, MapPin, Radio, Ticket, Trophy } from "lucide-react";
import Link from "next/link";
import { CountdownTimer } from "@/components/CountdownTimer";
import { EventCardBackdrop } from "@/components/EventCardBackdrop";
import { SeeCalendarButton } from "@/components/SeeCalendarButton";
import { barrioBrawlsEvent } from "@/data/shop-tickets";
import { events } from "@/data/site";

function EventMeta({
  dateLabel,
  timeLabel,
  venue,
}: {
  dateLabel: string;
  timeLabel: string;
  venue: string;
}) {
  return (
    <div className="mt-4 space-y-2 text-sm text-zinc-300">
      <p className="flex items-start gap-2">
        <CalendarDays className="mt-0.5 shrink-0 text-[#FF1010]" size={14} aria-hidden />
        <span>{dateLabel}</span>
      </p>
      <p className="flex items-start gap-2">
        <Clock3 className="mt-0.5 shrink-0 text-[#FF1010]" size={14} aria-hidden />
        <span>{timeLabel}</span>
      </p>
      <p className="flex items-start gap-2">
        <MapPin className="mt-0.5 shrink-0 text-[#FF1010]" size={14} aria-hidden />
        <span>{venue}</span>
      </p>
    </div>
  );
}

export function EventCardsSection() {
  return (
    <section className="py-16 sm:py-20" id="events">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.32em] text-[#FF1010]">Fight Calendar</p>
            <h2 className="font-display mt-3 text-5xl uppercase leading-none text-white sm:text-7xl">
              Championship Events
            </h2>
          </div>
          <SeeCalendarButton label="View Full Calendar" variant="hero" />
        </div>

        <div
          className={`mt-10 grid gap-5 ${events.length === 1 ? "max-w-xl" : "lg:grid-cols-3"}`}
        >
          {events.map((event) => {
            const isBarrioBrawls = event.slug === "barrio-brawls";
            const title = isBarrioBrawls
              ? barrioBrawlsEvent.title
              : event.title.replace("Juego Todo: ", "");
            const eyebrow = isBarrioBrawls
              ? `${barrioBrawlsEvent.series} × Juego Todo`
              : null;
            const dateLabel = isBarrioBrawls
              ? barrioBrawlsEvent.dateLabel
              : new Date(event.date).toLocaleDateString("en-PH", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  timeZone: "Asia/Manila",
                });
            const timeLabel = isBarrioBrawls
              ? barrioBrawlsEvent.timeLabel
              : new Date(event.date).toLocaleTimeString("en-PH", {
                  hour: "numeric",
                  minute: "2-digit",
                  timeZone: "Asia/Manila",
                });
            const bouts = isBarrioBrawls
              ? barrioBrawlsEvent.fightCard.map(
                  (bout) => `${bout.matchup} — ${bout.note ? `${bout.note} · ` : ""}${bout.division}`,
                )
              : event.bouts;

            return (
              <article
                className="card-3d glass-panel animated-border group overflow-hidden rounded-[1.75rem] border-white/[0.08] bg-[#0D0D0D]/75"
                key={event.slug}
              >
                <EventCardBackdrop
                  alt={`${event.title} official event poster`}
                  className="aspect-[3/4] w-full"
                  imageClassName="object-cover object-top"
                  imageSrc={event.imageSrc}
                  sizes="(max-width: 768px) 100vw, 420px"
                />

                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.18em] text-zinc-200">
                      {event.status}
                    </span>
                    {event.isChampionship ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.16em] text-yellow-200">
                        <Trophy size={12} aria-hidden />
                        Title Fight
                      </span>
                    ) : null}
                    {event.isLive ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#FF1010]/35 bg-[#FF1010]/15 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.16em] text-red-100">
                        <Radio size={12} aria-hidden />
                        Live Broadcast
                      </span>
                    ) : null}
                  </div>

                  {eyebrow ? (
                    <p className="mt-4 text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#FF1010]">
                      {eyebrow}
                    </p>
                  ) : null}
                  <h3 className="font-display mt-2 text-3xl uppercase leading-none text-white sm:text-4xl">
                    {title}
                  </h3>
                  <EventMeta dateLabel={dateLabel} timeLabel={timeLabel} venue={event.venue} />

                  <ul className="mt-4 space-y-2 text-sm text-zinc-400">
                    {bouts.slice(0, 4).map((bout) => (
                      <li className="border-t border-white/[0.08] pt-2" key={bout}>
                        {bout}
                      </li>
                    ))}
                  </ul>

                  {event.status === "Upcoming" ? (
                    <div className="mt-5 rounded-2xl border border-white/[0.08] bg-black/35 p-3">
                      <CountdownTimer target={event.date} />
                    </div>
                  ) : null}

                  <div className="mt-5 flex gap-3">
                    {event.ticketCheckoutUrl ? (
                      <a
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#FF1010] px-4 py-3 text-[0.65rem] font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#ff2828]"
                        href={event.ticketCheckoutUrl}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <Ticket size={14} aria-hidden />
                        Buy Tickets
                      </a>
                    ) : (
                      <Link
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#FF1010] px-4 py-3 text-[0.65rem] font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#ff2828]"
                        href={
                          event.ticketProductSlug
                            ? `/shop/${event.ticketProductSlug}`
                            : `/events/${event.slug}`
                        }
                      >
                        <Ticket size={14} aria-hidden />
                        Tickets
                      </Link>
                    )}
                    <Link
                      className="inline-flex flex-1 items-center justify-center rounded-full border border-white/[0.08] px-4 py-3 text-[0.65rem] font-black uppercase tracking-[0.16em] text-zinc-300 transition hover:bg-white/5"
                      href={`/events/${event.slug}`}
                    >
                      Fight Card
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
