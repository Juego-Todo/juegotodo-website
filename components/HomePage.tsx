"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play, Radio, Shield, Swords, Trophy, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CountdownTimer } from "@/components/CountdownTimer";
import { MotionSection } from "@/components/MotionSection";
import { RankingsPreview } from "@/components/RankingsSystem";
import { MediaLogoCarousel } from "@/components/MediaLogoCarousel";
import { events, fighters, mediaReels, partners, stats, systems } from "@/data/site";

const iconMap = [Trophy, Swords, Users, Radio];

export function HomePage() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.35], [0, 40]);
  const nextEvent = events.find((event) => event.status === "Upcoming") ?? events[0];

  return (
    <main className="overflow-hidden">
      <section className="relative overflow-hidden px-4 pt-20 sm:px-6 sm:pt-24 lg:min-h-[100svh] lg:px-8">
        <motion.div className="absolute inset-0" style={{ y: heroY }}>
          <Image
            alt="Juego Todo fighters competing inside the cage"
            className="h-full w-full object-cover object-[62%_center] sm:object-center"
            fill
            priority
            sizes="100vw"
            src="/hero-fight-cage.png"
          />
        </motion.div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.76)_42%,rgba(0,0,0,0.38)_72%,rgba(0,0,0,0.72)_100%)]" aria-hidden />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,#050506_0%,rgba(5,5,6,0.38)_28%,rgba(5,5,6,0)_58%)]" aria-hidden />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_24%,rgba(229,9,20,0.28),transparent_32rem),radial-gradient(circle_at_18%_78%,rgba(229,9,20,0.32),transparent_24rem)]" aria-hidden />
        <div className="cinematic-grid absolute inset-0 opacity-20" aria-hidden />
        <motion.div
          aria-hidden
          className="hero-rings absolute -right-40 top-28 h-[38rem] w-[38rem] rounded-full opacity-25 blur-sm"
          style={{ y: heroY }}
        />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/80 to-transparent" aria-hidden />
        <div className="mx-auto grid max-w-7xl items-center gap-7 pb-8 pt-6 sm:pt-12 lg:min-h-[calc(100svh-6rem)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pb-8">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10"
            initial={{ opacity: 0, y: 28 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-4 inline-flex max-w-full rounded-full border border-red-500/40 bg-black/55 px-3.5 py-2 text-[0.62rem] font-black uppercase tracking-[0.22em] text-red-100 shadow-[0_0_26px_rgba(229,9,20,0.24)] backdrop-blur-md sm:mb-5 sm:px-4 sm:text-xs sm:tracking-[0.32em]">
              <span className="sm:hidden">LATAYANOLOGY // Live FMA</span>
              <span className="hidden sm:inline">Live Weaponized Caged Fighting</span>
            </div>
            <h1 className="font-display max-w-4xl text-[clamp(3.05rem,14vw,4.8rem)] uppercase leading-[0.9] tracking-wide text-white drop-shadow-[0_8px_32px_rgba(0,0,0,0.95)] sm:text-[clamp(4rem,10vw,7rem)] sm:leading-[0.88] lg:text-[clamp(4rem,7vw,8rem)]">
              The Evolution of Filipino Combat Sports
            </h1>
            <p className="mt-4 max-w-xl text-[0.95rem] leading-7 text-zinc-200 drop-shadow-[0_3px_16px_rgba(0,0,0,0.9)] sm:mt-5 sm:text-lg">
              LATAYANOLOGY powers the official fighter database for Juego Todo:
              verified records, rankings, fight history, division movement, and
              athlete profiles built for fans, matchmakers, gyms, and media.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:flex-wrap">
              <Link className="group inline-flex min-h-12 w-full items-center justify-center rounded-full bg-red-600 px-5 py-3.5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-[0_0_40px_rgba(229,9,20,0.48)] transition hover:-translate-y-1 hover:bg-red-500 sm:w-auto sm:text-sm" href="/registration">
                Register as Fighter
                <ArrowRight className="ml-2 transition group-hover:translate-x-1" size={18} aria-hidden />
              </Link>
              <Link className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/20 bg-black/55 px-5 py-3.5 text-xs font-black uppercase tracking-[0.2em] text-white backdrop-blur-md transition hover:-translate-y-1 hover:bg-white/15 sm:w-auto sm:text-sm" href="/media">
                <Play className="mr-2 fill-white" size={16} aria-hidden />
                <span className="sm:hidden">Highlights</span>
                <span className="hidden sm:inline">Watch Highlights</span>
              </Link>
            </div>
            <Link
              className="glass-panel mt-5 grid grid-cols-[1fr_auto] items-center gap-4 rounded-3xl border-red-500/25 bg-black/50 p-4 sm:hidden"
              href="/events"
            >
              <div>
                <p className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-red-300">
                  Next Card
                </p>
                <h2 className="font-display mt-2 text-3xl uppercase leading-none text-white">
                  Ascension Manila
                </h2>
                <p className="mt-2 text-xs font-semibold text-zinc-300">
                  Reyes vs Cruz • Welterweight Title
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-red-600 px-3 py-2 text-center">
                <div className="font-display text-3xl leading-none text-white">86</div>
                <div className="text-[0.55rem] font-black uppercase tracking-[0.18em] text-red-100">
                  Days
                </div>
              </div>
            </Link>
            <div className="mt-7 hidden max-w-xl lg:block">
              <div className="grid grid-cols-3 gap-3">
                {[
                  ["Rounds", "Doble / Solo / Mano"],
                  ["Ruleset", "FMA + BJJ"],
                  ["Stage", "Caged Combat"],
                ].map(([label, value]) => (
                  <div className="rounded-2xl border border-white/10 bg-black/45 p-3 backdrop-blur-md" key={label}>
                    <p className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-red-300">
                      {label}
                    </p>
                    <p className="mt-2 text-sm font-bold text-white">{value}</p>
                  </div>
                ))}
              </div>
              <MediaLogoCarousel />
            </div>
          </motion.div>

          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 hidden sm:block"
            initial={{ opacity: 0, scale: 0.94 }}
            transition={{ delay: 0.15, duration: 0.9 }}
          >
            <div className="mx-auto w-full max-w-lg lg:ml-auto">
              <div className="glass-panel red-glow relative overflow-hidden rounded-[1.5rem] border-red-500/20 bg-black/45 p-3 sm:rounded-[1.75rem] sm:p-4">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
                <div className={`relative overflow-hidden rounded-[1.15rem] bg-gradient-to-br ${nextEvent.posterTone} sm:rounded-[1.35rem]`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.24),transparent_26%),linear-gradient(120deg,rgba(0,0,0,0.22),rgba(0,0,0,0.88))]" />
                  <div className="absolute -right-20 top-8 h-56 w-56 rounded-full border border-red-400/35 sm:h-72 sm:w-72" />
                  <div className="relative p-4 sm:p-5">
                    <div className="mb-8 flex items-center justify-between sm:mb-10">
                      <span className="rounded-full border border-white/20 bg-black/45 px-3 py-1 text-xs font-black uppercase tracking-[0.28em] text-white">
                        Next Card
                      </span>
                      <Shield className="text-red-200" aria-hidden />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[0.26em] text-red-100 sm:text-sm sm:tracking-[0.3em]">
                      {nextEvent.city}
                    </p>
                    <h2 className="font-display mt-3 text-[2.7rem] uppercase leading-none text-white sm:text-5xl">
                      {nextEvent.title}
                    </h2>
                    <p className="mt-3 text-sm font-semibold text-zinc-200 sm:mt-4 sm:text-base">{nextEvent.mainEvent}</p>
                    <div className="mt-6">
                      <CountdownTimer target={nextEvent.date} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 hidden grid-cols-2 gap-4 2xl:grid">
                <div className="glass-panel rounded-3xl p-4">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">Format</p>
                  <p className="font-display mt-2 text-3xl uppercase text-white">3 Rounds</p>
                </div>
                <div className="glass-panel rounded-3xl p-4">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">Signal</p>
                  <p className="font-display mt-2 text-3xl uppercase text-white">Live Ready</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <MotionSection className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = iconMap[index] ?? Trophy;
            return (
              <motion.div
                className="glass-panel rounded-3xl p-5 sm:p-6"
                key={stat.label}
                whileHover={{ y: -6, borderColor: "rgba(229,9,20,0.45)" }}
              >
                <Icon className="mb-5 text-red-400" aria-hidden />
                <div className="font-display text-4xl text-white sm:text-5xl">{stat.value}</div>
                <div className="mt-2 text-xs font-black uppercase tracking-[0.24em] text-zinc-400">
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      </MotionSection>

      <MotionSection className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <SectionHeading eyebrow="Featured Fighters" title="Athlete Cards With Combat Identity" />
        <div className="-mx-4 mt-8 flex snap-x gap-4 overflow-x-auto px-4 pb-5 [scrollbar-width:thin] sm:mx-0 sm:mt-10 sm:gap-5 sm:px-0">
          {fighters.map((fighter) => (
            <Link
              className="glass-panel group min-w-[17rem] snap-center rounded-[1.75rem] p-4 transition hover:-translate-y-2 hover:border-red-500/40 sm:min-w-[19rem] sm:p-5"
              href={`/fighters/${fighter.slug}`}
              key={fighter.slug}
            >
              <div className="aspect-[4/5] rounded-[1.25rem] bg-[radial-gradient(circle_at_35%_20%,rgba(229,9,20,0.35),transparent_34%),linear-gradient(145deg,#1a1a1d,#050506)] p-5">
                <div className="flex h-full flex-col justify-between">
                  <span className="w-fit rounded-full bg-red-600 px-3 py-1 text-xs font-black uppercase tracking-[0.2em]">
                    {fighter.rank}
                  </span>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.24em] text-red-200">
                      {fighter.nickname}
                    </p>
                    <h3 className="font-display mt-2 text-5xl uppercase leading-none text-white">
                      {fighter.name}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-300">{fighter.style}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">{fighter.gym}</p>
                </div>
                <div className="font-display text-3xl text-red-300">{fighter.record}</div>
              </div>
            </Link>
          ))}
        </div>
      </MotionSection>

      <MotionSection className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <RankingsPreview />
      </MotionSection>

      <MotionSection className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <SectionHeading eyebrow="Upcoming Events" title="Fight Cards, Countdown Timers, Posters, Results" />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {events.map((event) => (
            <article className="glass-panel overflow-hidden rounded-[1.75rem]" key={event.slug}>
              <div className={`min-h-48 bg-gradient-to-br ${event.posterTone} p-5 sm:min-h-56`}>
                <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1 text-xs font-black uppercase tracking-[0.22em]">
                  {event.status}
                </span>
                <h3 className="font-display mt-14 text-4xl uppercase leading-none text-white sm:mt-16 sm:text-5xl">{event.title}</h3>
              </div>
              <div className="p-5">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-300">{event.venue}</p>
                <p className="mt-2 text-zinc-300">{event.mainEvent}</p>
                <ul className="mt-5 space-y-2 text-sm text-zinc-400">
                  {event.bouts.map((bout) => (
                    <li className="border-t border-white/10 pt-2" key={bout}>{bout}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </MotionSection>

      <MotionSection className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeading eyebrow="Media Reels" title="Video-First Presentation For Fight Fans" />
            <p className="mt-4 text-base leading-7 text-zinc-400 sm:mt-5 sm:text-lg sm:leading-8">
              Built for highlight clips, vertical social edits, livestream previews,
              athlete features, and sponsor-integrated broadcast assets.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {mediaReels.map((reel, index) => (
              <motion.div
                className="group relative min-h-48 overflow-hidden rounded-[1.5rem] border border-white/10 bg-zinc-950 p-5 sm:min-h-56"
                key={reel}
                whileHover={{ scale: 1.02 }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(229,9,20,0.42),transparent_32%)] opacity-75 transition group-hover:opacity-100" />
                <Play className="relative z-10 mb-16 rounded-full bg-red-600 p-3 text-white sm:mb-20" size={52} aria-hidden />
                <h3 className="font-display relative z-10 text-3xl uppercase text-white sm:text-4xl">{reel}</h3>
                <p className="relative z-10 mt-2 text-sm uppercase tracking-[0.2em] text-zinc-400">
                  Reel {String(index + 1).padStart(2, "0")}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </MotionSection>

      <MotionSection className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <SectionHeading eyebrow="Filipino Martial Arts Systems" title="Traditional Roots. Modern Ruleset. Global Stage." />
        <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4">
          {systems.map((system) => (
            <article className="broadcast-line glass-panel rounded-3xl p-6 pt-8" key={system.name}>
              <h3 className="font-display text-3xl uppercase text-white sm:text-4xl">{system.name}</h3>
              <p className="mt-4 text-sm leading-7 text-zinc-400">{system.text}</p>
            </article>
          ))}
        </div>
      </MotionSection>

      <MotionSection className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="glass-panel rounded-[1.75rem] p-6 sm:rounded-[2rem] sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-10 xl:gap-12">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300 sm:text-sm sm:tracking-[0.32em]">
                Partnership System
              </p>
              <h2 className="font-display mt-4 max-w-xl text-4xl uppercase leading-[0.95] text-white sm:text-5xl lg:text-6xl">
                Sponsor The Next Global Combat Sports Platform
              </h2>
              <p className="mt-5 max-w-lg text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">
                Sponsor showcases, gym affiliation inquiries, media access, and
                official registration funnels are designed into the platform.
              </p>
              <Link
                className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-red-600 px-6 py-4 text-xs font-black uppercase tracking-[0.18em] text-white shadow-[0_0_40px_rgba(229,9,20,0.48)] transition hover:-translate-y-1 hover:bg-red-500 sm:text-sm sm:tracking-[0.22em]"
                href="/partnerships"
              >
                Build With Juego Todo
              </Link>
            </div>
            <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4">
              {partners.map((partner) => (
                <div
                  className="flex min-h-[5.5rem] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center text-[0.68rem] font-bold uppercase leading-snug tracking-[0.12em] text-zinc-200 sm:min-h-[6.25rem] sm:p-5 sm:text-xs sm:tracking-[0.16em]"
                  key={partner}
                >
                  {partner}
                </div>
              ))}
            </div>
          </div>
        </div>
      </MotionSection>
    </main>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-black uppercase tracking-[0.32em] text-red-300">{eyebrow}</p>
      <h2 className="font-display mt-3 text-4xl uppercase leading-none text-white sm:text-6xl lg:text-7xl">
        {title}
      </h2>
    </div>
  );
}
