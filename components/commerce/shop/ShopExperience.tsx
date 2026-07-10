"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type ShopHeroSlide = {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  href: string;
  cta: string;
  layout: "banner" | "product";
};

const shopHeroSlides: ShopHeroSlide[] = [
  {
    id: "armory",
    title: "The Official Juego Todo Armory",
    description: "Competition-certified equipment used by JTGC athletes nationwide.",
    imageSrc: "/shop-hero-banner.png",
    imageAlt: "Official Juego Todo competition gear including gloves, helmet, shin guards, and sticks",
    href: "#full-catalog",
    cta: "Shop Now",
    layout: "banner",
  },
  {
    id: "helmet",
    title: "JT Competition Helmet",
    description: "Sanctioned head protection trusted in JTGC weaponized competition.",
    imageSrc: "/shop/products/juego-todo-red-helmet.png",
    imageAlt: "Juego Todo red competition helmet",
    href: "/shop/jt-competition-helmet",
    cta: "View Helmet",
    layout: "product",
  },
  {
    id: "apparel",
    title: "Juego Todo Fight Gear",
    description: "Walkout shirts, fight shorts, caps, and league apparel for athletes and fans.",
    imageSrc: "/shop/products/juego-todo-tshirt-jtc.png",
    imageAlt: "Juego Todo JTC event shirt",
    href: "/shop/juego-todo-shirt",
    cta: "Shop Apparel",
    layout: "product",
  },
  {
    id: "shorts",
    title: "JT Fight Shorts",
    description: "Built for movement, durability, and the intensity of three-round combat.",
    imageSrc: "/shop/products/jt-short-design-b.png",
    imageAlt: "Juego Todo fight shorts design B",
    href: "/shop/juego-todo-fight-shorts",
    cta: "View Shorts",
    layout: "product",
  },
];

const AUTO_ADVANCE_MS = 6500;

function SlideBackdrop({ slide }: { slide: ShopHeroSlide }) {
  if (slide.layout === "banner") {
    return (
      <>
        <Image
          alt={slide.imageAlt}
          className="object-cover object-center"
          fill
          priority
          sizes="100vw"
          src={slide.imageSrc}
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.96)_0%,rgba(5,5,5,0.72)_40%,rgba(5,5,5,0.2)_72%,rgba(5,5,5,0.65)_100%)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_12%_50%,rgba(255,16,16,0.18),transparent_38%)]"
          aria-hidden
        />
      </>
    );
  }

  return (
    <>
      <div className="absolute inset-0 bg-[#050505]" aria-hidden />
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_78%_42%,rgba(255,16,16,0.22),transparent_34rem),radial-gradient(circle_at_18%_80%,rgba(255,16,16,0.08),transparent_24rem)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.98)_0%,rgba(5,5,5,0.88)_42%,rgba(5,5,5,0.35)_68%,rgba(5,5,5,0.75)_100%)]"
        aria-hidden
      />
      <div className="cinematic-grid absolute inset-0 opacity-[0.07]" aria-hidden />

      <div className="absolute inset-y-0 right-0 w-full lg:w-[58%]" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_50%,rgba(255,16,16,0.14),transparent_42%)]" />
        <div className="absolute bottom-[8%] left-1/2 h-16 w-[55%] -translate-x-1/2 rounded-[100%] bg-black/70 blur-2xl" />
        <div className="relative mx-auto h-full w-full max-w-2xl px-6 sm:px-10 lg:max-w-none lg:px-12">
          <div className="relative h-full min-h-[16rem] sm:min-h-[20rem] lg:min-h-full">
            <Image
              alt={slide.imageAlt}
              className="object-contain object-center drop-shadow-[0_40px_80px_rgba(0,0,0,0.85)] lg:scale-110 lg:object-right"
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
              src={slide.imageSrc}
            />
            <div
              className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_42%,rgba(5,5,5,0.55)_100%)]"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </>
  );
}

export function ShopHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const slideCount = shopHeroSlides.length;
  const activeSlide = shopHeroSlides[activeIndex];

  const goToSlide = useCallback(
    (index: number) => {
      setActiveIndex((index + slideCount) % slideCount);
      setProgress(0);
    },
    [slideCount],
  );

  const goNext = useCallback(() => {
    goToSlide(activeIndex + 1);
  }, [activeIndex, goToSlide]);

  const goPrev = useCallback(() => {
    goToSlide(activeIndex - 1);
  }, [activeIndex, goToSlide]);

  useEffect(() => {
    if (isPaused) {
      return;
    }

    const startedAt = Date.now();

    const progressTimer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setProgress(Math.min(elapsed / AUTO_ADVANCE_MS, 1));
    }, 100);

    const advanceTimer = window.setTimeout(goNext, AUTO_ADVANCE_MS);

    return () => {
      window.clearInterval(progressTimer);
      window.clearTimeout(advanceTimer);
    };
  }, [activeIndex, goNext, isPaused]);

  return (
    <section
      aria-label="Shop highlights"
      className="w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false);
        setProgress(0);
      }}
    >
      <div className="relative w-full overflow-hidden bg-black">
        <div className="relative min-h-[20rem] w-full sm:min-h-[26rem] lg:min-h-[32rem]">
          <AnimatePresence mode="wait">
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0"
              exit={{ opacity: 0, scale: 1.03 }}
              initial={{ opacity: 0, scale: 1.03 }}
              key={activeSlide.id}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <SlideBackdrop slide={activeSlide} />
            </motion.div>
          </AnimatePresence>

          <div className="relative z-10 mx-auto grid h-full min-h-[inherit] w-full max-w-7xl items-center px-4 py-7 sm:px-6 sm:py-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:px-8 lg:py-10">
            <AnimatePresence mode="wait">
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                className="max-w-xl lg:max-w-2xl"
                exit={{ opacity: 0, x: -20 }}
                initial={{ opacity: 0, x: 24 }}
                key={activeSlide.id}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <h1 className="font-display text-[clamp(1.75rem,5.5vw,4rem)] font-normal uppercase leading-[0.9] text-white drop-shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
                  {activeSlide.title}
                </h1>
                <p className="mt-3 max-w-lg text-sm leading-7 text-zinc-300 sm:mt-4 sm:text-base">{activeSlide.description}</p>
                <div className="mt-5 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:gap-3">
                  <Link
                    className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#FF1010] px-6 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-white shadow-[0_0_24px_rgba(255,16,16,0.35)] transition hover:bg-[#ff2828] sm:min-h-11 sm:px-7 sm:text-xs"
                    href={activeSlide.href}
                  >
                    {activeSlide.cta}
                    <ArrowRight className="ml-1.5" size={14} aria-hidden />
                  </Link>
                  <Link
                    className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] px-6 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm transition hover:bg-white/10 sm:min-h-11 sm:px-7 sm:text-xs"
                    href="#full-catalog"
                  >
                    Browse All
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

            <div aria-hidden className="hidden lg:block" />
          </div>

          <button
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/10 bg-black/50 p-3 text-white backdrop-blur-md transition hover:border-[#FF1010]/40 hover:bg-black/75 sm:inline-flex sm:left-6 lg:left-8"
            onClick={goPrev}
            type="button"
          >
            <ChevronLeft size={20} aria-hidden />
          </button>
          <button
            aria-label="Next slide"
            className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/10 bg-black/50 p-3 text-white backdrop-blur-md transition hover:border-[#FF1010]/40 hover:bg-black/75 sm:inline-flex sm:right-6 lg:right-8"
            onClick={goNext}
            type="button"
          >
            <ChevronRight size={20} aria-hidden />
          </button>

          <div className="absolute inset-x-0 bottom-0 z-20 border-t border-white/[0.06] bg-black/35 backdrop-blur-sm">
            <div
              className="h-0.5 bg-[#FF1010] transition-[width] duration-100 ease-linear"
              style={{ width: `${progress * 100}%` }}
              aria-hidden
            />
            <div className="mx-auto flex max-w-7xl items-center px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2">
                {shopHeroSlides.map((slide, index) => (
                  <button
                    aria-current={index === activeIndex ? "true" : undefined}
                    aria-label={`Go to slide ${index + 1}: ${slide.title}`}
                    className={`rounded-full transition-all ${
                      index === activeIndex
                        ? "h-2 w-8 bg-[#FF1010]"
                        : "h-2 w-2 bg-white/30 hover:bg-white/55"
                    }`}
                    key={slide.id}
                    onClick={() => goToSlide(index)}
                    type="button"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
