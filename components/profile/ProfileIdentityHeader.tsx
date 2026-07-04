"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { VerificationBadge } from "@/components/profile/RoleBadge";
import { UserTypeBadge } from "@/components/profile/UserTypeBadge";
import { resolveUserTypeTagIds, type UserTypeTagId } from "@/data/user-type-tags";
import { formatUsername } from "@/lib/auth/username";
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
import { LicenseCardApplyPlaceholder } from "@/components/profile/LicenseCardApplyPlaceholder";
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
import type { ProfileIdentity } from "@/lib/profile/identity";
import { getVerificationLabel } from "@/lib/profile/identity";
import type { UserProfile } from "@/lib/auth/types";

export function ProfileIdentityHeader({
  user,
  identity,
  initials,
  licenseApplication = null,
  adminAssignedTags = [],
  tierLabel,
  joinedDate,
  showCommunityMember = false,
}: {
  user: UserProfile;
  identity: ProfileIdentity;
  initials: string;
  licenseApplication?: LicenseApplication | null;
  adminAssignedTags?: UserTypeTagId[];
  tierLabel?: string;
  joinedDate?: string;
  showCommunityMember?: boolean;
}) {
  const bannerTone = identity.athlete?.bannerTone ?? "from-red-950/90 via-black/80 to-zinc-950/90";

  const hasApprovedLicense = licenseApplication?.status === "approved";
  const isOfficerCredential = isGrandCouncilOfficerApplication(licenseApplication);
  const isCouncilMemberCredential = isGrandCouncilMemberApplication(licenseApplication);
  const isClubOwnerCredential = isClubOwnerApplication(licenseApplication);
  const isCoachCredential = isCoachLicenseApplication(licenseApplication);
  const isSeniorCoachCredential = isSeniorCoachLicenseApplication(licenseApplication);
  const isAdviserCredential = isAdviserLicenseApplication(licenseApplication);
  const isTrainerCredential = isTrainerLicenseApplication(licenseApplication);
  const isRefereeCredential = isRefereeLicenseApplication(licenseApplication);
  const isJudgeCredential = isJudgeLicenseApplication(licenseApplication);
  const isFighterCredential = isFighterLicenseApplication(licenseApplication);
  const isStaffCredential = isStaffLicenseApplication(licenseApplication);
  const userTypeTags = resolveUserTypeTagIds(user, licenseApplication, adminAssignedTags);

  return (
    <div className="glass-panel overflow-hidden rounded-[1.75rem]">
      <div className={`relative bg-gradient-to-br ${bannerTone}`}>
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,16,16,0.35),transparent_32%),linear-gradient(90deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.55)_45%,rgba(0,0,0,0.2)_100%)]"
          aria-hidden
        />
        <div
          className="absolute inset-y-0 right-0 hidden w-[42%] bg-[radial-gradient(circle_at_70%_50%,rgba(255,16,16,0.25),transparent_55%),linear-gradient(270deg,rgba(255,16,16,0.08),transparent)] opacity-80 lg:block"
          aria-hidden
        />

        <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-[#FF1010]/70 bg-black/50 shadow-[0_0_40px_rgba(255,16,16,0.35)] sm:h-32 sm:w-32">
              <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_35%_18%,rgba(255,16,16,0.45),transparent_38%),linear-gradient(145deg,#27272a,#050505)] font-display text-4xl text-white">
                {initials}
              </div>
              {identity.verifications.includes("verified_athlete") ? (
                <span className="absolute bottom-1 right-1 rounded-full bg-[#FF1010] p-1 text-white">
                  <CheckCircle2 size={14} aria-hidden />
                </span>
              ) : null}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {identity.verifications.map((verification) => (
                  <VerificationBadge key={verification} label={getVerificationLabel(verification)} />
                ))}
              </div>
              <h1 className="font-display mt-3 text-4xl uppercase leading-none text-white sm:text-6xl lg:text-7xl">
                {user.fullName}
                {identity.verifications.length > 0 ? (
                  <span className="ml-2 inline-block text-emerald-300">✓</span>
                ) : null}
              </h1>
              <p className="mt-2 text-sm font-semibold tracking-[0.08em] text-red-200">
                {formatUsername(user.username)}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {userTypeTags.map((tagId) => (
                  <UserTypeBadge key={tagId} tagId={tagId} />
                ))}
              </div>
              <p className="mt-3 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-300">
                🇵🇭 {identity.athlete?.region ?? user.city ?? "Philippines"}
                {identity.athlete?.country ? `, ${identity.athlete.country}` : ""}
              </p>
            </div>
          </div>

          {hasApprovedLicense ? (
            isOfficerCredential ? (
              <GrandCouncilOfficerIdCard application={licenseApplication} identity={identity} user={user} />
            ) : isCouncilMemberCredential ? (
              <GrandCouncilMemberIdCard application={licenseApplication} identity={identity} user={user} />
            ) : isClubOwnerCredential ? (
              <ClubOwnerIdCard application={licenseApplication} identity={identity} user={user} />
            ) : isSeniorCoachCredential ? (
              <SeniorCoachLicenseIdCard application={licenseApplication} identity={identity} user={user} />
            ) : isCoachCredential ? (
              <CoachLicenseIdCard application={licenseApplication} identity={identity} user={user} />
            ) : isAdviserCredential ? (
              <AdviserLicenseIdCard application={licenseApplication} identity={identity} user={user} />
            ) : isTrainerCredential ? (
              <TrainerLicenseIdCard application={licenseApplication} identity={identity} user={user} />
            ) : isRefereeCredential ? (
              <RefereeLicenseIdCard application={licenseApplication} identity={identity} user={user} />
            ) : isJudgeCredential ? (
              <JudgeLicenseIdCard application={licenseApplication} identity={identity} user={user} />
            ) : isFighterCredential ? (
              <FighterLicenseIdCard application={licenseApplication} identity={identity} user={user} />
            ) : isStaffCredential ? (
              <StaffLicenseIdCard application={licenseApplication} identity={identity} user={user} />
            ) : (
              <JtgcMemberIdCard application={licenseApplication} identity={identity} user={user} />
            )
          ) : (
            <LicenseCardApplyPlaceholder />
          )}
        </div>
      </div>

      {showCommunityMember && tierLabel && joinedDate ? (
        <div className="border-t border-white/10 bg-black/50 p-6 sm:p-8">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#FF1010]">Fan Profile</p>
          <h2 className="font-display mt-2 text-3xl uppercase text-white sm:text-4xl">Community Member</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
            Follow fighters, save events, and manage your JTGC membership.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <ProfileSummaryStat label="Email" value={user.email} />
            <ProfileSummaryStat label="JTGC Tier" value={tierLabel} />
            <ProfileSummaryStat label="Member Since" value={joinedDate} />
          </div>

          <Link
            className="glass-panel mt-6 flex items-center justify-between rounded-[1.25rem] border border-white/10 p-5 transition hover:border-[#FF1010]/40"
            href="/registration"
          >
            <span className="font-display text-xl uppercase text-white sm:text-2xl">Competition Registration</span>
            <ArrowRight className="shrink-0 text-[#FF1010]" size={18} aria-hidden />
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function ProfileSummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
      <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className="mt-2 break-all text-sm font-semibold text-white sm:text-base">{value}</p>
    </div>
  );
}
