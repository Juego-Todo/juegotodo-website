"use client";

import Link from "next/link";
import { CheckCircle2, Clock3, Lock } from "lucide-react";
import { JudgeLicenseIdCard } from "@/components/profile/JudgeLicenseIdCard";
import { FighterLicenseIdCard } from "@/components/profile/FighterLicenseIdCard";
import { StaffLicenseIdCard } from "@/components/profile/StaffLicenseIdCard";
import { SeniorCoachLicenseIdCard } from "@/components/profile/SeniorCoachLicenseIdCard";
import { RefereeLicenseIdCard } from "@/components/profile/RefereeLicenseIdCard";
import { TrainerLicenseIdCard } from "@/components/profile/TrainerLicenseIdCard";
import { AdviserLicenseIdCard } from "@/components/profile/AdviserLicenseIdCard";
import { ClubOwnerIdCard } from "@/components/profile/ClubOwnerIdCard";
import { CoachLicenseIdCard } from "@/components/profile/CoachLicenseIdCard";
import { GrandCouncilMemberIdCard } from "@/components/profile/GrandCouncilMemberIdCard";
import { GrandCouncilOfficerIdCard } from "@/components/profile/GrandCouncilOfficerIdCard";
import { JtgcMemberIdCard } from "@/components/profile/JtgcMemberIdCard";
import type { ProfileSectionId } from "@/components/profile/ProfileSidebarNav";
import type { LicenseApplication } from "@/data/license-applications";
import {
  isAdviserLicenseApplication,
  isClubOwnerApplication,
  isCoachLicenseApplication,
  isGrandCouncilMemberApplication,
  isGrandCouncilOfficerApplication,
  isFighterLicenseApplication,
  isStaffLicenseApplication,
  isJudgeLicenseApplication,
  isRefereeLicenseApplication,
  isSeniorCoachLicenseApplication,
  isTrainerLicenseApplication,
} from "@/data/license-applications";
import type { MemberRecord } from "@/lib/profile/member-record";
import type { RoleStatItem } from "@/lib/profile/role-modules";
import type { ProfileIdentity } from "@/lib/profile/identity";
import type { UserProfile } from "@/lib/auth/types";

export function MemberPortalHero({
  user,
  identity,
  memberRecord,
  licenseApplication = null,
  onNavigate,
}: {
  user: UserProfile;
  identity: ProfileIdentity;
  memberRecord: MemberRecord;
  licenseApplication?: LicenseApplication | null;
  onNavigate?: (section: ProfileSectionId) => void;
}) {
  const role = memberRecord.roleModule;

  return (
    <div className="glass-panel overflow-hidden rounded-[1.75rem]">
      <div className={`relative bg-gradient-to-br ${role.bannerClass} p-6 sm:p-8`}>
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,16,16,0.22),transparent_34%)]"
          aria-hidden
        />

        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="space-y-5">
            <div className="border-b border-white/10 pb-5">
              <p className={`text-[0.62rem] font-black uppercase tracking-[0.28em] ${role.accentClass}`}>
                {role.roleTitle}
              </p>
              <h1 className="font-display mt-2 text-4xl uppercase leading-none text-white sm:text-6xl">
                {role.displayName}
              </h1>
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-400">{role.subtitle}</p>
              <p className="mt-3 font-mono text-sm tracking-[0.18em] text-red-200">{role.memberId}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em] text-emerald-200">
                  <CheckCircle2 size={12} aria-hidden />
                  {role.statusBadge}
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {role.stats.map((stat) => (
                <HeroStat key={stat.label} {...stat} />
              ))}
            </div>

            {role.secondaryStats.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {role.secondaryStats.map((stat) => (
                  <HeroStat key={stat.label} {...stat} compact />
                ))}
              </div>
            ) : null}

            {role.progressLabel && role.progressValue !== undefined ? (
              <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">
                    {role.progressLabel}
                  </p>
                  <p className="font-display text-2xl text-[#FF1010]">{role.progressValue}%</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-[#FF1010]" style={{ width: `${role.progressValue}%` }} />
                </div>
                {role.progressMeta ? (
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
                    Level {role.progressMeta}
                  </p>
                ) : null}
              </div>
            ) : null}

            {role.careerSnapshot.length > 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">Career Snapshot</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {role.careerSnapshot.map((item) => (
                    <div key={item.label}>
                      <p className="text-lg" aria-hidden>
                        {item.icon}
                      </p>
                      <p className="mt-1 text-[0.58rem] font-black uppercase tracking-[0.12em] text-zinc-500">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">{item.value}</p>
                      {item.detail ? <p className="text-xs text-zinc-500">{item.detail}</p> : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {role.quickLinks.length > 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                <p className={`text-[0.62rem] font-black uppercase tracking-[0.18em] ${role.accentClass}`}>
                  {role.kind === "admin"
                    ? "Admin Console"
                    : role.kind === "community"
                      ? "Community Rewards"
                      : "Quick Access"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {role.quickLinks.map((link) =>
                    link.href ? (
                      <Link
                        className="rounded-full border border-white/15 px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white transition hover:border-red-500/40"
                        href={link.href}
                        key={link.label}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <button
                        className="rounded-full border border-white/15 px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white transition hover:border-red-500/40"
                        key={link.label}
                        onClick={() => link.section && onNavigate?.(link.section)}
                        type="button"
                      >
                        {link.label}
                      </button>
                    ),
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <DigitalMemberCardSlot
            identity={identity}
            licenseApplication={licenseApplication}
            memberRecord={memberRecord}
            user={user}
          />
        </div>
      </div>

      <div className="border-t border-white/10 bg-black/50 px-6 py-4 sm:px-8">
        <p className="text-[0.58rem] font-black uppercase tracking-[0.2em] text-zinc-500">Official Credential</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {memberRecord.credentialChips.map((chip) => (
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.12em] ${
                chip.tone === "success"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
                  : chip.tone === "warning"
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-100"
                    : "border-white/10 bg-white/5 text-zinc-200"
              }`}
              key={chip.label}
            >
              <span aria-hidden>{chip.icon}</span>
              {chip.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeroStat({
  label,
  value,
  tone = "neutral",
  compact = false,
}: RoleStatItem & { compact?: boolean }) {
  const toneClass =
    tone === "verified" || tone === "accent"
      ? "text-emerald-200"
      : tone === "pending"
        ? "text-amber-200"
        : "text-white";

  return (
    <div className={`rounded-2xl border border-white/10 bg-black/35 ${compact ? "p-3" : "p-4"}`}>
      <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className={`mt-2 font-semibold ${compact ? "text-sm" : "text-base"} ${toneClass}`}>{value}</p>
    </div>
  );
}

function DigitalMemberCardSlot({
  user,
  identity,
  memberRecord,
  licenseApplication,
}: {
  user: UserProfile;
  identity: ProfileIdentity;
  memberRecord: MemberRecord;
  licenseApplication: LicenseApplication | null;
}) {
  const approved = licenseApplication?.status === "approved";

  if (approved && licenseApplication) {
    return (
      <div className="w-full max-w-[28rem]">
        <p className="mb-3 text-[0.56rem] font-black uppercase tracking-[0.22em] text-zinc-500">Digital Credential</p>
        <LicenseCardPreview application={licenseApplication} identity={identity} user={user} />
      </div>
    );
  }

  if (licenseApplication?.status === "pending") {
    return (
      <div className="w-full max-w-[28rem]">
        <p className="mb-3 text-[0.56rem] font-black uppercase tracking-[0.22em] text-zinc-500">Digital Credential</p>
        <div className="flex aspect-[1.58/1] w-full flex-col items-center justify-center rounded-[0.85rem] border border-amber-500/30 bg-amber-500/10 px-6 text-center">
          <Clock3 className="text-amber-200" size={28} aria-hidden />
          <p className="font-display mt-4 text-2xl uppercase text-white">Official Member Card</p>
          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-amber-200">Pending Approval</p>
          <p className="mt-4 text-xs uppercase tracking-[0.16em] text-zinc-400">
            Estimated Review: {memberRecord.estimatedReviewDays ?? 3} Days
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[28rem]">
      <p className="mb-3 text-[0.56rem] font-black uppercase tracking-[0.22em] text-zinc-500">Digital Credential</p>
      <div className="flex aspect-[1.58/1] w-full flex-col items-center justify-center rounded-[0.85rem] border border-dashed border-white/15 bg-black/25 px-6 text-center">
        <Lock className="text-zinc-500" size={24} aria-hidden />
        <p className="font-display mt-4 text-2xl uppercase text-white">Official Member Card</p>
        <p className="mt-2 text-sm uppercase tracking-[0.14em] text-zinc-500">Locked until approval</p>
        <Link
          className="mt-5 inline-flex min-h-10 items-center rounded-full bg-[#FF1010] px-5 text-[0.62rem] font-black uppercase tracking-[0.16em] text-white"
          href="/register-for-license"
        >
          Apply For License →
        </Link>
      </div>
    </div>
  );
}

function LicenseCardPreview({
  application,
  identity,
  user,
}: {
  application: LicenseApplication;
  identity: ProfileIdentity;
  user: UserProfile;
}) {
  if (isGrandCouncilOfficerApplication(application)) {
    return <GrandCouncilOfficerIdCard application={application} identity={identity} user={user} />;
  }
  if (isGrandCouncilMemberApplication(application)) {
    return <GrandCouncilMemberIdCard application={application} identity={identity} user={user} />;
  }
  if (isClubOwnerApplication(application)) {
    return <ClubOwnerIdCard application={application} identity={identity} user={user} />;
  }
  if (isSeniorCoachLicenseApplication(application)) {
    return <SeniorCoachLicenseIdCard application={application} identity={identity} user={user} />;
  }
  if (isCoachLicenseApplication(application)) {
    return <CoachLicenseIdCard application={application} identity={identity} user={user} />;
  }
  if (isAdviserLicenseApplication(application)) {
    return <AdviserLicenseIdCard application={application} identity={identity} user={user} />;
  }
  if (isTrainerLicenseApplication(application)) {
    return <TrainerLicenseIdCard application={application} identity={identity} user={user} />;
  }
  if (isRefereeLicenseApplication(application)) {
    return <RefereeLicenseIdCard application={application} identity={identity} user={user} />;
  }
  if (isJudgeLicenseApplication(application)) {
    return <JudgeLicenseIdCard application={application} identity={identity} user={user} />;
  }
  if (isFighterLicenseApplication(application)) {
    return <FighterLicenseIdCard application={application} identity={identity} user={user} />;
  }
  if (isStaffLicenseApplication(application)) {
    return <StaffLicenseIdCard application={application} identity={identity} user={user} />;
  }
  return <JtgcMemberIdCard application={application} identity={identity} user={user} />;
}
