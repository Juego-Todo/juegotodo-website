"use client";

import { ArrowRight } from "lucide-react";
import { seminarTopics, type ScheduledSeminar } from "@/data/seminars";

export function SeminarRegistrationPanel({ seminar }: { seminar: ScheduledSeminar }) {
  return (
    <form className="glass-panel rounded-[1.75rem] p-5 sm:p-6" id="register">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">Seminar Registration</p>
      <h2 className="font-display mt-2 text-4xl uppercase text-white">Reserve Your Spot</h2>
      <p className="mt-3 text-sm leading-6 text-zinc-400">
        {seminar.pricing.type === "free"
          ? "This is a free Juego Todo onboarding session. Registration confirms your seat and rules briefing materials."
          : "This is a paid rules-focused seminar. Submit your registration interest and the JT team will confirm payment steps."}
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
        <input
          aria-label="Phone number"
          className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-red-500/40 transition placeholder:text-zinc-500 focus:ring-4"
          placeholder="Phone number"
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
          <option value="parent">Parent / guardian</option>
        </select>
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
            Topics For This Session
          </p>
          <div className="grid gap-2">
            {seminarTopics
              .filter((topic) => seminar.topicSlugs.includes(topic.slug))
              .map((topic) => (
                <label
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-zinc-300"
                  key={topic.slug}
                >
                  <input defaultChecked type="checkbox" />
                  {topic.name}
                </label>
              ))}
          </div>
        </div>
        <textarea
          aria-label="Additional notes"
          className="min-h-28 rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-red-500/40 transition placeholder:text-zinc-500 focus:ring-4"
          placeholder="Gym affiliation, athlete age division, or payment reference"
        />
      </div>

      <button
        className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-red-600 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-red-500"
        type="button"
      >
        {seminar.pricing.type === "free" ? "Register For Free Seminar" : `Register — ${seminar.pricing.amount}`}
        <ArrowRight className="ml-2" size={18} aria-hidden />
      </button>
    </form>
  );
}
