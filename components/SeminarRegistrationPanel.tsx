"use client";

import { InquiryFormSubmit } from "@/components/forms/InquiryFormSubmit";
import { seminarTopics, type ScheduledSeminar } from "@/data/seminars";

export function SeminarRegistrationPanel({ seminar }: { seminar: ScheduledSeminar }) {
  return (
    <div className="glass-panel rounded-[1.75rem] p-5 sm:p-6" id="register">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">Seminar Registration</p>
      <h2 className="font-display mt-2 text-4xl uppercase text-white">Reserve Your Spot</h2>
      <p className="mt-3 text-sm leading-6 text-zinc-400">
        {seminar.pricing.type === "free"
          ? "This is a free Juego Todo onboarding session. Registration confirms your seat and rules briefing materials."
          : "This is a paid rules-focused seminar. Submit your registration interest and the JT team will confirm payment steps."}
      </p>

      <InquiryFormSubmit
        className="mt-5"
        inquiryType="seminar"
        metadata={{
          seminarSlug: seminar.slug,
          seminarTitle: seminar.title,
          pricing: seminar.pricing,
          topics: seminar.topicSlugs,
        }}
        subjectDefault={`Seminar registration — ${seminar.title}`}
        submitLabel={
          seminar.pricing.type === "free" ? "Register For Free Seminar" : `Register — ${seminar.pricing.amount}`
        }
      >
        <div className="mb-4">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-400">Topics For This Session</p>
          <div className="grid gap-2">
            {seminarTopics
              .filter((topic) => seminar.topicSlugs.includes(topic.slug))
              .map((topic) => (
                <div
                  className="rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-zinc-300"
                  key={topic.slug}
                >
                  {topic.name}
                </div>
              ))}
          </div>
        </div>
      </InquiryFormSubmit>
    </div>
  );
}
