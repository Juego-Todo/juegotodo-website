"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import type { ProfileSectionId } from "@/components/profile/ProfileSidebarNav";
import type { MemberRecord } from "@/lib/profile/member-record";
import { buildMissionItems } from "@/lib/profile/mission-control";

export function ProfileCommandCenter({
  memberRecord,
  onAction,
}: {
  memberRecord: MemberRecord;
  onAction: (href?: string, section?: ProfileSectionId) => void;
}) {
  const role = memberRecord.roleModule;
  const missions = buildMissionItems(role, memberRecord);

  return (
    <section className="space-y-8">
      <div>
        <p className={`text-[0.62rem] font-black uppercase tracking-[0.28em] ${role.accentClass}`}>Mission Control</p>
        <h2 className="font-display mt-2 text-3xl uppercase text-white sm:text-4xl">Today&apos;s Mission</h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          What requires your attention right now — not your entire profile history.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {missions.map((mission, index) => (
          <motion.article
            animate={{ opacity: 1, y: 0 }}
            className={`group rounded-[1.5rem] border px-5 py-5 transition ${
              mission.urgent ? "border-[#FF1010]/35 bg-[#FF1010]/5" : "border-white/10 bg-white/[0.02] hover:border-white/20"
            }`}
            initial={{ opacity: 0, y: 10 }}
            key={mission.id}
            transition={{ delay: index * 0.06, duration: 0.35 }}
          >
            <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">{mission.label}</p>
            <p className="font-display mt-3 text-4xl leading-none text-white">{mission.headline}</p>
            <p className="mt-2 text-sm text-zinc-400">{mission.detail}</p>
            {mission.href ? (
              <Link
                className="mt-5 inline-flex items-center gap-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-red-200 transition group-hover:text-white"
                href={mission.href}
              >
                {mission.actionLabel}
                <ArrowRight size={14} aria-hidden />
              </Link>
            ) : (
              <button
                className="mt-5 inline-flex items-center gap-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-red-200 transition group-hover:text-white"
                onClick={() => onAction(undefined, mission.section)}
                type="button"
              >
                {mission.actionLabel}
                <ArrowRight size={14} aria-hidden />
              </button>
            )}
          </motion.article>
        ))}
      </div>
    </section>
  );
}
