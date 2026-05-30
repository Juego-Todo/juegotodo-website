"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  GraduationCap,
  MapPin,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MotionSection } from "@/components/MotionSection";
import {
  groupSeminarsByMonth,
  scheduledSeminars,
  seminarPrograms,
  seminarTopics,
  type ScheduledSeminar,
} from "@/data/seminars";

type PricingFilter = "All" | "Free" | "Paid";

export function SeminarsHub() {
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [pricingFilter, setPricingFilter] = useState<PricingFilter>("All");
  const [selectedSeminar, setSelectedSeminar] = useState<string>(
    scheduledSeminars[0]?.slug ?? "",
  );

  const filteredSeminars = useMemo(() => {
    return scheduledSeminars.filter((seminar) => {
      const topicMatch =
        !activeTopic || seminar.topicSlugs.includes(activeTopic);
      const pricingMatch =
        pricingFilter === "All" ||
        (pricingFilter === "Free" && seminar.pricing.type === "free") ||
        (pricingFilter === "Paid" && seminar.pricing.type === "paid");

      return topicMatch && pricingMatch;
    });
  }, [activeTopic, pricingFilter]);

  const groupedSeminars = useMemo(
    () => groupSeminarsByMonth(filteredSeminars),
    [filteredSeminars],
  );

  const selected = scheduledSeminars.find((seminar) => seminar.slug === selectedSeminar);

  return (
    <div className="space-y-8 pb-14 sm:pb-20">
      <MotionSection className="mx-auto max-w-7xl">
        <div className="glass-panel overflow-hidden rounded-[1.75rem] border-red-500/20 p-6 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300 sm:text-sm">
            First Time On Juego Todo
          </p>
          <h2 className="font-display mt-3 max-w-4xl text-4xl uppercase leading-[0.92] text-white sm:text-6xl">
            Choose Your Starting Track
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base">
            New athletes, parents, and coaches can begin with focused seminar topics like
            Disarming, Striking, Legs, Grappling, and Rules Briefings — all mapped to official
            Juego Todo competition standards.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition ${
                activeTopic === null
                  ? "bg-red-600 text-white"
                  : "border border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white"
              }`}
              onClick={() => setActiveTopic(null)}
              type="button"
            >
              All Topics
            </button>
            {seminarTopics.map((topic) => (
              <button
                className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition ${
                  activeTopic === topic.slug
                    ? "bg-red-600 text-white"
                    : "border border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white"
                }`}
                key={topic.slug}
                onClick={() => setActiveTopic(topic.slug)}
                type="button"
              >
                {topic.name}
              </button>
            ))}
          </div>
        </div>
      </MotionSection>

      <MotionSection className="mx-auto max-w-7xl">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {seminarTopics.map((topic) => (
            <article
              className={`broadcast-line glass-panel rounded-[1.5rem] p-5 pt-7 transition ${
                activeTopic === topic.slug ? "border-red-500/40" : ""
              }`}
              key={topic.slug}
            >
              <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-red-300">
                {topic.audience}
              </p>
              <h3 className="font-display mt-3 text-3xl uppercase text-white">{topic.name}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{topic.description}</p>
              <p className="mt-4 text-xs leading-5 text-zinc-500">
                <span className="font-bold text-zinc-300">JT Rules:</span> {topic.rulesFocus}
              </p>
            </article>
          ))}
        </div>
      </MotionSection>

      <MotionSection className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300 sm:text-sm">
              Seminar Calendar
            </p>
            <h2 className="font-display mt-2 text-4xl uppercase text-white sm:text-5xl">
              Upcoming Sessions
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["All", "Free", "Paid"] as const).map((filter) => (
              <button
                className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition ${
                  pricingFilter === filter
                    ? "bg-red-600 text-white"
                    : "border border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white"
                }`}
                key={filter}
                onClick={() => setPricingFilter(filter)}
                type="button"
              >
                {filter} Seminars
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            {Object.entries(groupedSeminars).length > 0 ? (
              Object.entries(groupedSeminars).map(([month, seminars]) => (
                <section key={month}>
                  <h3 className="font-display text-3xl uppercase text-red-200">{month}</h3>
                  <div className="mt-4 space-y-4">
                    {seminars.map((seminar) => (
                      <SeminarCalendarCard
                        active={selectedSeminar === seminar.slug}
                        key={seminar.slug}
                        onSelect={() => setSelectedSeminar(seminar.slug)}
                        seminar={seminar}
                      />
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <div className="glass-panel rounded-[1.5rem] p-6 text-sm text-zinc-400">
                No seminars match this filter. Try another topic or pricing option.
              </div>
            )}
          </div>

          <div className="space-y-6">
            {selected ? (
              <>
                <div className="glass-panel rounded-[1.5rem] p-5 sm:p-6">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">
                    Selected Session
                  </p>
                  <h3 className="font-display mt-3 text-4xl uppercase leading-none text-white">
                    {selected.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-zinc-300">{selected.summary}</p>
                  <div className="mt-5 space-y-3 text-sm text-zinc-300">
                    <p className="flex items-center gap-2">
                      <CalendarDays className="shrink-0 text-red-400" size={16} aria-hidden />
                      {selected.time}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="shrink-0 text-red-400" size={16} aria-hidden />
                      {selected.venue}, {selected.city}
                    </p>
                    <p className="flex items-center gap-2">
                      <Users className="shrink-0 text-red-400" size={16} aria-hidden />
                      {selected.spotsLeft} spots left of {selected.capacity}
                    </p>
                  </div>
                  <Link
                    className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-red-600 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-red-500"
                    href={`/juego-todo-seminars/${selected.slug}`}
                  >
                    View & Register
                    <ArrowRight className="ml-2" size={16} aria-hidden />
                  </Link>
                </div>

                <SeminarRegistrationForm selectedSeminar={selected} />
              </>
            ) : null}
          </div>
        </div>
      </MotionSection>

      <MotionSection className="mx-auto max-w-7xl">
        <div className="grid gap-4 sm:grid-cols-2">
          {seminarPrograms.map((program) => (
            <article className="broadcast-line glass-panel rounded-[1.75rem] p-6 pt-8" key={program.title}>
              <div className="flex items-start justify-between gap-4">
                <GraduationCap className="shrink-0 text-red-400" aria-hidden />
                <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.18em] text-red-200">
                  {program.duration}
                </span>
              </div>
              <h2 className="font-display mt-6 text-4xl uppercase leading-none text-white">{program.title}</h2>
              <p className="mt-3 text-sm font-bold uppercase tracking-[0.18em] text-red-300">{program.focus}</p>
              <p className="mt-4 text-sm leading-7 text-zinc-400">{program.description}</p>
              <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">{program.level}</p>
            </article>
          ))}
        </div>
      </MotionSection>
    </div>
  );
}

function SeminarCalendarCard({
  seminar,
  active,
  onSelect,
}: {
  seminar: ScheduledSeminar;
  active: boolean;
  onSelect: () => void;
}) {
  const day = new Date(seminar.date).getDate();
  const weekday = new Intl.DateTimeFormat("en-PH", { weekday: "short" }).format(new Date(seminar.date));

  return (
    <motion.button
      className={`w-full overflow-hidden rounded-[1.5rem] border text-left transition ${
        active
          ? "border-red-500/50 bg-red-500/10"
          : "border-white/10 bg-white/[0.03] hover:border-red-500/30"
      }`}
      onClick={onSelect}
      type="button"
      whileTap={{ scale: 0.99 }}
    >
      <div className="grid grid-cols-[5.5rem_1fr]">
        <div className={`flex flex-col items-center justify-center bg-gradient-to-br ${seminar.tone} p-4`}>
          <span className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-red-100">{weekday}</span>
          <span className="font-display text-5xl leading-none text-white">{day}</span>
        </div>
        <div className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em] ${
                seminar.pricing.type === "free"
                  ? "bg-emerald-500/15 text-emerald-200"
                  : "bg-red-600/20 text-red-200"
              }`}
            >
              {seminar.pricing.type === "free" ? "Free" : seminar.pricing.amount}
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-300">
              {seminar.format}
            </span>
          </div>
          <h4 className="font-display mt-3 text-3xl uppercase leading-none text-white">{seminar.title}</h4>
          <p className="mt-2 text-sm text-zinc-400">{seminar.city} {"//"} {seminar.level}</p>
          <p className="mt-3 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-zinc-500">
            <Clock3 size={14} aria-hidden />
            {seminar.time}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

function SeminarRegistrationForm({ selectedSeminar }: { selectedSeminar: ScheduledSeminar }) {
  return (
    <form className="glass-panel rounded-[1.5rem] p-5 sm:p-6">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">Quick Registration</p>
      <h3 className="font-display mt-2 text-3xl uppercase text-white">Join This Seminar</h3>
      <p className="mt-3 text-sm leading-6 text-zinc-400">
        Register interest for{" "}
        <span className="font-semibold text-zinc-200">{selectedSeminar.title}</span>.{" "}
        {selectedSeminar.pricing.note}
      </p>

      <div className="mt-5 grid gap-3">
        <input
          aria-label="Full name"
          className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-red-500/40 transition placeholder:text-zinc-500 focus:ring-4"
          placeholder="Full name"
        />
        <input
          aria-label="Email address"
          className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-red-500/40 transition placeholder:text-zinc-500 focus:ring-4"
          placeholder="Email address"
        />
        <select
          aria-label="Experience level"
          className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-red-500/40 transition focus:ring-4"
          defaultValue=""
        >
          <option disabled value="">
            Experience level
          </option>
          <option value="first-timer">First timer on Juego Todo</option>
          <option value="fma-background">Some FMA / martial arts background</option>
          <option value="competitor">Active competitor</option>
          <option value="coach">Coach / gym leader</option>
        </select>
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
            Topics You Want To Focus On
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {seminarTopics.map((topic) => (
              <label
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-zinc-300"
                key={topic.slug}
              >
                <input defaultChecked={selectedSeminar.topicSlugs.includes(topic.slug)} type="checkbox" />
                {topic.name}
              </label>
            ))}
          </div>
        </div>
        <textarea
          aria-label="Additional notes"
          className="min-h-28 rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-red-500/40 transition placeholder:text-zinc-500 focus:ring-4"
          placeholder="Gym affiliation, parent/guardian name, or special requests"
        />
      </div>

      <button
        className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-red-600 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-red-500"
        type="button"
      >
        {selectedSeminar.pricing.type === "free" ? "Register For Free Session" : "Submit Paid Registration Interest"}
        <ArrowRight className="ml-2" size={18} aria-hidden />
      </button>
    </form>
  );
}
