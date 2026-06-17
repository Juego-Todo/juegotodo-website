"use client";

import { broadcastPartners } from "@/data/site";

export function LeagueConnectSection() {
  return (
    <section aria-label="Broadcast partners" className="border-t border-white/[0.08] bg-[#050505]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <p className="text-center text-xs font-black uppercase tracking-[0.3em] text-zinc-500">
          Official Broadcast Partners
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {broadcastPartners.map((partner) => (
            <div
              className="footer-partner-logo rounded-2xl border border-white/[0.08] bg-[#0D0D0D] px-5 py-3 text-[0.68rem] font-black uppercase tracking-[0.14em] text-zinc-300 sm:px-6 sm:text-xs"
              key={partner}
            >
              {partner}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
