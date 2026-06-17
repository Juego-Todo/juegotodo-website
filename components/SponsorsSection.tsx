import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { currentPartnerLogos } from "@/data/partners-page";

export function SponsorsSection() {
  const marqueeLogos = [...currentPartnerLogos, ...currentPartnerLogos];

  return (
    <section className="border-y border-white/[0.08] bg-[#050505] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-[#FF1010]">Partnerships</p>
            <h2 className="font-display mt-3 text-4xl uppercase leading-[0.95] text-white sm:text-6xl lg:text-7xl">
              Partner With The Future Of Filipino Combat Sports
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-400">
              Access athletes, gyms, livestream audiences, events, seminars, and national competition circuits.
            </p>
            <Link
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[#FF1010] px-6 py-3.5 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#ff2828] sm:text-sm"
              href="/partners"
            >
              Become A Partner
              <ArrowRight className="ml-2" size={16} aria-hidden />
            </Link>
          </div>

          <div>
            <p className="text-center text-[0.62rem] font-medium uppercase tracking-[0.28em] text-zinc-500 lg:text-right">
              Trusted By
            </p>
            <div className="relative mt-5 overflow-hidden">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#050505] to-transparent" aria-hidden />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#050505] to-transparent" aria-hidden />
              <div className="media-marquee-track flex w-max items-center py-2">
                {marqueeLogos.map((partner, index) => (
                  <span className="partnership-logo-wall inline-flex shrink-0 items-center px-6 sm:px-8" key={`${partner}-${index}`}>
                    <span className="font-display text-base uppercase tracking-[0.14em] text-white sm:text-lg">
                      {partner}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
