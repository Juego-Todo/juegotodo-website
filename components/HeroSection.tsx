"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Ticket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CountdownTimer } from "@/components/CountdownTimer";
import { EventCardBackdrop } from "@/components/EventCardBackdrop";
import { EnergyParticles } from "@/components/EnergyParticles";
import { MagneticButton } from "@/components/MagneticButton";
import { mediaPartners } from "@/data/site";

const heroFeaturedEvent = {
  title: "Barrio Brawls",
  series: "Juego Todo",
  dateLabel: "August 29, 2026",
  timeLabel: "1:00 PM",
  venue: "TBA",
  target: "2026-08-29T13:00:00+08:00",
  ticketProductSlug: "barrio-brawls-tickets",
};

function PartnerWordmark({ name }: { name: string }) {
  return (
    <span className="partner-wordmark inline-flex shrink-0 items-center px-6 sm:px-10">
      <span className="font-display text-lg uppercase tracking-[0.16em] text-white sm:text-xl sm:tracking-[0.2em]">
        {name}
      </span>
    </span>
  );
}

export function HeroSection() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.35], [0, 60]);
  const heroScale = useTransform(scrollYProgress, [0, 0.35], [1, 1.06]);
  const marqueePartners = [...mediaPartners, ...mediaPartners];

  return (
    <section className="relative flex min-h-0 flex-col overflow-hidden lg:min-h-[100svh]">
      <motion.div className="absolute inset-0" style={{ y: heroY, scale: heroScale }}>
        <Image
          alt="Juego Todo FMA athletes in weaponized competition"
          className="h-full w-full object-cover object-[center_30%]"
          fill
          priority
          sizes="100vw"
          src="/juego-todo-event-background.png"
        />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-br from-black/88 via-[#990000]/12 to-black/72" aria-hidden />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.96)_0%,rgba(5,5,5,0.78)_42%,rgba(5,5,5,0.32)_68%,rgba(5,5,5,0.82)_100%)]" aria-hidden />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,#050505_0%,rgba(5,5,5,0.4)_28%,rgba(5,5,5,0)_55%)]" aria-hidden />
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgba(255,16,16,0.12),transparent_32rem),radial-gradient(circle_at_16%_80%,rgba(255,16,16,0.1),transparent_24rem)]"
        aria-hidden
      />
      <div className="cinematic-grid absolute inset-0 opacity-[0.08]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 opacity-35" aria-hidden>
        <EnergyParticles count={10} />
      </div>
      <motion.div
        aria-hidden
        className="hero-rings absolute -right-40 top-28 h-[38rem] w-[38rem] rounded-full opacity-[0.35] blur-sm"
        style={{ y: heroY }}
      />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/85 to-transparent" aria-hidden />

      <div className="relative z-10 flex flex-1 flex-col">
        <div className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-7 px-4 pb-6 pt-20 sm:px-6 sm:pt-20 lg:min-h-[calc(100svh-14rem)] lg:grid-cols-[1.2fr_0.8fr] lg:gap-10 lg:px-8 lg:pb-6 lg:pt-24">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10"
            initial={{ opacity: 0, y: 28 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-display max-w-5xl text-[clamp(2.6rem,10vw,4.5rem)] uppercase leading-[0.9] tracking-wide text-white drop-shadow-[0_8px_32px_rgba(0,0,0,0.95)] sm:text-[clamp(3.2rem,7.5vw,6rem)] lg:text-[clamp(3.5rem,6vw,6.5rem)]">
              <span className="block text-white/90">World&apos;s 1st</span>
              <span className="block bg-gradient-to-r from-white via-white to-red-200 bg-clip-text text-transparent">
                Professional FMA Hybrid Sport Platform
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-[1rem] leading-8 text-zinc-300 drop-shadow-[0_3px_16px_rgba(0,0,0,0.9)] sm:mt-6 sm:text-lg sm:leading-8">
              Juego Todo transforms Filipino Martial Arts into a professional spectator sport featuring
              live weaponized competition, verified athlete rankings, and championship titles.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
              <MagneticButton href="/registration">
                Register Now
                <ArrowRight className="ml-2 transition group-hover:translate-x-1" size={18} aria-hidden />
              </MagneticButton>
            </div>
          </motion.div>

          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 hidden sm:block"
            initial={{ opacity: 0, scale: 0.94 }}
            transition={{ delay: 0.15, duration: 0.9 }}
          >
            <div className="mx-auto w-[85%] max-w-[27rem] lg:ml-auto lg:mr-0">
              <div className="featured-event-poster glass-panel card-3d relative overflow-hidden rounded-[1.35rem] border border-[#FF1010]/15 bg-[#0D0D0D]/75 p-2.5 backdrop-blur-md sm:rounded-[1.5rem] sm:p-3">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF1010]/60 to-transparent" />
                <EventCardBackdrop className="rounded-[1rem] sm:rounded-[1.15rem]" sizes="(max-width: 1024px) 85vw, 27rem">
                  <div className="p-3.5 sm:p-4">
                    <div className="mb-5 sm:mb-6">
                      <span className="rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[0.58rem] font-black uppercase tracking-[0.24em] text-zinc-300">
                        Featured Event
                      </span>
                    </div>
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-red-100/80 sm:text-xs">
                      {heroFeaturedEvent.series}
                    </p>
                    <h2 className="font-display mt-2 text-[2.2rem] uppercase leading-none text-white sm:text-4xl">
                      {heroFeaturedEvent.title}
                    </h2>
                    <div className="mt-2.5 space-y-0.5 text-xs font-semibold text-zinc-300 sm:mt-3 sm:text-sm">
                      <p>{heroFeaturedEvent.dateLabel}</p>
                      <p>{heroFeaturedEvent.timeLabel}</p>
                      <p>Venue — {heroFeaturedEvent.venue}</p>
                    </div>
                    <div className="mt-4 sm:mt-5">
                      <CountdownTimer target={heroFeaturedEvent.target} />
                    </div>
                    <Link
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#FF1010] px-4 py-3 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#ff2828] sm:mt-5"
                      href={`/shop/${heroFeaturedEvent.ticketProductSlug}`}
                    >
                      <Ticket size={13} aria-hidden />
                      Buy Tickets
                    </Link>
                  </div>
                </EventCardBackdrop>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-auto w-full border-t border-white/[0.08] bg-[#050505] py-6 sm:py-8">
          <p className="text-center text-[0.62rem] font-medium uppercase tracking-[0.32em] text-zinc-500">
            As Seen On
          </p>

          <div className="relative mt-5 w-full overflow-hidden sm:mt-6">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#050505] to-transparent sm:w-24" aria-hidden />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#050505] to-transparent sm:w-24" aria-hidden />

              <div className="hidden lg:block">
                <div className="media-marquee-track flex w-max items-center py-2">
                  {marqueePartners.map((partner, index) => (
                    <PartnerWordmark key={`${partner}-${index}`} name={partner} />
                  ))}
                </div>
              </div>

              <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-5 px-4 sm:grid-cols-3 sm:px-6 lg:hidden">
                {mediaPartners.map((partner) => (
                  <div className="flex items-center justify-center" key={partner}>
                    <PartnerWordmark name={partner} />
                  </div>
                ))}
              </div>
          </div>
        </div>
      </div>
    </section>
  );
}
