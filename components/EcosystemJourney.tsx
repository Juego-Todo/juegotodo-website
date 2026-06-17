"use client";

import { ArrowRight, Calendar, ShoppingBag, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { MotionSection } from "@/components/MotionSection";

const journeys = [
  {
    label: "Rankings",
    href: "/rankings",
    description: "Division tables, pound-for-pound standings, and championship hierarchy.",
    icon: Trophy,
  },
  {
    label: "Fighter Database",
    href: "/fighters",
    description: "Search profiles, records, statistics, and weight-class filters.",
    icon: Users,
  },
  {
    label: "Events",
    href: "/events",
    description: "Upcoming cards, results, broadcasts, and fight-week coverage.",
    icon: Calendar,
  },
  {
    label: "Teams",
    href: "/teams",
    description: "Official squads, affiliated gyms, regional teams, and coaches.",
    icon: Users,
  },
  {
    label: "Partners",
    href: "/partners",
    description: "Sponsors, broadcasters, venues, and commercial collaboration.",
    icon: Users,
  },
  {
    label: "Shop",
    href: "/shop",
    description: "Official gear, apparel, competition equipment, and digital products.",
    icon: ShoppingBag,
  },
];

export function EcosystemJourney() {
  return (
    <MotionSection className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[0.32em] text-[#FF1010]">Explore The League</p>
        <h2 className="font-display mt-3 text-5xl uppercase leading-none text-white sm:text-7xl">
          JTGC Ecosystem
        </h2>
        <p className="mt-4 text-base leading-7 text-zinc-400">
          Navigate the full combat sports platform — rankings, athletes, teams, partners, and official commerce.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {journeys.map((item) => (
          <Link
            className="glass-panel group rounded-[1.5rem] p-5 transition hover:border-[#FF1010]/30 sm:rounded-[2rem] sm:p-6"
            href={item.href}
            key={item.href}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="rounded-2xl border border-[#FF1010]/20 bg-[#FF1010]/10 p-3 text-[#FF1010]">
                <item.icon size={20} aria-hidden />
              </div>
              <ArrowRight
                className="text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-[#FF1010]"
                size={18}
                aria-hidden
              />
            </div>
            <h3 className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-white">{item.label}</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-400">{item.description}</p>
          </Link>
        ))}
      </div>
    </MotionSection>
  );
}
