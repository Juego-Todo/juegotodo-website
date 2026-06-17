"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play, Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CountdownTimer } from "@/components/CountdownTimer";
import { EnergyParticles } from "@/components/EnergyParticles";
import { MagneticButton } from "@/components/MagneticButton";
import { MediaLogoCarousel } from "@/components/MediaLogoCarousel";
import { events } from "@/data/site";

const heroSlides = [
  {
    image: "/hero-fight-cage.png",
    label: "Cage Combat",
    overlay: "from-black/80 via-[#990000]/30 to-black/60",
    spotlight: "circle_at_70%_24%,rgba(255,16,16,0.35)",
  },
  {
    image: "/hero-fight-cage.png",
    label: "Stick Fighting",
    overlay: "from-black/85 via-orange-950/40 to-black/70",
    spotlight: "circle_at_30%_40%,rgba(255,80,16,0.32)",
    filter: "hue-rotate-[15deg] saturate-125",
  },
  {
    image: "/hero-fight-cage.png",
    label: "Championship",
    overlay: "from-black/90 via-yellow-950/25 to-black/75",
    spotlight: "circle_at_50%_30%,rgba(255,207,106,0.28)",
    filter: "brightness-110 contrast-105",
  },
  {
    image: "/hero-fight-cage.png",
    label: "Fighter Entrance",
    overlay: "from-black/92 via-blue-950/20 to-black/80",
    spotlight: "circle_at_20%_60%,rgba(255,16,16,0.42)",
    filter: "contrast-115 saturate-90",
  },
  {
    image: "/hero-fight-cage.png",
    label: "Arena Crowd",
    overlay: "from-black/88 via-red-950/35 to-black/65",
    spotlight: "circle_at_80%_70%,rgba(255,16,16,0.38)",
    filter: "brightness-95",
  },
];

export function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.35], [0, 60]);
  const heroScale = useTransform(scrollYProgress, [0, 0.35], [1, 1.08]);
  const nextEvent = events.find((event) => event.status === "Upcoming") ?? events[0];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 8000);
    return () => window.clearInterval(timer);
  }, []);

  const slide = heroSlides[activeSlide];

  return (
    <section className="relative overflow-hidden px-4 pt-20 sm:px-6 sm:pt-24 lg:min-h-[100svh] lg:px-8">
      <motion.div className="absolute inset-0" style={{ y: heroY, scale: heroScale }}>
        <AnimatePresence mode="sync">
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0, scale: 1.04 }}
            key={activeSlide}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              alt={`Juego Todo ${slide.label}`}
              className={`h-full w-full object-cover object-[62%_center] sm:object-center ${slide.filter ?? ""}`}
              fill
              priority={activeSlide === 0}
              sizes="100vw"
              src={slide.image}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <div className={`absolute inset-0 bg-gradient-to-br ${slide.overlay} transition-all duration-1000`} aria-hidden />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.94)_0%,rgba(5,5,5,0.72)_45%,rgba(5,5,5,0.28)_72%,rgba(5,5,5,0.78)_100%)]" aria-hidden />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,#050505_0%,rgba(5,5,5,0.35)_30%,rgba(5,5,5,0)_58%)]" aria-hidden />
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: `radial-gradient(${slide.spotlight},transparent_32rem),radial-gradient(circle_at_18%_78%,rgba(255,16,16,0.28),transparent_24rem)`,
        }}
        aria-hidden
      />
      <div className="cinematic-grid absolute inset-0 opacity-15" aria-hidden />
      <EnergyParticles />
      <motion.div
        aria-hidden
        className="hero-rings absolute -right-40 top-28 h-[38rem] w-[38rem] rounded-full opacity-20 blur-sm"
        style={{ y: heroY }}
      />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/85 to-transparent" aria-hidden />

      <div className="mx-auto grid max-w-7xl items-center gap-7 pb-8 pt-6 sm:pt-12 lg:min-h-[calc(100svh-6rem)] lg:grid-cols-[1.12fr_0.88fr] lg:gap-10 lg:pb-8">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
          initial={{ opacity: 0, y: 28 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-5 inline-flex max-w-full rounded-full border border-[#FF1010]/40 bg-black/60 px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.28em] text-red-100 shadow-[0_0_30px_rgba(255,16,16,0.28)] backdrop-blur-md sm:text-xs">
            Live Weaponized Combat League
          </div>

          <h1 className="font-display max-w-5xl text-[clamp(3.2rem,13vw,5rem)] uppercase leading-[0.86] tracking-wide text-white drop-shadow-[0_8px_32px_rgba(0,0,0,0.95)] sm:text-[clamp(4.2rem,9vw,7.5rem)] lg:text-[clamp(4.5rem,7.5vw,8.5rem)]">
            <span className="block text-white/90">The World&apos;s First</span>
            <span className="block bg-gradient-to-r from-white via-white to-red-200 bg-clip-text text-transparent">
              Weaponized Combat League
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-[1rem] leading-8 text-zinc-300 drop-shadow-[0_3px_16px_rgba(0,0,0,0.9)] sm:mt-6 sm:text-lg sm:leading-8">
            Juego Todo transforms Filipino Martial Arts into a professional spectator
            sport featuring live weaponized competition, verified athlete rankings, and
            championship titles.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
            <MagneticButton href="/rankings">
              View Rankings
              <ArrowRight className="ml-2 transition group-hover:translate-x-1" size={18} aria-hidden />
            </MagneticButton>
            <MagneticButton href="/events" variant="secondary">
              <Play className="mr-2 fill-white" size={16} aria-hidden />
              Upcoming Events
            </MagneticButton>
          </div>

          <div className="mt-8 hidden max-w-xl lg:block">
            <div className="grid grid-cols-3 gap-3">
              {[
                ["What", "Weaponized FMA League"],
                ["Why", "Verified Global Rankings"],
                ["Trust", "Sanctioned Championship Titles"],
              ].map(([label, value]) => (
                <div className="rounded-2xl border border-white/[0.08] bg-[#0D0D0D]/70 p-3 backdrop-blur-md" key={label}>
                  <p className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-[#FF1010]">{label}</p>
                  <p className="mt-2 text-sm font-bold leading-snug text-white">{value}</p>
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
            <div className="glass-panel card-3d red-glow animated-border relative overflow-hidden rounded-[1.5rem] border-[#FF1010]/20 bg-[#0D0D0D]/60 p-3 sm:rounded-[1.75rem] sm:p-4">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#FF1010] to-transparent" />
              <div className={`relative overflow-hidden rounded-[1.15rem] bg-gradient-to-br ${nextEvent.posterTone} sm:rounded-[1.35rem]`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.24),transparent_26%),linear-gradient(120deg,rgba(0,0,0,0.22),rgba(0,0,0,0.88))]" />
                <div className="relative p-4 sm:p-5">
                  <div className="mb-8 flex items-center justify-between sm:mb-10">
                    <span className="rounded-full border border-white/20 bg-black/45 px-3 py-1 text-xs font-black uppercase tracking-[0.28em] text-white">
                      Next Card
                    </span>
                    <Shield className="text-red-200" aria-hidden />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-[0.26em] text-red-100 sm:text-sm">{nextEvent.city}</p>
                  <h2 className="font-display mt-3 text-[2.7rem] uppercase leading-none text-white sm:text-5xl">{nextEvent.title.replace("Juego Todo: ", "")}</h2>
                  <p className="mt-3 text-sm font-semibold text-zinc-200 sm:mt-4 sm:text-base">{nextEvent.mainEvent}</p>
                  <div className="mt-6">
                    <CountdownTimer target={nextEvent.date} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {heroSlides.map((item, index) => (
          <button
            aria-label={`Show ${item.label} slide`}
            className={`h-1.5 rounded-full transition-all ${index === activeSlide ? "w-8 bg-[#FF1010]" : "w-3 bg-white/30 hover:bg-white/50"}`}
            key={item.label}
            onClick={() => setActiveSlide(index)}
            type="button"
          />
        ))}
      </div>
    </section>
  );
}
