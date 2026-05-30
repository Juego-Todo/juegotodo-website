"use client";

import { Crown, MapPin, Shield } from "lucide-react";
import { MotionSection } from "@/components/MotionSection";
import { councilMembers } from "@/data/grand-council";

export function GrandCouncilSection() {
  return (
    <MotionSection className="mx-auto max-w-7xl space-y-8 pb-14 sm:pb-20">
      <div className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-red-300">
            <Crown aria-hidden size={24} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">
              Governance Body
            </p>
            <h2 className="font-display mt-2 text-4xl uppercase leading-none text-white sm:text-5xl">
              Guardians Of The Platform
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">
              The Juego Todo Grand Council brings together masters, officials, legal advisors,
              and athlete representatives to protect the integrity of Filipino combat sports
              as the platform scales globally.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {councilMembers.map((member) => (
          <article
            className="glass-panel group overflow-hidden rounded-[1.75rem] transition hover:-translate-y-2 hover:border-red-500/40"
            key={member.slug}
          >
            <div className={`relative min-h-44 bg-gradient-to-br ${member.accent} p-5 sm:min-h-52 sm:p-6`}>
              <div className="absolute -right-8 top-8 h-28 w-28 rounded-full border border-white/15 opacity-60 transition group-hover:scale-110" aria-hidden />
              <Shield className="relative z-10 text-red-100/90" size={22} aria-hidden />
              <p className="relative z-10 mt-8 text-[0.62rem] font-black uppercase tracking-[0.22em] text-red-100">
                {member.title}
              </p>
              <h3 className="font-display relative z-10 mt-2 text-3xl uppercase leading-none text-white sm:text-4xl">
                {member.name}
              </h3>
            </div>
            <div className="space-y-4 p-5 sm:p-6">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-red-300">
                {member.specialty}
              </p>
              <p className="flex items-center gap-2 text-sm text-zinc-400">
                <MapPin className="shrink-0 text-red-300" size={15} aria-hidden />
                {member.region}
              </p>
              <p className="text-sm leading-7 text-zinc-400">{member.bio}</p>
            </div>
          </article>
        ))}
      </div>
    </MotionSection>
  );
}
