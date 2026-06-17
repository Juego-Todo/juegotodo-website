"use client";

import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Database,
  Flame,
  Shield,
  Swords,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

const features = [
  { icon: Database, label: "Verified Records", value: "100%", detail: "Sanctioned bout data" },
  { icon: TrendingUp, label: "Fighter Rankings", value: "6", detail: "Active divisions" },
  { icon: Swords, label: "Match History", value: "500+", detail: "Logged outcomes" },
  { icon: Target, label: "Weapon Statistics", value: "3", detail: "Disciplines tracked" },
  { icon: Activity, label: "Performance Analytics", value: "Live", detail: "Round-by-round" },
  { icon: Shield, label: "Athlete Profiles", value: "125+", detail: "Verified roster" },
];

const telemetry = [
  { label: "Strike Accuracy", fighter: "Reyes", value: 68, color: "#FF1010" },
  { label: "Weapon Control", fighter: "Santos", value: 82, color: "#FF1010" },
  { label: "Clinch Dominance", fighter: "Cruz", value: 74, color: "#990000" },
  { label: "Finish Rate", fighter: "Mendoza", value: 61, color: "#FF1010" },
];

export function LatayanologySection() {
  return (
    <section className="relative overflow-hidden border-t border-white/[0.08] bg-[#050505] py-16 sm:py-24" id="latayanology">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,16,16,0.14),transparent_35rem),radial-gradient(circle_at_10%_80%,rgba(153,0,0,0.2),transparent_30rem)]" aria-hidden />
      <div className="cinematic-grid absolute inset-0 opacity-10" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF1010]/30 bg-[#FF1010]/10 px-4 py-2 text-[0.65rem] font-black uppercase tracking-[0.28em] text-red-100">
              <Flame size={14} aria-hidden />
              Latayanology
            </div>
            <h2 className="font-display mt-5 text-5xl uppercase leading-[0.9] text-white sm:text-7xl lg:text-8xl">
              The World&apos;s First Filipino Martial Arts Analytics Platform
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-zinc-400 sm:text-lg">
              UFC Stats meets Formula 1 telemetry meets Riot Games esports analytics.
              LATAYANOLOGY is the data engine powering verified records, rankings,
              weapon metrics, and broadcast-ready athlete intelligence.
            </p>
            <Link
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[#FF1010] px-6 py-3.5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-[0_0_40px_rgba(255,16,16,0.4)] transition hover:bg-[#ff2828] sm:text-sm"
              href="/latayanology"
            >
              Explore The Platform
            </Link>
          </div>

          <div className="glass-panel animated-border overflow-hidden rounded-[1.75rem] border-white/[0.08] bg-[#0D0D0D]/80 p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <p className="text-[0.65rem] font-black uppercase tracking-[0.24em] text-zinc-500">Live Telemetry</p>
                <p className="font-stats mt-1 text-lg font-bold text-white">Division Performance Index</p>
              </div>
              <BarChart3 className="text-[#FF1010]" aria-hidden />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {telemetry.map((metric, index) => (
                <motion.div
                  className="rounded-2xl border border-white/[0.08] bg-black/45 p-4"
                  initial={{ opacity: 0, x: 16 }}
                  key={metric.label}
                  transition={{ delay: index * 0.08 }}
                  viewport={{ once: true }}
                  whileInView={{ opacity: 1, x: 0 }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-white">{metric.label}</p>
                      <p className="text-[0.65rem] uppercase tracking-[0.16em] text-zinc-500">{metric.fighter}</p>
                    </div>
                    <span className="font-stats text-2xl font-bold text-white">{metric.value}%</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: "0%" }}
                      style={{ backgroundColor: metric.color }}
                      transition={{ delay: 0.2 + index * 0.08, duration: 0.9 }}
                      viewport={{ once: true }}
                      whileInView={{ width: `${metric.value}%` }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl border border-white/[0.08] bg-black/35 p-3">
              {Array.from({ length: 9 }).map((_, index) => (
                <div
                  className="aspect-square rounded-lg"
                  key={index}
                  style={{
                    background: `rgba(255,16,16,${0.08 + (index % 3) * 0.12})`,
                    boxShadow: index === 4 ? "0 0 20px rgba(255,16,16,0.35)" : undefined,
                  }}
                />
              ))}
            </div>
            <p className="mt-3 text-center text-[0.65rem] font-black uppercase tracking-[0.2em] text-zinc-500">
              Weapon Engagement Heatmap
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                className="glass-panel group rounded-3xl border-white/[0.08] bg-[#0D0D0D]/70 p-5 transition hover:border-[#FF1010]/30"
                initial={{ opacity: 0, y: 20 }}
                key={feature.label}
                transition={{ delay: index * 0.06 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <Icon className="text-[#FF1010]" size={22} aria-hidden />
                <div className="mt-4 flex items-end justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-[0.16em] text-white">{feature.label}</h3>
                    <p className="mt-1 text-xs text-zinc-500">{feature.detail}</p>
                  </div>
                  <span className="font-stats text-3xl font-bold text-white">{feature.value}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
