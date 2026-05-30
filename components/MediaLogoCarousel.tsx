import { mediaPartners } from "@/data/site";

export function MediaLogoCarousel() {
  const loop = [...mediaPartners, ...mediaPartners];

  return (
    <div
      aria-label="Media and broadcast partners"
      className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/45 p-3 backdrop-blur-md sm:p-4"
      role="region"
    >
      <p className="mb-3 text-[0.62rem] font-black uppercase tracking-[0.24em] text-red-300">
        Media Partners
      </p>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-black/80 to-transparent sm:w-12" aria-hidden />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-black/80 to-transparent sm:w-12" aria-hidden />
        <div className="media-marquee-track flex w-max items-center gap-3">
          {loop.map((partner, index) => (
            <div
              className="flex min-w-[9.5rem] items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 sm:min-w-[11rem]"
              key={`${partner}-${index}`}
            >
              <span className="text-center text-[0.68rem] font-black uppercase tracking-[0.14em] text-zinc-200 sm:text-xs">
                {partner}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
