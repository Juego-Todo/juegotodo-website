"use client";

import { motion } from "framer-motion";
import { ArrowRight, Hand, Shield, Swords } from "lucide-react";
import Link from "next/link";

const fightRounds = [
  {
    round: "Round 1",
    title: "Doble Baston",
    description: "Two official Arnis sticks. Weapon-to-weapon exchanges with body and leg kicks, takedowns, sweeps, throws, and stick disarms.",
    icon: Swords,
    rulesHref: "/rules-regulations/official-rules",
    showRules: true,
  },
  {
    round: "Round 2",
    title: "Solo Baston",
    description: "One stick and limited empty-hand body strikes. Takedowns, standing submissions, stick chokes, disarms, and hand switching.",
    icon: Shield,
    rulesHref: "/rules-regulations/official-rules",
    showRules: false,
  },
  {
    round: "Round 3",
    title: "Mano Y Mano",
    description: "Unarmed FMA striking and BJJ grappling. Punches and kicks to legal targets, elbows and knees to the body, takedowns, and submissions.",
    icon: Hand,
    rulesHref: "/rules-regulations/official-rules",
    showRules: false,
  },
] as const;

export function LatayanologySection() {
  return (
    <section className="relative overflow-hidden border-t border-white/[0.08] bg-[#050505] py-16 sm:py-24" id="fight-format">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,16,16,0.08),transparent_35rem),radial-gradient(circle_at_10%_80%,rgba(153,0,0,0.1),transparent_30rem)]" aria-hidden />
      <div className="cinematic-grid absolute inset-0 opacity-[0.06]" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-[#FF1010]">Juego Todo</p>
            <h2 className="font-display mt-4 text-5xl uppercase leading-[0.9] text-white sm:text-6xl lg:text-7xl">
              3 Rounds / Fight Format
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-zinc-400 sm:text-lg">
              Every Juego Todo bout progresses through three distinct phases — from double-stick weapon work,
              to solo baston control, to full Mano Y Mano combat. This is what makes JTGC a hybrid FMA sport,
              not traditional MMA.
            </p>
            <Link
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full border border-[#FF1010]/35 px-6 py-3.5 text-xs font-black uppercase tracking-[0.18em] text-red-100 transition hover:bg-[#FF1010]/10 sm:text-sm"
              href="/rules-regulations/official-rules"
            >
              View Full Rules
              <ArrowRight className="ml-2" size={16} aria-hidden />
            </Link>
          </div>

          <div className="grid gap-4">
            {fightRounds.map((format, index) => {
              const Icon = format.icon;
              return (
                <motion.article
                  className="glass-panel group rounded-[1.5rem] border border-white/[0.08] bg-[#0D0D0D]/75 p-5 transition hover:border-[#FF1010]/25 sm:p-6"
                  initial={{ opacity: 0, y: 20 }}
                  key={format.title}
                  transition={{ delay: index * 0.08, duration: 0.6 }}
                  viewport={{ once: true }}
                  whileInView={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#FF1010]/20 bg-[#FF1010]/10">
                      <Icon className="text-[#FF1010]" size={22} aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="text-[0.62rem] font-black uppercase tracking-[0.22em] text-zinc-500">{format.round}</p>
                        <h3 className="font-display text-3xl uppercase leading-none text-white sm:text-4xl">{format.title}</h3>
                        {format.showRules ? (
                          <Link
                            className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-[#FF1010] transition hover:text-red-300"
                            href={format.rulesHref}
                          >
                            Rules
                          </Link>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm leading-7 text-zinc-400">{format.description}</p>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
