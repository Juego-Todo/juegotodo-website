"use client";

import { ArrowRight, CalendarDays, LayoutGrid, List, Radio, Settings2, Ticket, Trophy } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CountdownTimer } from "@/components/CountdownTimer";
import { EventCardBackdrop } from "@/components/EventCardBackdrop";
import { MotionSection } from "@/components/MotionSection";
import { PageNavigation } from "@/components/PageNavigation";
import {
  calendarEntryKindLabels,
  type CalendarEntry,
} from "@/data/calendar-entries";
import { useAuth } from "@/lib/auth/context";
import { isAdminProfile } from "@/lib/commerce/storage";
import { getAllCalendarEntries, splitCalendarEntries } from "@/lib/calendar/storage";

type CalendarViewMode = "grid" | "linear";

const CALENDAR_VIEW_KEY = "juego-todo.calendar.view";

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

function formatShortDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Manila",
  }).format(new Date(iso));
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  }).format(new Date(iso));
}

function EntryBadges({ entry }: { entry: CalendarEntry }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.18em]">
        {calendarEntryKindLabels[entry.kind]}
      </span>
      <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.18em]">
        {entry.status}
      </span>
      {entry.isChampionship ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.16em] text-yellow-200">
          <Trophy size={12} aria-hidden />
          Title Fight
        </span>
      ) : null}
      {entry.isLive ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-[#FF1010]/35 bg-[#FF1010]/15 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.16em] text-red-100">
          <Radio size={12} aria-hidden />
          Live Broadcast
        </span>
      ) : null}
    </div>
  );
}

function CalendarViewToggle({
  view,
  onChange,
}: {
  view: CalendarViewMode;
  onChange: (view: CalendarViewMode) => void;
}) {
  return (
    <div
      aria-label="Calendar view mode"
      className="inline-flex rounded-full border border-white/10 bg-black/35 p-1"
      role="tablist"
    >
      <button
        aria-selected={view === "grid"}
        className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-[0.62rem] font-black uppercase tracking-[0.14em] transition ${
          view === "grid"
            ? "bg-[#FF1010] text-white"
            : "text-zinc-400 hover:text-white"
        }`}
        onClick={() => onChange("grid")}
        role="tab"
        type="button"
      >
        <LayoutGrid size={14} />
        Grid
      </button>
      <button
        aria-selected={view === "linear"}
        className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-[0.62rem] font-black uppercase tracking-[0.14em] transition ${
          view === "linear"
            ? "bg-[#FF1010] text-white"
            : "text-zinc-400 hover:text-white"
        }`}
        onClick={() => onChange("linear")}
        role="tab"
        type="button"
      >
        <List size={14} />
        Linear
      </button>
    </div>
  );
}

function CalendarEntryCard({ entry }: { entry: CalendarEntry }) {
  const eventTitle = entry.title.replace("Juego Todo: ", "");
  const hasEventPage = entry.source === "static" && entry.kind === "event";

  return (
    <article className="card-3d glass-panel overflow-hidden rounded-[1.75rem] border-white/[0.08] bg-[#0D0D0D]/75">
      <EventCardBackdrop className="min-h-52 p-5">
        <EntryBadges entry={entry} />
        <h2 className="font-display mt-12 text-4xl uppercase leading-none text-white sm:text-5xl">
          {eventTitle}
        </h2>
        <p className="mt-2 text-sm font-semibold text-zinc-200">{entry.venue}</p>
      </EventCardBackdrop>

      <div className="space-y-5 p-5 sm:p-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FF1010]">{entry.city}</p>
          <p className="mt-2 text-sm text-zinc-400">{formatEventDate(entry.date)}</p>
          <p className="mt-3 text-sm font-bold uppercase tracking-[0.16em] text-zinc-200">
            {entry.mainEvent || entry.summary}
          </p>
          {entry.kind === "competition" && entry.registrationDeadline ? (
            <p className="mt-2 text-xs text-amber-200">
              Registration closes {formatEventDate(entry.registrationDeadline)}
            </p>
          ) : null}
        </div>

        {entry.kind === "event" && entry.bouts.length > 0 ? (
          <ul className="space-y-2 text-sm text-zinc-400">
            {entry.bouts.slice(0, 3).map((bout) => (
              <li className="border-t border-white/[0.08] pt-2" key={bout}>
                {bout}
              </li>
            ))}
          </ul>
        ) : null}

        {entry.kind === "competition" && entry.divisions.length > 0 ? (
          <ul className="space-y-2 text-sm text-zinc-400">
            {entry.divisions.slice(0, 4).map((division) => (
              <li className="border-t border-white/[0.08] pt-2" key={division}>
                {division}
              </li>
            ))}
          </ul>
        ) : null}

        {entry.status === "Upcoming" ? (
          <div className="rounded-2xl border border-white/[0.08] bg-black/35 p-3">
            <CountdownTimer target={entry.date} />
          </div>
        ) : null}

        <div className="flex gap-3">
          {hasEventPage ? (
            <>
              <Link
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#FF1010] px-4 py-3 text-[0.65rem] font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#ff2828]"
                href={`/events/${entry.slug}`}
              >
                <Ticket size={14} aria-hidden />
                Event Details
              </Link>
              <Link
                className="inline-flex flex-1 items-center justify-center rounded-full border border-white/[0.08] px-4 py-3 text-[0.65rem] font-black uppercase tracking-[0.16em] text-zinc-300 transition hover:bg-white/5"
                href={`/events/${entry.slug}`}
              >
                Fight Card
              </Link>
            </>
          ) : (
            <div className="rounded-2xl border border-white/[0.08] bg-black/30 px-4 py-3 text-sm leading-6 text-zinc-300">
              {entry.summary || "Official Juego Todo calendar entry."}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function CalendarEntryLinearRow({ entry }: { entry: CalendarEntry }) {
  const eventTitle = entry.title.replace("Juego Todo: ", "");
  const hasEventPage = entry.source === "static" && entry.kind === "event";
  const detailItems =
    entry.kind === "event"
      ? entry.bouts.slice(0, 2)
      : entry.divisions.slice(0, 2);

  return (
    <article className="glass-panel rounded-[1.25rem] border-white/[0.08] bg-[#0D0D0D]/75 p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 gap-4 sm:gap-5">
          <div className="hidden shrink-0 border-r border-white/10 pr-4 text-center sm:block sm:min-w-[5.5rem]">
            <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-[#FF1010]">
              {formatShortDate(entry.date)}
            </p>
            <p className="mt-1 text-xs text-zinc-500">{formatTime(entry.date)}</p>
          </div>

          <div className="min-w-0 flex-1">
            <EntryBadges entry={entry} />
            <h2 className="font-display mt-3 text-2xl uppercase leading-none text-white sm:text-3xl">
              {eventTitle}
            </h2>
            <p className="mt-2 text-sm text-zinc-400 sm:hidden">
              {formatEventDate(entry.date)}
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              {entry.venue} · {entry.city}
            </p>
            <p className="mt-2 text-sm font-semibold text-zinc-200">
              {entry.mainEvent || entry.summary}
            </p>
            {entry.kind === "competition" && entry.registrationDeadline ? (
              <p className="mt-2 text-xs text-amber-200">
                Registration closes {formatEventDate(entry.registrationDeadline)}
              </p>
            ) : null}
            {detailItems.length > 0 ? (
              <ul className="mt-3 space-y-1 text-sm text-zinc-500">
                {detailItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-3 lg:w-[16rem]">
          {entry.status === "Upcoming" ? (
            <div className="rounded-2xl border border-white/[0.08] bg-black/35 p-3">
              <CountdownTimer target={entry.date} />
            </div>
          ) : null}

          {hasEventPage ? (
            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF1010] px-4 py-2.5 text-[0.62rem] font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#ff2828]"
                href={`/events/${entry.slug}`}
              >
                <Ticket size={14} aria-hidden />
                Event Details
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-full border border-white/[0.08] px-4 py-2.5 text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-300 transition hover:bg-white/5"
                href={`/events/${entry.slug}`}
              >
                Fight Card
              </Link>
            </div>
          ) : (
            <p className="rounded-2xl border border-white/[0.08] bg-black/30 px-4 py-3 text-sm leading-6 text-zinc-300">
              {entry.summary || "Official Juego Todo calendar entry."}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

function CalendarEntryList({
  entries,
  view,
}: {
  entries: CalendarEntry[];
  view: CalendarViewMode;
}) {
  if (entries.length === 0) {
    return null;
  }

  if (view === "linear") {
    return (
      <div className="space-y-3">
        {entries.map((entry) => (
          <CalendarEntryLinearRow entry={entry} key={entry.id} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {entries.map((entry) => (
        <CalendarEntryCard entry={entry} key={entry.id} />
      ))}
    </div>
  );
}

export function CalendarPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<CalendarEntry[]>(() => getAllCalendarEntries(false));
  const [view, setView] = useState<CalendarViewMode>(() => {
    if (typeof window === "undefined") {
      return "grid";
    }

    const saved = window.localStorage.getItem(CALENDAR_VIEW_KEY);
    return saved === "grid" || saved === "linear" ? saved : "grid";
  });

  function handleViewChange(nextView: CalendarViewMode) {
    setView(nextView);
    window.localStorage.setItem(CALENDAR_VIEW_KEY, nextView);
  }

  const { upcoming, past } = useMemo(() => splitCalendarEntries(entries), [entries]);
  const nextEntry = upcoming[0];
  const isAdmin = user ? isAdminProfile(user) : false;

  return (
    <main className="overflow-hidden px-4 pb-14 pt-24 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8">
      <section className="relative mx-auto max-w-7xl py-10 sm:py-14 lg:py-16">
        <div className="cinematic-grid absolute inset-0 opacity-30" aria-hidden />
        <div className="relative max-w-5xl">
          <PageNavigation currentLabel="Official Calendar" />
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.32em] text-[#FF1010]">Juego Todo</p>
              <h1 className="font-display mt-3 text-[clamp(3.25rem,15vw,5.35rem)] uppercase leading-[0.9] text-white sm:text-7xl lg:text-8xl">
                Official Calendar
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-300 sm:mt-7 sm:text-xl sm:leading-8">
                Every sanctioned Juego Todo event and competition — upcoming cards, registration windows,
                countdowns, and archived results in one official calendar.
              </p>
            </div>
            {isAdmin ? (
              <Link
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-zinc-200 transition hover:border-[#FF1010]/40 hover:text-white"
                href="/admin/calendar"
              >
                <Settings2 size={14} />
                Manage Calendar
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {nextEntry ? (
        <MotionSection className="mx-auto max-w-7xl pb-10 sm:pb-12">
          <div className="glass-panel overflow-hidden rounded-[2rem] border border-[#FF1010]/20 bg-[#0D0D0D]/80">
            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-red-200">
                  <CalendarDays size={14} aria-hidden />
                  Next On The Calendar
                </p>
                <p className="mt-3 text-[0.62rem] font-black uppercase tracking-[0.18em] text-zinc-400">
                  {calendarEntryKindLabels[nextEntry.kind]}
                </p>
                <h2 className="font-display mt-4 text-5xl uppercase leading-none text-white sm:text-6xl">
                  {nextEntry.title.replace("Juego Todo: ", "")}
                </h2>
                <p className="mt-4 text-sm text-zinc-300 sm:text-base">{formatEventDate(nextEntry.date)}</p>
                <p className="mt-2 text-sm font-semibold text-zinc-400">
                  {nextEntry.venue} · {nextEntry.city}
                </p>
                {nextEntry.source === "static" && nextEntry.kind === "event" ? (
                  <Link
                    className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[#FF1010] px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#ff2828] sm:text-sm"
                    href={`/events/${nextEntry.slug}`}
                  >
                    View Event
                    <ArrowRight className="ml-2" size={16} aria-hidden />
                  </Link>
                ) : null}
              </div>
              <div className="rounded-[1.5rem] border border-white/[0.08] bg-black/35 p-4 sm:p-5">
                <CountdownTimer target={nextEntry.date} />
              </div>
            </div>
          </div>
        </MotionSection>
      ) : null}

      <MotionSection className="mx-auto max-w-7xl space-y-8 pb-10 sm:pb-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#FF1010]">Upcoming</p>
            <h2 className="font-display mt-3 text-4xl uppercase text-white sm:text-5xl">Events & Competitions</h2>
          </div>
          <CalendarViewToggle onChange={handleViewChange} view={view} />
        </div>
        {upcoming.length > 0 ? (
          <CalendarEntryList entries={upcoming} view={view} />
        ) : (
          <p className="text-sm text-zinc-400">No upcoming events or competitions are scheduled right now.</p>
        )}
      </MotionSection>

      {past.length > 0 ? (
        <MotionSection className="mx-auto max-w-7xl space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-zinc-500">Archive</p>
              <h2 className="font-display mt-3 text-4xl uppercase text-white sm:text-5xl">Past Results</h2>
            </div>
            <CalendarViewToggle onChange={handleViewChange} view={view} />
          </div>
          <CalendarEntryList entries={past} view={view} />
        </MotionSection>
      ) : null}
    </main>
  );
}
