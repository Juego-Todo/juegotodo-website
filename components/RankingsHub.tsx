"use client";

import { ArrowRight, Database, Scale, Trophy } from "lucide-react";
import Link from "next/link";
import { MotionSection } from "@/components/MotionSection";
import { rankingsNavItems } from "@/data/rankings-nav";

const featuredLinks = [
  {
    label: "Fighter Database",
    href: "/fighters",
    description: "Search profiles, records, and statistics across the JTGC roster.",
    icon: Database,
  },
  {
    label: "Rankings Methodology",
    href: "/ranking-methodology",
    description: "How movement, eligibility, and championship status are calculated.",
    icon: Scale,
  },
  {
    label: "Pound-for-Pound",
    href: "/rankings#pound-for-pound",
    description: "Elite cross-division board for the league's top performers.",
    icon: Trophy,
  },
];

export function RankingsHub() {
  const weightClasses = rankingsNavItems.filter(
    (item) =>
      !["Official Rankings", "Fighter Database", "Hall of Fame", "Rankings Methodology", "Pound-for-Pound"].includes(
        item.label,
      ),
  );

  return (
    <MotionSection className="mx-auto max-w-7xl pb-10">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-panel rounded-[1.5rem] p-5 sm:rounded-[2rem] sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#FF1010]">Rankings Hub</p>
          <h2 className="font-display mt-3 text-4xl uppercase leading-none text-white sm:text-5xl">
            Divisions & Discovery
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
            Rankings is the primary athlete hub — division tables, pound-for-pound standings, and the full fighter
            database live here.
          </p>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {weightClasses.map((item) => (
              <Link
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[0.68rem] font-black uppercase tracking-[0.16em] text-zinc-300 transition hover:border-[#FF1010]/30 hover:text-white"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {featuredLinks.map((item) => (
            <Link
              className="glass-panel group flex items-start gap-4 rounded-[1.5rem] p-5 transition hover:border-[#FF1010]/30"
              href={item.href}
              key={item.href}
            >
              <div className="rounded-2xl border border-[#FF1010]/20 bg-[#FF1010]/10 p-3 text-[#FF1010]">
                <item.icon size={20} aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-black uppercase tracking-[0.16em] text-white">{item.label}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{item.description}</p>
                <span className="mt-3 inline-flex items-center text-[0.65rem] font-black uppercase tracking-[0.16em] text-[#FF1010]">
                  Explore
                  <ArrowRight className="ml-1 transition group-hover:translate-x-0.5" size={14} aria-hidden />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </MotionSection>
  );
}
