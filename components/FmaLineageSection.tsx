"use client";

import { ArrowRight, Flame, Swords } from "lucide-react";
import Link from "next/link";
import { CALENDAR_PATH } from "@/lib/navigation/calendar";
import { MotionSection } from "@/components/MotionSection";
import { fmaLineageStyles } from "@/data/fma-lineage";

export function FmaLineageSection() {
  return (
    <MotionSection className="mx-auto max-w-7xl space-y-8 pb-14 sm:pb-20">
      <div className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-red-300">
            <Swords aria-hidden size={24} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">
              Supported Lineages
            </p>
            <h2 className="font-display mt-2 text-4xl uppercase leading-none text-white sm:text-5xl">
              FMA Styles Behind Juego Todo
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">
              Juego Todo is built on the living lineages of Filipino martial arts — not as
              museum pieces, but as active combat systems adapted for modern rules, arenas,
              and global audiences.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {fmaLineageStyles.map((style) => (
          <article
            className="glass-panel overflow-hidden rounded-[1.75rem] transition hover:border-red-500/30"
            id={style.slug}
            key={style.slug}
          >
            <div className={`bg-gradient-to-br ${style.accent} p-5 sm:p-6`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[0.62rem] font-black uppercase tracking-[0.22em] text-red-100">
                    {style.origin}
                  </p>
                  <h3 className="font-display mt-2 text-4xl uppercase leading-none text-white sm:text-5xl">
                    {style.name}
                  </h3>
                </div>
                <Flame className="text-red-100/80" size={22} aria-hidden />
              </div>
              {style.alternateNames.length ? (
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-red-100/80">
                  Also known as {style.alternateNames.join(" • ")}
                </p>
              ) : null}
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <LineageBlock label="Lineage Focus" text={style.lineageFocus} />
              <LineageBlock label="Role In Juego Todo" text={style.juegoTodoRole} />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">
                  Core Principles
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {style.principles.map((principle) => (
                    <span
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-200"
                      key={principle}
                    >
                      {principle}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">
              Learn The Systems
            </p>
            <h2 className="font-display mt-3 text-4xl uppercase leading-none text-white sm:text-5xl">
              Train Through Juego Todo Seminars
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
              Each supported lineage connects to seminar tracks, rules briefings, and
              official registration pathways for athletes ready to compete under the
              Juego Todo ruleset.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-red-600 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-red-500"
              href={CALENDAR_PATH}
            >
              View Official Calendar
              <ArrowRight className="ml-2" size={16} aria-hidden />
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:border-red-500/40"
              href="/rules-regulations"
            >
              Read Official Rules
              <ArrowRight className="ml-2" size={16} aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </MotionSection>
  );
}

function LineageBlock({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">{label}</p>
      <p className="mt-2 text-sm leading-7 text-zinc-400">{text}</p>
    </div>
  );
}
