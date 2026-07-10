import { MediaPartnerLogo } from "@/components/MediaPartnerLogo";
import { mediaPartners } from "@/data/site";
import { buildSeamlessMarqueeLoop } from "@/lib/marquee";

export function AsSeenOnCarousel({ embedded = false }: { embedded?: boolean }) {
  const loop = buildSeamlessMarqueeLoop(mediaPartners);

  return (
    <section
      aria-label="As seen on"
      className={
        embedded
          ? "relative mt-auto overflow-hidden border-t border-white/10 bg-black/50 py-3 backdrop-blur-md sm:py-4"
          : "relative overflow-hidden border-b border-white/[0.08] bg-[#050505] py-10 sm:py-12"
      }
    >
      {!embedded ? (
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,16,16,0.08),transparent_24rem)]"
          aria-hidden
        />
      ) : null}

      <div className={`relative ${embedded ? "px-0" : "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"}`}>
        <p
          className={`text-center font-black uppercase tracking-[0.34em] text-zinc-500 ${
            embedded ? "text-[0.56rem] sm:text-[0.6rem]" : "text-[0.62rem] sm:text-xs"
          }`}
        >
          As Seen On
        </p>
      </div>

      <div className={`relative overflow-hidden ${embedded ? "mt-3 sm:mt-4" : "mt-6 sm:mt-8"}`}>
        <div
          className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-10 sm:w-16 ${
            embedded
              ? "bg-gradient-to-r from-black/80 to-transparent"
              : "bg-gradient-to-r from-[#050505] to-transparent"
          }`}
          aria-hidden
        />
        <div
          className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-10 sm:w-16 ${
            embedded
              ? "bg-gradient-to-l from-black/80 to-transparent"
              : "bg-gradient-to-l from-[#050505] to-transparent"
          }`}
          aria-hidden
        />
        <div className="media-marquee-track flex w-max items-center">
          {loop.map((partner, index) => (
            <MediaPartnerLogo
              compact={embedded}
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
