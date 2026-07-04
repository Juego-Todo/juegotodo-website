"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { FighterPromoPortrait } from "@/components/profile/dashboard/fighter/FighterPromoPortrait";
import type { FighterProfileView } from "@/lib/profile/fighter-profile-view";

function TapeStat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="min-w-[5.5rem] border-r border-white/10 px-4 last:border-r-0">
      <p className={`font-display text-4xl leading-none sm:text-5xl ${accent ? "text-[#FF1010]" : "text-white"}`}>
        {value}
      </p>
      <p className="mt-2 text-[0.58rem] font-black uppercase tracking-[0.18em] text-zinc-500">{label}</p>
    </div>
  );
}

export function ProfileFighterHero({
  view,
  credentialSlot,
  onPortraitUpload,
  allowPortraitUpload = false,
}: {
  view: FighterProfileView;
  credentialSlot?: ReactNode;
  onPortraitUpload?: (dataUrl: string) => Promise<void> | void;
  allowPortraitUpload?: boolean;
}) {
  const { athlete } = view;
  const recordShort = athlete.record.replace(/-0$/, "");
  const rankLabel = `#${view.rankMovement.current}`;
  const nextFightLabel = view.upcomingFight?.dateLabel ?? "TBA";
  const streak = athlete.winStreak ?? 0;

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="relative min-h-[34rem] overflow-hidden rounded-[2rem] border border-white/10 xl:min-h-[38rem]"
      initial={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="absolute inset-0 bg-black" aria-hidden />
      <Image
        alt=""
        aria-hidden
        className="object-cover opacity-40 blur-[2px]"
        fill
        priority
        sizes="100vw"
        src={view.actionBackground}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/88 to-black/55" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_50%,rgba(255,16,16,0.16),transparent_42%)]" aria-hidden />

      {credentialSlot ? (
        <div className="pointer-events-none absolute right-4 top-4 z-20 hidden xl:block">
          <div className="pointer-events-auto origin-top-right scale-[0.62]">{credentialSlot}</div>
        </div>
      ) : null}

      <div className="relative z-10 grid h-full gap-0 xl:grid-cols-[minmax(18rem,34%)_1fr] xl:items-end">
        <div className="relative flex items-end justify-center px-4 pb-0 pt-6 xl:px-6 xl:pb-2">
          <FighterPromoPortrait
            allowUpload={allowPortraitUpload}
            displayName={view.displayName}
            onUpload={onPortraitUpload}
            portraitImage={view.portraitImage}
            size="hero"
          />
        </div>

        <div className="flex flex-col justify-end px-5 pb-8 pt-2 sm:px-8 xl:pr-28 xl:pb-10">
          <div className="space-y-3">
            <p className="text-[0.62rem] font-black uppercase tracking-[0.28em] text-red-200">
              {rankLabel} National • {athlete.division}
            </p>
            <h1 className="font-display text-5xl uppercase leading-[0.88] text-white sm:text-7xl xl:text-8xl">
              {view.displayName}
            </h1>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-zinc-300">Licensed Professional Fighter</p>
            <p className="text-sm uppercase tracking-[0.14em] text-zinc-500">
              {view.countryFlag} Representing {view.countryLabel} • Team {athlete.team}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
            {streak > 0 ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-orange-200">
                <span aria-hidden>🔥</span>
                {streak} Fight Win Streak
              </span>
            ) : null}
            {view.upcomingFight ? (
              <span className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-400">
                Next Fight <span className="text-white">{nextFightLabel}</span>
              </span>
            ) : null}
          </div>

          <div className="mt-8 flex overflow-x-auto border-y border-white/10 py-6">
            <TapeStat accent label="Professional Record" value={recordShort} />
            <TapeStat label="National Ranking" value={rankLabel} />
            <TapeStat label="Weight Class" value={athlete.physical.weight.replace(" ", "")} />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export function ProfileFighterMobileIntro({
  view,
  onPortraitUpload,
  allowPortraitUpload = false,
}: {
  view: FighterProfileView;
  onPortraitUpload?: (dataUrl: string) => Promise<void> | void;
  allowPortraitUpload?: boolean;
}) {
  const { athlete } = view;
  const recordShort = athlete.record.replace(/-0$/, "");
  const rankLabel = `#${view.rankMovement.current}`;
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      setScrollProgress(Math.min(1, Math.max(0, window.scrollY / 320)));
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.div
      className="relative overflow-hidden lg:hidden"
      style={{
        opacity: 1 - scrollProgress * 0.85,
        scale: 1 - scrollProgress * 0.3,
        y: scrollProgress * -40,
      }}
    >
      <div className="relative min-h-[78vh] overflow-hidden rounded-[2rem] border border-white/10">
        <Image alt="" aria-hidden className="object-cover opacity-40 blur-[2px]" fill priority sizes="100vw" src={view.actionBackground} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/75 to-black" aria-hidden />
        <div className="relative flex h-full flex-col items-center justify-end px-6 pb-10 pt-20 text-center">
          <FighterPromoPortrait
            allowUpload={allowPortraitUpload}
            displayName={view.displayName}
            onUpload={onPortraitUpload}
            portraitImage={view.portraitImage}
            size="mobile"
          />
          <h1 className="font-display mt-4 text-5xl uppercase leading-none text-white">{view.displayName}</h1>
          <p className="mt-2 text-[0.62rem] font-black uppercase tracking-[0.18em] text-red-200">
            {rankLabel} National • {athlete.division}
          </p>
          <p className="mt-4 font-display text-5xl text-[#FF1010]">{recordShort}</p>
          <p className="mt-2 text-sm uppercase tracking-[0.14em] text-zinc-500">
            {view.countryFlag} {view.countryLabel}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
