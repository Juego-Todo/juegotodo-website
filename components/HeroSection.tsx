"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Ticket } from "lucide-react";
import Image from "next/image";
import { CountdownTimer } from "@/components/CountdownTimer";
import { AsSeenOnCarousel } from "@/components/AsSeenOnCarousel";
import { EnergyParticles } from "@/components/EnergyParticles";
import { MagneticButton } from "@/components/MagneticButton";
import { barrioBrawlsEvent, barrioBrawlsEventPosterSrc, barrioBrawlsTicketCheckoutUrl } from "@/data/shop-tickets";

const heroFeaturedEvent = {
  ...barrioBrawlsEvent,
  checkoutUrl: barrioBrawlsTicketCheckoutUrl,
  posterSrc: barrioBrawlsEventPosterSrc,
};

export function HeroSection() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.35], [0, 60]);
  const heroScale = useTransform(scrollYProgress, [0, 0.35], [1, 1.06]);

  return (
    <section className="relative flex flex-col overflow-x-clip">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: heroY, scale: heroScale }}>
          <Image
            alt="Juego Todo FMA athletes in weaponized competition"
            className="h-full w-full object-cover object-[center_30%]"
            fill
            loading="eager"
            priority
            sizes="100vw"
            src="/juego-todo-event-background.png"
          />
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-br from-black/88 via-[#990000]/12 to-black/72" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.96)_0%,rgba(5,5,5,0.78)_42%,rgba(5,5,5,0.32)_68%,rgba(5,5,5,0.82)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,#050505_0%,rgba(5,5,5,0.4)_28%,rgba(5,5,5,0)_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgba(255,16,16,0.12),transparent_32rem),radial-gradient(circle_at_16%_80%,rgba(255,16,16,0.1),transparent_24rem)]" />
        <div className="cinematic-grid absolute inset-0 opacity-[0.08]" />
        <div className="absolute inset-0 opacity-35">
          <EnergyParticles count={10} />
        </div>
        <motion.div
          className="hero-rings absolute -right-40 top-28 h-[38rem] w-[38rem] rounded-full opacity-[0.35] blur-sm"
          style={{ y: heroY }}
        />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/85 to-transparent" />
      </div>

      <div className="relative z-10 flex min-h-[calc(100svh-4.5rem)] flex-col">
        <div className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-7 px-4 pb-4 pt-20 sm:px-6 sm:pt-20 lg:grid-cols-[1.2fr_0.8fr] lg:gap-10 lg:px-8 lg:pb-4 lg:pt-24">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10"
            initial={{ opacity: 0, y: 28 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >

            <h1 className="font-display max-w-5xl text-[clamp(2.6rem,10vw,4.5rem)] uppercase leading-[0.9] tracking-wide text-white drop-shadow-[0_8px_32px_rgba(0,0,0,0.95)] sm:text-[clamp(3.2rem,7.5vw,6rem)] lg:text-[clamp(3.5rem,6vw,6.5rem)]">
              <span className="block text-white/90">The Evolution of</span>
              <span className="block bg-gradient-to-r from-white via-white to-red-200 bg-clip-text text-transparent">
                Filipino Combat Sports
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-[1rem] leading-8 text-zinc-300 drop-shadow-[0_3px_16px_rgba(0,0,0,0.9)] sm:mt-6 sm:text-lg sm:leading-8">
              Juego Todo transforms Filipino Martial Arts into a professional spectator sport with
              weaponized competition, verified athlete identity, official rules, media, commerce,
              seminars, and championship legacy connected in one platform.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
              <MagneticButton href="/registration">
                Register Now
                <ArrowRight className="ml-2 transition group-hover:translate-x-1" size={18} aria-hidden />
              </MagneticButton>
              <MagneticButton href={heroFeaturedEvent.checkoutUrl} variant="secondary">
                <Ticket className="mr-2" size={16} aria-hidden />
                Buy Now
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
                <div className="relative aspect-[3/4] overflow-hidden rounded-[1rem] sm:rounded-[1.15rem]">
                  <Image
                    alt={`${heroFeaturedEvent.series} ${heroFeaturedEvent.title} official event poster`}
                    className="object-cover object-center"
                    fill
                    priority
                    sizes="(max-width: 1024px) 85vw, 27rem"
                    src={heroFeaturedEvent.posterSrc}
                  />
                </div>
                <div className="mt-3 px-1 pb-1 sm:mt-3.5 sm:px-1.5 sm:pb-1.5">
                  <CountdownTimer target={heroFeaturedEvent.target} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <AsSeenOnCarousel embedded />
      </div>
    </section>
  );
}
