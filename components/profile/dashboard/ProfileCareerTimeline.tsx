"use client";

import { motion } from "framer-motion";
import type { MemberRecord } from "@/lib/profile/member-record";

export function ProfileCareerTimeline({ memberRecord }: { memberRecord: MemberRecord }) {
  const role = memberRecord.roleModule;
  const year = new Date().getFullYear();

  return (
    <section className="space-y-6">
      <div>
        <p className={`text-[0.62rem] font-black uppercase tracking-[0.28em] ${role.accentClass}`}>Career Timeline</p>
        <h2 className="font-display mt-2 text-3xl uppercase text-white sm:text-4xl">{year}</h2>
        <p className="mt-2 text-sm text-zinc-400">Your journey through the Juego Todo ecosystem.</p>
      </div>

      <div className="relative pl-8">
        <div className="absolute bottom-2 left-[0.72rem] top-2 w-px bg-gradient-to-b from-[#FF1010] via-white/20 to-transparent" />

        {memberRecord.timeline.map((entry, index) => (
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="relative pb-8 last:pb-0"
            initial={{ opacity: 0, x: -8 }}
            key={`${entry.label}-${entry.date}`}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <span
              className={`absolute left-[-1.45rem] top-1.5 h-3 w-3 rounded-full border-2 ${
                entry.state === "complete"
                  ? "border-[#FF1010] bg-[#FF1010]"
                  : entry.state === "current"
                    ? "border-[#FF1010] bg-black"
                    : "border-white/20 bg-black"
              }`}
            />
            <p className="text-sm font-semibold text-white">{entry.label}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-zinc-500">{entry.date}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function ProfileActivityFeed({ memberRecord }: { memberRecord: MemberRecord }) {
  const role = memberRecord.roleModule;

  return (
    <section className="space-y-5">
      <div>
        <p className={`text-[0.62rem] font-black uppercase tracking-[0.28em] ${role.accentClass}`}>Activity Feed</p>
        <h2 className="font-display mt-2 text-3xl uppercase text-white sm:text-4xl">Recent Activity</h2>
      </div>

      <ul className="space-y-3">
        {memberRecord.activity.map((entry) => (
          <li
            className="flex items-start justify-between gap-4 border-b border-white/5 py-4 last:border-0"
            key={`${entry.label}-${entry.date}`}
          >
            <div>
              <p className="text-sm font-semibold text-white">{entry.label}</p>
              <p className="mt-1 text-xs text-zinc-500">{entry.date}</p>
            </div>
            <span className="rounded-full border border-white/10 px-2 py-1 text-[0.52rem] font-black uppercase tracking-[0.12em] text-zinc-500">
              Log
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
