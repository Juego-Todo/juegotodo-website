"use client";

import { ArrowRight, CalendarDays, Radio, Ticket, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { CountdownTimer } from "@/components/CountdownTimer";
import { EventCardBackdrop } from "@/components/EventCardBackdrop";
import { MotionSection } from "@/components/MotionSection";
import { PageNavigation } from "@/components/PageNavigation";
import { events, type Event } from "@/data/site";
import { useAuth } from "@/lib/auth/context";

function formatEventDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  }).format(new Date(iso));
}

function sortEvents(items: Event[]) {
  const upcoming = items
    .filter((event) => event.status === "Upcoming")
    .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());
  const past = items
    .filter((event) => event.status === "Results")
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());

  return { upcoming, past };
}

function EventCalendarCard({ event }: { event: Event }) {
  const eventTitle = event.title.replace("Juego Todo: ", "");

  return (
    <article className="card-3d glass-panel overflow-hidden rounded-[1.75rem] border-white/[0.08] bg-[#0D0D0D]/75">
      <EventCardBackdrop className="min-h-52 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.18em]">
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
        <h2 className="font-display mt-12 text-4xl uppercase leading-none text-white sm:text-5xl">
          {eventTitle}
        </h2>
        <p className="mt-2 text-sm font-semibold text-zinc-200">{event.venue}</p>
      </EventCardBackdrop>

      <div className="space-y-5 p-5 sm:p-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FF1010]">{event.city}</p>
          <p className="mt-2 text-sm text-zinc-400">{formatEventDate(event.date)}</p>
          <p className="mt-3 text-sm font-bold uppercase tracking-[0.16em] text-zinc-200">{event.mainEvent}</p>
        </div>

        <ul className="space-y-2 text-sm text-zinc-400">
          {event.bouts.slice(0, 3).map((bout) => (
            <li className="border-t border-white/[0.08] pt-2" key={bout}>
              {bout}
            </li>
          ))}
        </ul>

        {event.status === "Upcoming" ? (
          <div className="rounded-2xl border border-white/[0.08] bg-black/35 p-3">
            <CountdownTimer target={event.date} />
          </div>
        ) : null}

        <div className="flex gap-3">
          <Link
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#FF1010] px-4 py-3 text-[0.65rem] font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#ff2828]"
            href={`/events/${event.slug}`}
          >
            <Ticket size={14} aria-hidden />
            Event Details
          </Link>
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
}

export function CalendarPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { upcoming, past } = useMemo(() => sortEvents(events), []);
  const nextEvent = upcoming[0];

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent("/calendar")}`);
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4 pt-24">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-zinc-400">Loading calendar...</p>
      </main>
    );
  }

  return (
    <main className="overflow-hidden px-4 pb-14 pt-24 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8">
      <section className="relative mx-auto max-w-7xl py-10 sm:py-14 lg:py-16">
        <div className="cinematic-grid absolute inset-0 opacity-30" aria-hidden />
        <div className="relative max-w-5xl">
          <PageNavigation currentLabel="Official Calendar" />
          <p className="text-xs font-black uppercase tracking-[0.32em] text-[#FF1010]">Juego Todo</p>
          <h1 className="font-display mt-3 text-[clamp(3.25rem,15vw,5.35rem)] uppercase leading-[0.9] text-white sm:text-7xl lg:text-8xl">
            Official Calendar
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-300 sm:mt-7 sm:text-xl sm:leading-8">
            Your member view of every sanctioned Juego Todo card — upcoming fight weeks, countdowns,
            venues, and archived results in one official calendar.
          </p>
        </div>
      </section>

      {nextEvent ? (
        <MotionSection className="mx-auto max-w-7xl pb-10 sm:pb-12">
          <div className="glass-panel overflow-hidden rounded-[2rem] border border-[#FF1010]/20 bg-[#0D0D0D]/80">
            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-red-200">
                  <CalendarDays size={14} aria-hidden />
                  Next On The Calendar
                </p>
                <h2 className="font-display mt-4 text-5xl uppercase leading-none text-white sm:text-6xl">
                  {nextEvent.title.replace("Juego Todo: ", "")}
                </h2>
                <p className="mt-4 text-sm text-zinc-300 sm:text-base">{formatEventDate(nextEvent.date)}</p>
                <p className="mt-2 text-sm font-semibold text-zinc-400">
                  {nextEvent.venue} · {nextEvent.city}
                </p>
                <Link
                  className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[#FF1010] px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#ff2828] sm:text-sm"
                  href={`/events/${nextEvent.slug}`}
                >
                  View Event
                  <ArrowRight className="ml-2" size={16} aria-hidden />
                </Link>
              </div>
              <div className="rounded-[1.5rem] border border-white/[0.08] bg-black/35 p-4 sm:p-5">
                <CountdownTimer target={nextEvent.date} />
              </div>
            </div>
          </div>
        </MotionSection>
      ) : null}

      <MotionSection className="mx-auto max-w-7xl space-y-8 pb-10 sm:pb-12">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#FF1010]">Upcoming</p>
          <h2 className="font-display mt-3 text-4xl uppercase text-white sm:text-5xl">Scheduled Events</h2>
        </div>
        {upcoming.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-3">
            {upcoming.map((event) => (
              <EventCalendarCard event={event} key={event.slug} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-400">No upcoming events are scheduled right now.</p>
        )}
      </MotionSection>

      {past.length > 0 ? (
        <MotionSection className="mx-auto max-w-7xl space-y-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-zinc-500">Archive</p>
            <h2 className="font-display mt-3 text-4xl uppercase text-white sm:text-5xl">Past Results</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {past.map((event) => (
              <EventCalendarCard event={event} key={event.slug} />
            ))}
          </div>
        </MotionSection>
      ) : null}
    </main>
  );
}
