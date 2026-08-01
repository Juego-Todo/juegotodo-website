"use client";

import { motion } from "framer-motion";
import { AdminProfileHeroCard } from "@/components/profile/dashboard/AdminProfileHeroCard";
import { ProfileOnboardingChecklist } from "@/components/profile/dashboard/ProfileOnboardingChecklist";
import { ProfileAvatarButton } from "@/components/profile/ProfileAvatarButton";
import type { LicenseApplication } from "@/data/license-applications";
import type { MemberRecord } from "@/lib/profile/member-record";
import type { UserProfile } from "@/lib/auth/types";
import { useCommerce } from "@/lib/commerce/context";
import { buildStoryKpis } from "@/lib/profile/mission-control";
import { resolveProfileDateOfBirth } from "@/lib/profile/profile-details-storage";

function formatDateOfBirth(value: string) {
  if (!value.trim()) {
    return "—";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

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
  const { userData } = useCommerce();

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

  const isFan = memberRecord.portalExperience === "fan";
  const kpis = isFan ? [] : buildStoryKpis(role);
  const dateOfBirth = resolveProfileDateOfBirth(user.id, licenseApplication?.dateOfBirth || user.dateOfBirth);
  // Name is already the headline — only list the unique identity fields.
  const details = [
    { label: "Username", value: user.username?.trim() ? `@${user.username.trim()}` : "—" },
    { label: "DOB", value: formatDateOfBirth(dateOfBirth) },
    { label: "JTGC Account #", value: memberRecord.memberId || role.memberId || "—" },
  ];

  return (
    <>
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[1.5rem] px-4 py-6 sm:rounded-[2rem] sm:px-10 sm:py-10"
        initial={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${role.bannerClass}`} aria-hidden />
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,16,16,0.18),transparent_40%)]"
          aria-hidden
        />

        <div className="relative space-y-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            {onPortraitUpload ? (
              <ProfileAvatarButton
                displayName={user.fullName}
                onSave={onPortraitUpload}
                portraitImage={portraitImage}
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-3xl uppercase leading-[0.92] text-white sm:text-5xl lg:text-6xl">
                {user.fullName}
              </h1>

              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                {details.map((detail) => (
                  <div key={detail.label}>
                    <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                      {detail.label}
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-white">{detail.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {kpis.length > 0 ? (
            <div className="grid gap-6 border-t border-white/10 pt-8 sm:grid-cols-2 xl:grid-cols-4">
              {kpis.map((kpi, index) => (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 8 }}
                  key={kpi.label}
                  transition={{ delay: 0.08 * index, duration: 0.35 }}
                >
                  <p className="text-[0.58rem] font-black uppercase tracking-[0.18em] text-zinc-500">{kpi.label}</p>
                  <p className="font-display mt-2 text-2xl leading-none text-white sm:text-4xl">{kpi.value}</p>
                  {kpi.detail ? <p className="mt-2 text-xs text-zinc-400">{kpi.detail}</p> : null}
                </motion.div>
              ))}
            </div>
          ) : null}
        </div>
      </motion.section>

      <ProfileOnboardingChecklist
        dateOfBirth={dateOfBirth}
        phone={userData.phone}
        portraitImage={portraitImage}
        user={user}
      />
    </>
  );
}
