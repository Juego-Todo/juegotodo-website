import { sponsorTiers } from "@/data/site";

export function SponsorsSection() {
  const marqueePartners = sponsorTiers.flatMap((tier) => tier.partners);

  return (
    <section className="border-y border-white/[0.08] bg-[#050505] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-[#FF1010]">Partners</p>
          <h2 className="font-display mt-3 text-5xl uppercase leading-none text-white sm:text-7xl">
            Premium Sponsor Showcase
          </h2>
        </div>

        <div className="relative mt-10 overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#050505] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#050505] to-transparent" />
          <div className="sponsor-marquee-track flex w-max gap-4">
            {[...marqueePartners, ...marqueePartners].map((partner, index) => (
              <div
                className="sponsor-logo flex min-w-[11rem] items-center justify-center rounded-2xl border border-white/[0.08] bg-[#0D0D0D] px-6 py-5 text-xs font-black uppercase tracking-[0.16em] text-zinc-500 transition hover:text-white sm:min-w-[13rem]"
                key={`${partner}-${index}`}
              >
                {partner}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {sponsorTiers.map((tier) => (
            <div className="glass-panel rounded-[1.5rem] border-white/[0.08] bg-[#0D0D0D]/70 p-5" key={tier.name}>
              <p className="text-[0.65rem] font-black uppercase tracking-[0.22em] text-zinc-500">{tier.name}</p>
              <div className="mt-4 grid gap-3">
                {tier.partners.map((partner) => (
                  <div
                    className="sponsor-logo rounded-xl border border-white/[0.08] bg-black/35 px-4 py-3 text-center text-[0.68rem] font-bold uppercase tracking-[0.14em] text-zinc-500"
                    key={partner}
                  >
                    {partner}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
