"use client";

export function AthleteHeroVisual({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`relative overflow-hidden rounded-lg bg-gradient-to-br from-[#0a0a0a] via-[#140608] to-black ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_35%,rgba(255,16,16,0.35),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,180,0,0.08),transparent_40%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.55)_0%,transparent_45%,rgba(0,0,0,0.2)_100%)]" />
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black to-transparent" />

      <div className="relative flex h-full min-h-[22rem] items-end justify-center sm:min-h-[28rem] lg:min-h-full lg:items-center lg:justify-end lg:pr-8">
        <div className="relative w-full max-w-md scale-[0.85] sm:scale-100 lg:max-w-lg lg:scale-110">
          {/* Athlete silhouette */}
          <div className="relative mx-auto h-[20rem] w-[14rem] sm:h-[24rem] sm:w-[16rem]">
            {/* Head + helmet */}
            <div className="absolute left-1/2 top-8 h-24 w-28 -translate-x-1/2 rounded-[2rem] bg-gradient-to-b from-zinc-500 to-zinc-900 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
              <div className="mx-auto mt-7 h-9 w-20 rounded-full bg-black/60" />
              <div className="mx-auto mt-3 h-2.5 w-16 rounded-full bg-[#FF1010]/80" />
            </div>

            {/* Torso / jersey */}
            <div className="absolute left-1/2 top-28 h-44 w-36 -translate-x-1/2 rounded-b-[2rem] bg-gradient-to-b from-zinc-700 via-zinc-900 to-black shadow-2xl">
              <div className="mx-auto mt-10 h-12 w-12 rounded-full bg-[#FF1010]/90 shadow-[0_0_24px_rgba(255,16,16,0.5)]" />
              <div className="mx-auto mt-4 h-2 w-20 rounded-full bg-white/15" />
              <div className="absolute -left-3 top-16 h-16 w-8 rounded-l-2xl bg-gradient-to-b from-zinc-600 to-zinc-900" />
              <div className="absolute -right-3 top-16 h-16 w-8 rounded-r-2xl bg-gradient-to-b from-zinc-600 to-zinc-900" />
            </div>

            {/* Gloves */}
            <div className="absolute -left-6 top-36 h-20 w-14 rotate-[-18deg] rounded-2xl bg-gradient-to-b from-zinc-600 to-zinc-950 shadow-xl">
              <div className="mx-1.5 mt-2.5 h-8 rounded-xl bg-[#FF1010]/85" />
            </div>
            <div className="absolute -right-6 top-32 h-20 w-14 rotate-[12deg] rounded-2xl bg-gradient-to-b from-zinc-600 to-zinc-950 shadow-xl">
              <div className="mx-1.5 mt-2.5 h-8 rounded-xl bg-[#FF1010]/85" />
            </div>

            {/* Sticks */}
            <div className="absolute -left-10 bottom-16 h-48 w-2.5 rotate-[-28deg] rounded-full bg-gradient-to-b from-amber-600 via-amber-900 to-amber-950 shadow-lg" />
            <div className="absolute -right-8 bottom-20 h-44 w-2.5 rotate-[22deg] rounded-full bg-gradient-to-b from-amber-600 via-amber-900 to-amber-950 shadow-lg" />
          </div>

          <p className="mt-4 text-center text-[0.58rem] font-medium uppercase tracking-[0.22em] text-zinc-500 lg:text-right">
            JT Competition Gloves · Jersey · Helmet
          </p>
        </div>
      </div>
    </div>
  );
}
