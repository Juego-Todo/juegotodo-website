import { MediaPartnerLogo } from "@/components/MediaPartnerLogo";
import { mediaPartners } from "@/data/site";
import { buildSeamlessMarqueeLoop } from "@/lib/marquee";

export function AsSeenOnCarousel() {
  const loop = buildSeamlessMarqueeLoop(mediaPartners);

  return (
    <section
      aria-label="As seen on"
      className="relative overflow-hidden border-b border-white/[0.08] bg-[#050505] py-10 sm:py-12"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,16,16,0.08),transparent_24rem)]" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-[0.62rem] font-black uppercase tracking-[0.34em] text-zinc-500 sm:text-xs">
          As Seen On
        </p>
      </div>

      <div className="relative mt-6 overflow-hidden sm:mt-8">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#050505] to-transparent sm:w-16"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#050505] to-transparent sm:w-16"
          aria-hidden
        />
        <div className="media-marquee-track flex w-max items-center">
          {loop.map((partner, index) => (
            <MediaPartnerLogo
              key={`${partner.name}-${index}`}
              partner={partner}
              variant="as-seen-on"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
