"use client";

import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, BookOpen, Globe2, Hand, RadioTower, Shield, Sparkles, Swords, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { heroMainStats } from "@/data/site";

const fightRounds = [
  {
    round: "Round 1",
    title: "Doble Baston",
    description:
      "Two official Arnis sticks. Weapon-to-weapon exchanges with body and leg kicks, takedowns, sweeps, throws, and stick disarms.",
    icon: Swords,
    rulesHref: "/rules-regulations/official-rules",
    showRules: true,
  },
  {
    round: "Round 2",
    title: "Solo Baston",
    description:
      "One stick and limited empty-hand body strikes. Takedowns, standing submissions, stick chokes, disarms, and hand switching.",
    icon: Shield,
    rulesHref: "/rules-regulations/official-rules",
    showRules: false,
  },
  {
    round: "Round 3",
    title: "Mano Y Mano",
    description:
      "Unarmed FMA striking and BJJ grappling. Punches and kicks to legal targets, elbows and knees to the body, takedowns, and submissions.",
    icon: Hand,
    rulesHref: "/rules-regulations/official-rules",
    showRules: false,
  },
] as const;

const ecosystemPillars = [
  {
    title: "Competition",
    body: "Fight cards, rankings, rules, divisions, and championship pathways built for spectators and athletes.",
    icon: Trophy,
  },
  {
    title: "Latayanology",
    body: "Verified athlete identity, team history, combat records, and Hall of Fame legacy in one living archive.",
    icon: BadgeCheck,
  },
  {
    title: "Education",
    body: "Rules clinics, seminars, coach pathways, and consultation tracks that onboard fighters with structure.",
    icon: BookOpen,
  },
  {
    title: "Commerce",
    body: "Official equipment, tickets, digital passes, and member-linked order history connected to profiles.",
    icon: RadioTower,
  },
] as const;

export function SignatureSystemSection() {
  return (
    <section className="relative isolate overflow-hidden bg-black" id="fight-format">
      <Image
        alt="Juego Todo arena atmosphere"
        className="absolute inset-0 -z-20 h-full w-full object-cover opacity-35"
        fill
        sizes="100vw"
        src="/hero-background.png"
      />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_20%,rgba(255,16,16,0.16),transparent_22rem),linear-gradient(180deg,rgba(0,0,0,0.72),#050505_92%)]" />
      <div className="cinematic-grid absolute inset-0 -z-10 opacity-[0.08]" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-12">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-[#FF1010]">Fight Format</p>
            <h3 className="font-display mt-4 text-4xl uppercase leading-[0.9] text-white sm:text-5xl lg:text-6xl">
              3 Rounds / Fight Format
            </h3>
            <p className="mt-5 max-w-xl text-base leading-8 text-zinc-400">
              Doble Baston, Solo Baston, then Mano Y Mano. A cinematic fight format that can only belong
              to Filipino Martial Arts.
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
                        <p className="text-[0.62rem] font-black uppercase tracking-[0.22em] text-zinc-500">
                          {format.round}
                        </p>
                        <h4 className="font-display text-3xl uppercase leading-none text-white sm:text-4xl">
                          {format.title}
                        </h4>
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

        <div
          aria-label="League statistics"
          className="mt-16 border-t border-white/[0.08] pt-8 sm:pt-10"
        >
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 xl:gap-3">
            {heroMainStats.map((stat) => (
              <div className="text-center xl:text-left" key={stat.label}>
                <p className="font-display text-2xl text-white sm:text-3xl xl:text-[2rem]">{stat.value}</p>
                <p className="mt-1.5 text-[0.55rem] font-medium uppercase tracking-[0.16em] text-zinc-500 sm:text-[0.58rem] sm:tracking-[0.18em]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
export function EcosystemUniverseSection() {
  return (
    <section className="relative overflow-hidden bg-[#050505] py-16 sm:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(255,16,16,0.14),transparent_34rem),radial-gradient(circle_at_100%_80%,rgba(255,255,255,0.08),transparent_30rem)]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="relative min-h-[34rem] overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0d0d0d] p-5 shadow-[0_35px_120px_rgba(0,0,0,0.55)]">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,16,16,0.22),transparent_30%),radial-gradient(circle_at_60%_20%,rgba(255,255,255,0.08),transparent_18rem)]" aria-hidden />
            <div className="cinematic-grid absolute inset-0 opacity-[0.1]" aria-hidden />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-white/10 bg-black/35 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-300">
                  JTGC Ecosystem
                </span>
                <Globe2 className="text-[#FF1010]" size={30} aria-hidden />
              </div>

              <div className="my-12 grid place-items-center">
                <div className="relative h-72 w-72 rounded-full border border-[#FF1010]/35 bg-black/30 shadow-[0_0_90px_rgba(255,16,16,0.2)]">
                  <div className="absolute inset-8 rounded-full border border-white/10" />
                  <div className="absolute inset-16 rounded-full border border-[#FF1010]/25" />
                  <div className="absolute left-1/2 top-1/2 grid h-28 w-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#FF1010] text-center font-display text-3xl uppercase leading-none text-white">
                    Juego
                    <br />
                    Todo
                  </div>
                  {["Events", "Teams", "Rules", "Shop", "Media", "Profiles"].map((label, index) => (
                    <span
                      className="absolute rounded-full border border-white/10 bg-black/70 px-3 py-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-200"
                      key={label}
                      style={{
                        left: `${50 + Math.cos((index / 6) * Math.PI * 2) * 39}%`,
                        top: `${50 + Math.sin((index / 6) * Math.PI * 2) * 39}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <p className="max-w-lg text-sm leading-7 text-zinc-400">
                Every product, event, athlete profile, seminar, and consultation should reinforce
                the same world: a formal professional home for weaponized Filipino combat sports.
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-[#FF1010]">Beyond The Fight Card</p>
            <h2 className="font-display mt-4 text-5xl uppercase leading-[0.88] text-white sm:text-7xl">
              Show The Entire Universe Earlier
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-zinc-400 sm:text-lg">
              The homepage now needs to reveal the platform’s full scale before asking visitors to
              browse. This is the shift from “combat sports website” to “global JTGC operating system.”
            </p>

            <div className="mt-8 grid gap-4">
              {ecosystemPillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <article className="group grid gap-4 border-t border-white/10 py-5 sm:grid-cols-[3rem_1fr]" key={pillar.title}>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-[#FF1010] transition group-hover:bg-[#FF1010] group-hover:text-white">
                      <Icon size={22} aria-hidden />
                    </div>
                    <div>
                      <h3 className="font-display text-3xl uppercase text-white">{pillar.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-zinc-400">{pillar.body}</p>
                    </div>
                  </article>
                );
              })}
            </div>

            <Link
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[#FF1010] px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-red-500"
              href="/latayanology"
            >
              Explore Latayanology
              <ArrowRight className="ml-2" size={16} aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LuxuryBookingCtaSection() {
  return (
    <section className="relative overflow-hidden bg-[#15110f] py-16 text-white sm:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,16,16,0.18),transparent_28rem),linear-gradient(135deg,#211816,#050505)]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-[2.5rem] border border-white/10 bg-black/25 p-6 shadow-[0_35px_120px_rgba(0,0,0,0.45)] backdrop-blur sm:p-8 lg:grid-cols-[1fr_0.75fr] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.28em] text-red-200">
              <Sparkles size={16} aria-hidden />
              Limited Advisory Slots
            </p>
            <h2 className="font-display mt-4 max-w-4xl text-5xl uppercase leading-[0.88] sm:text-7xl">
              Make Booking Feel Like A Private Fight Desk
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-300">
              Consultations should feel selective and intentional: choose the session, reserve a
              calendar spot, and submit payment in one polished flow.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">This Month</span>
              <span className="font-display text-4xl uppercase text-red-200">12 Slots</span>
            </div>
            <p className="mt-4 text-sm leading-7 text-zinc-400">
              Personal consultations, business Feng Shui, home audits, BaZi readings, and annual forecasts.
            </p>
            <Link
              className="mt-6 inline-flex w-full min-h-12 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:bg-red-100"
              href="/consultation/book"
            >
              Book Consultation
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
