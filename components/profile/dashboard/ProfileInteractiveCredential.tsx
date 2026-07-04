"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Clock3, Download, Lock, QrCode, Share2, Smartphone } from "lucide-react";
import { useState } from "react";
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
import type { ProfileIdentity } from "@/lib/profile/identity";
import type { UserProfile } from "@/lib/auth/types";

export function ProfileInteractiveCredential({
  user,
  identity,
  memberRecord,
  licenseApplication,
  pinned = false,
  compact = false,
}: {
  user: UserProfile;
  identity: ProfileIdentity;
  memberRecord: MemberRecord;
  licenseApplication: LicenseApplication | null;
  pinned?: boolean;
  compact?: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-120, 120], [8, -8]), { stiffness: 180, damping: 18 });
  const rotateY = useSpring(useTransform(x, [-120, 120], [-8, 8]), { stiffness: 180, damping: 18 });

  const approved = licenseApplication?.status === "approved";
  const pending = licenseApplication?.status === "pending" || licenseApplication?.status === "needs_info";

  return (
    <section
      className={
        pinned
          ? "space-y-4"
          : compact
            ? "mx-auto w-full max-w-[18rem] space-y-3"
            : "mx-auto w-full max-w-[24rem] space-y-4 lg:max-w-none"
      }
    >
      <motion.div
        className="relative [perspective:1200px]"
        onMouseLeave={() => {
          x.set(0);
          y.set(0);
        }}
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          x.set(event.clientX - rect.left - rect.width / 2);
          y.set(event.clientY - rect.top - rect.height / 2);
        }}
        style={{ rotateX, rotateY }}
      >
        <motion.button
          animate={{ rotateY: flipped ? 180 : 0 }}
          aria-label={flipped ? "Show credential front" : "Flip credential"}
          className="relative w-full text-left [transform-style:preserve-3d]"
          onClick={() => setFlipped((value) => !value)}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          type="button"
        >
          <div className="rounded-[1.1rem] shadow-[0_30px_80px_rgba(0,0,0,0.45)] [backface-visibility:hidden]">
            {approved && licenseApplication ? (
              <LicenseCardPreview application={licenseApplication} identity={identity} user={user} />
            ) : pending ? (
              <PendingCredential estimatedDays={memberRecord.estimatedReviewDays ?? 3} />
            ) : (
              <LockedCredential />
            )}
          </div>

          <div className="absolute inset-0 rounded-[1.1rem] bg-gradient-to-br from-zinc-900 via-black to-zinc-950 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <p className="text-[0.58rem] font-black uppercase tracking-[0.18em] text-zinc-500">Official Verification</p>
            <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white p-4">
              <QrCode className="text-black" size={120} aria-hidden />
              <p className="mt-3 font-mono text-xs tracking-[0.16em] text-zinc-700">{memberRecord.memberId}</p>
            </div>
            <p className="mt-6 text-center text-xs uppercase tracking-[0.14em] text-zinc-500">
              Scan to verify JTGC membership
            </p>
          </div>
        </motion.button>
      </motion.div>

      <div className={`flex flex-wrap gap-2 ${compact ? "justify-center" : ""}`}>
        <ActionChip icon={QrCode} label="QR" onClick={() => setQrOpen((value) => !value)} />
        {!compact ? (
          <>
            <ActionChip icon={Download} label="Download" />
            <ActionChip icon={Share2} label="Share" />
            <ActionChip icon={Smartphone} label="Wallet" />
          </>
        ) : null}
      </div>

      {qrOpen ? (
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-white/10 bg-black/50 p-4 text-center"
          initial={{ opacity: 0, scale: 0.96 }}
        >
          <QrCode className="mx-auto text-white" size={96} aria-hidden />
          <p className="mt-3 font-mono text-xs tracking-[0.16em] text-zinc-400">{memberRecord.memberId}</p>
        </motion.div>
      ) : null}
    </section>
  );
}

function ActionChip({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Download;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 px-4 text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-300 transition hover:border-white/25 hover:text-white"
      onClick={onClick}
      type="button"
    >
      <Icon size={14} aria-hidden />
      {label}
    </button>
  );
}

function PendingCredential({ estimatedDays }: { estimatedDays: number }) {
  return (
    <div className="flex aspect-[1.58/1] w-full flex-col items-center justify-center rounded-[1.1rem] border border-amber-500/30 bg-gradient-to-br from-amber-950/40 to-black px-6 text-center">
      <Clock3 className="text-amber-200" size={28} aria-hidden />
      <p className="font-display mt-4 text-3xl uppercase text-white">Official Member Card</p>
      <p className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-amber-200">Pending Approval</p>
      <p className="mt-4 text-xs uppercase tracking-[0.16em] text-zinc-400">Estimated Review · {estimatedDays} Days</p>
    </div>
  );
}

function LockedCredential() {
  return (
    <div className="flex aspect-[1.58/1] w-full flex-col items-center justify-center rounded-[1.1rem] border border-dashed border-white/15 bg-black/40 px-6 text-center">
      <Lock className="text-zinc-500" size={24} aria-hidden />
      <p className="font-display mt-4 text-3xl uppercase text-white">Official Member Card</p>
      <p className="mt-2 text-sm uppercase tracking-[0.14em] text-zinc-500">Locked until approval</p>
      <Link
        className="mt-5 inline-flex min-h-10 items-center rounded-full bg-[#FF1010] px-5 text-[0.62rem] font-black uppercase tracking-[0.16em] text-white"
        href="/register-for-license"
      >
        Apply For License
      </Link>
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
