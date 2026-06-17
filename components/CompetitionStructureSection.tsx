"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { MagneticButton } from "@/components/MagneticButton";
import {
  jtgcAgeDivisions,
  jtgcCompetitionLevels,
  jtgcSystems,
  jtgcWeightClasses,
} from "@/data/competition-structure";

function StructureCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-white/[0.08] bg-[#111111]/90 ${className}`}>{children}</div>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-5">
      <h3 className="font-display text-2xl uppercase leading-none text-white sm:text-3xl">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p>
    </div>
  );
}

function IconBadge({ icon: Icon, compact = false }: { icon: LucideIcon; compact?: boolean }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center text-[#FF1010] ${
        compact ? "h-8 w-8" : "h-9 w-9 sm:h-10 sm:w-10"
      }`}
    >
      <Icon size={compact ? 18 : 20} strokeWidth={2.2} aria-hidden />
    </span>
  );
}

export function CompetitionStructureSection() {
  return (
    <section aria-label="Competition structure" className="border-t border-white/[0.08] bg-black py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3 lg:items-stretch lg:gap-6 xl:gap-8">
          <motion.article
            className="flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <SectionHeading
              description="Official body-weight divisions across the JTGC roster."
              title="Weight Classes"
            />
            <div className="grid flex-1 grid-cols-2 gap-3">
              {jtgcWeightClasses.map((weightClass) => {
                const Icon = weightClass.icon;
                return (
                  <StructureCard
                    className="flex min-h-[6.75rem] flex-col items-center justify-center gap-2.5 px-2 py-4 text-center sm:min-h-[7.25rem] sm:px-3"
                    key={weightClass.label}
                  >
                    <IconBadge compact icon={Icon} />
                    <p className="text-[0.62rem] font-black uppercase leading-tight tracking-[0.06em] text-white sm:text-[0.7rem]">
                      {weightClass.label}
                    </p>
                  </StructureCard>
                );
              })}
            </div>
          </motion.article>

          <motion.div
            className="relative min-h-[16rem] overflow-hidden rounded-xl border border-[#FF1010]/20 sm:min-h-[20rem] lg:min-h-full lg:self-stretch"
            initial={{ opacity: 0, scale: 0.98 }}
            transition={{ delay: 0.05, duration: 0.6 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, scale: 1 }}
          >
            <Image
              alt="Juego Todo fighters competing with sticks"
              className="object-cover"
              fill
              priority={false}
              sizes="(max-width: 1024px) 100vw, 33vw"
              src="/juego-todo-event-background.png"
            />
            <div
              className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_35%,rgba(0,0,0,0.35)_100%)]"
              aria-hidden
            />
          </motion.div>

          <motion.article
            className="flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <SectionHeading
              description="Age-based eligibility for sanctioned competition."
              title="Age Divisions"
            />
            <div className="flex flex-1 flex-col gap-3">
              {jtgcAgeDivisions.map((division) => {
                const Icon = division.icon;
                return (
                  <StructureCard
                    className="flex flex-1 items-center gap-3 px-4 py-4 sm:gap-4 sm:px-5"
                    key={division.label}
                  >
                    <IconBadge icon={Icon} />
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase tracking-[0.1em] text-white sm:text-sm">
                        {division.label}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-zinc-400 sm:text-sm">{division.detail}</p>
                    </div>
                  </StructureCard>
                );
              })}
            </div>
          </motion.article>
        </div>

        <motion.article
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.12, duration: 0.6 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <SectionHeading
            description="Competition formats and pathways across the Juego Todo calendar."
            title="Systems"
          />
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {jtgcSystems.map((system) => {
              const Icon = system.icon;
              return (
                <li key={system.label}>
                  <StructureCard className="flex h-full flex-col items-center justify-center gap-2 px-3 py-4 text-center sm:px-4 sm:py-5">
                    <IconBadge compact icon={Icon} />
                    <span className="text-[0.62rem] font-black uppercase leading-tight tracking-[0.06em] text-white sm:text-xs">
                      {system.label}
                    </span>
                  </StructureCard>
                </li>
              );
            })}
          </ul>
        </motion.article>

        <motion.article
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.16, duration: 0.6 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <SectionHeading
            description="Elite tier for qualified championship contenders."
            title="Competition Levels"
          />
          <ul className="grid gap-3 lg:max-w-2xl">
            {jtgcCompetitionLevels.map((level) => (
              <li key={level.label}>
                <StructureCard className="flex h-full items-start gap-3 px-4 py-5 sm:gap-4 sm:px-5">
                  <IconBadge icon={level.icon} />
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-[0.1em] text-white sm:text-sm">
                      {level.label}
                    </p>
                    <p className="mt-2 text-xs leading-6 text-zinc-400 sm:text-sm">{level.detail}</p>
                  </div>
                </StructureCard>
              </li>
            ))}
          </ul>
        </motion.article>

        <div className="mt-12 flex justify-center">
          <MagneticButton href="/login?mode=register">
            Register As A Fighter
            <ArrowRight className="ml-2 transition group-hover:translate-x-1" size={16} aria-hidden />
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
