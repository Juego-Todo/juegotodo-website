"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Wifi } from "lucide-react";
import { AdminProfileHeroCard } from "@/components/profile/dashboard/AdminProfileHeroCard";
import type { LicenseApplication } from "@/data/license-applications";
import type { MemberRecord } from "@/lib/profile/member-record";
import type { UserProfile } from "@/lib/auth/types";
import { buildStoryKpis } from "@/lib/profile/mission-control";

export function ProfileMissionHero({
  user,
  memberRecord,
  portraitImage,
  licenseApplication = null,
  onPortraitUpload,
}: {
  user: UserProfile;
  memberRecord: MemberRecord;
  portraitImage?: string;
  licenseApplication?: LicenseApplication | null;
  onPortraitUpload?: (dataUrl: string) => Promise<void> | void;
}) {
  const role = memberRecord.roleModule;

  if (memberRecord.isAdmin) {
    return (
      <AdminProfileHeroCard
        licenseApplication={licenseApplication}
        memberRecord={memberRecord}
        onPortraitUpload={onPortraitUpload}
        portraitImage={portraitImage}
        user={user}
      />
    );
  }

  const kpis = buildStoryKpis(role);
  const lastLogin = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[2rem] px-6 py-8 sm:px-10 sm:py-10"
      initial={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${role.bannerClass}`} aria-hidden />
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,16,16,0.18),transparent_40%)]"
        aria-hidden
      />

      <div className="relative space-y-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <p className={`text-[0.62rem] font-black uppercase tracking-[0.32em] ${role.accentClass}`}>
              Digital Martial Arts Passport
            </p>
            <div>
              <h1 className="font-display text-5xl uppercase leading-[0.92] text-white sm:text-7xl">
                {user.fullName}
              </h1>
              <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300">{role.roleTitle}</p>
              <p className="mt-1 text-sm uppercase tracking-[0.16em] text-zinc-500">{role.subtitle}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 text-[0.62rem] font-black uppercase tracking-[0.16em] text-emerald-200">
                <CheckCircle2 size={14} aria-hidden />
                {role.statusBadge}
              </span>
              <span className="text-zinc-600">·</span>
              <span className="font-mono text-[0.68rem] tracking-[0.18em] text-red-200/90">{role.memberId}</span>
              <span className="text-zinc-600">·</span>
              <span className="inline-flex items-center gap-1.5 text-[0.62rem] font-black uppercase tracking-[0.14em] text-emerald-300">
                <Wifi size={12} aria-hidden />
                Online
              </span>
            </div>

            <p className="text-[0.58rem] font-black uppercase tracking-[0.18em] text-zinc-500">
              Last login · {lastLogin}
            </p>
          </div>
        </div>

        <div className="grid gap-6 border-t border-white/10 pt-8 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi, index) => (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 8 }}
              key={kpi.label}
              transition={{ delay: 0.08 * index, duration: 0.35 }}
            >
              <p className="text-[0.58rem] font-black uppercase tracking-[0.18em] text-zinc-500">{kpi.label}</p>
              <p className="font-display mt-2 text-4xl leading-none text-white">{kpi.value}</p>
              {kpi.detail ? <p className="mt-2 text-xs text-zinc-400">{kpi.detail}</p> : null}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
