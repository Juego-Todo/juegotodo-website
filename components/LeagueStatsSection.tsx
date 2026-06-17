import { heroMainStats } from "@/data/site";

export function LeagueStatsSection() {
  return (
    <section aria-label="League statistics" className="border-b border-white/[0.08] bg-[#050505]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
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
    </section>
  );
}
