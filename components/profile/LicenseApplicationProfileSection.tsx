"use client";

import { ArrowRight, Clock3 } from "lucide-react";
import Link from "next/link";
import type { LicenseApplication } from "@/data/license-applications";
import {
  formatFighterRecord,
  formatJudgeLevels,
  formatRefereeLevels,
  formatRefereeRulesets,
  formatTrainerDisciplines,
  getRestrictionLabel,
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
  resolveApplicationProgram,
  resolveLicenseApplicationHref,
} from "@/data/license-applications";

function programLabel(program: ReturnType<typeof resolveApplicationProgram>) {
  switch (program) {
    case "grand_council_officer":
      return "Grand Council Officer";
    case "grand_council_member":
      return "Grand Council Member";
    case "club_owner":
      return "Club Owner";
    case "coach_license":
      return "Coach License";
    case "senior_coach_license":
      return "Senior Coach License";
    case "adviser_license":
      return "Adviser License";
    case "trainer_license":
      return "Trainer License";
    case "referee_license":
      return "Referee License";
    case "judge_license":
      return "Judge License";
    case "fighter_license":
      return "Fighter License";
    case "staff_license":
      return "Staff License";
    default:
      return "JT1 Member License";
  }
}

function programDescription(program: ReturnType<typeof resolveApplicationProgram>, hasStatus: boolean) {
  if (hasStatus) {
    return null;
  }

  switch (program) {
    case "grand_council_officer":
      return "Complete the Grand Council Officer application to receive your official officer ID.";
    case "grand_council_member":
      return "Complete the Grand Council Member application to receive your official council member ID.";
    case "club_owner":
      return "Complete the Club Owner application to register your affiliated club and receive your official club owner ID.";
    case "coach_license":
      return "Complete the Coach License application to submit your coaching credentials for official JTGC approval.";
    case "senior_coach_license":
      return "Complete the Senior Coach License application to submit your elite coaching credentials for official JTGC approval.";
    case "adviser_license":
      return "Complete the Adviser License application to submit your professional credentials for official JTGC approval.";
    case "trainer_license":
      return "Complete the Trainer License application to submit your training credentials for official JTGC approval.";
    case "referee_license":
      return "Complete the Referee License application to submit your officiating credentials for official JTGC approval.";
    case "judge_license":
      return "Complete the Judge License application to submit your judging credentials for official JTGC approval.";
    case "fighter_license":
      return "Complete the Fighter License application to submit your competition profile and medical clearance for official JTGC approval.";
    case "staff_license":
      return "Complete the Staff License application to submit your JTGC staff credentials for official league operations approval.";
    default:
      return "Complete the JT1 member license application to submit your official JTGC membership for admin review.";
  }
}

export function LicenseApplicationProfileSection({
  application,
}: {
  application: LicenseApplication | null;
}) {
  const status = application?.status ?? null;
  const program = resolveApplicationProgram(application);
  const registerHref = resolveLicenseApplicationHref(application);
  const isOfficerApplication = isGrandCouncilOfficerApplication(application);
  const isCouncilMemberApplication = isGrandCouncilMemberApplication(application);
  const isClubOwner = isClubOwnerApplication(application);
  const isCoach = isCoachLicenseApplication(application);
  const isSeniorCoach = isSeniorCoachLicenseApplication(application);
  const isAdviser = isAdviserLicenseApplication(application);
  const isTrainer = isTrainerLicenseApplication(application);
  const isReferee = isRefereeLicenseApplication(application);
  const isJudge = isJudgeLicenseApplication(application);
  const isFighter = isFighterLicenseApplication(application);
  const isStaff = isStaffLicenseApplication(application);
  const positionLabel =
    application?.backgroundAnswers.staffPosition ||
    application?.backgroundAnswers.staffDepartment ||
    application?.backgroundAnswers.nickname ||
    application?.backgroundAnswers.weightDivision ||
    application?.backgroundAnswers.highestRank ||
    application?.backgroundAnswers.coachingLevel ||
    (application && isJudge
      ? formatJudgeLevels(application.backgroundAnswers) || getRestrictionLabel(application.restrictionCode)
      : "") ||
    (application && isFighter
      ? formatFighterRecord(application.backgroundAnswers) || getRestrictionLabel(application.restrictionCode)
      : "") ||
    (application && isReferee
      ? formatRefereeRulesets(application.backgroundAnswers) || getRestrictionLabel(application.restrictionCode)
      : "") ||
    (application && isTrainer ? formatTrainerDisciplines(application.backgroundAnswers) || getRestrictionLabel(application.restrictionCode) : "") ||
    application?.backgroundAnswers.clubName ||
    application?.backgroundAnswers.officerPosition ||
    application?.backgroundAnswers.councilPosition ||
    (application ? getRestrictionLabel(application.restrictionCode) : "");
  const hasCredentialId = isOfficerApplication || isCouncilMemberApplication || isClubOwner || isCoach || isSeniorCoach || isAdviser || isTrainer || isReferee || isJudge || isFighter || isStaff;

  if (status === "approved") {
    return (
      <div className="glass-panel rounded-[1.5rem] p-5 sm:p-6">
        <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#FF1010]">JTGC License</p>
        <h2 className="font-display mt-2 text-3xl uppercase text-white">
          {isOfficerApplication
            ? "Officer ID Active"
            : isCouncilMemberApplication
              ? "Council Member ID Active"
              : isClubOwner
                ? "Club Owner ID Active"
                : isCoach
                  ? "Coach License Active"
                  : isSeniorCoach
                    ? "Senior Coach License Active"
                    : isAdviser
                    ? "Adviser License Active"
                    : isTrainer
                      ? "Trainer License Active"
                      : isReferee
                        ? "Referee License Active"
                        : isJudge
                          ? "Judge License Active"
                          : isFighter
                            ? "Fighter License Active"
                            : isStaff
                              ? "Staff License Active"
                              : "License Active"}
        </h2>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          {isOfficerApplication
            ? "Your official Grand Council Officer ID is approved and displayed on this profile."
            : isCouncilMemberApplication
              ? "Your official Grand Council Member ID is approved and displayed on this profile."
              : isClubOwner
                ? "Your official Club Owner ID is approved and displayed on this profile."
                : isCoach
                  ? "Your official JTGC Coach License is approved and displayed on this profile."
                  : isSeniorCoach
                    ? "Your official JTGC Senior Coach License is approved and displayed on this profile."
                    : isAdviser
                    ? "Your official JTGC Adviser License is approved and displayed on this profile."
                    : isTrainer
                      ? "Your official JTGC Trainer License is approved and displayed on this profile."
                      : isReferee
                        ? "Your official JTGC Referee License is approved and displayed on this profile."
                        : isJudge
                          ? "Your official JTGC Judge License is approved and displayed on this profile."
                          : isFighter
                            ? "Your official JTGC Fighter License is approved and displayed on this profile."
                            : isStaff
                              ? "Your official JTGC Staff License is approved and displayed on this profile."
                              : "Your official JTGC license is approved. Your member card on this profile reflects your submitted details."}
        </p>
        <Link
          className="mt-5 inline-flex min-h-10 items-center justify-center rounded-full border border-white/10 px-5 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:border-[#FF1010]/40 hover:bg-white/5"
          href={registerHref}
        >
          View Application Details
          <ArrowRight className="ml-2" size={14} aria-hidden />
        </Link>
      </div>
    );
  }

  const description = programDescription(program, Boolean(status));

  return (
    <div className="glass-panel rounded-[1.5rem] p-5 sm:p-6">
      <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#FF1010]">JTGC License</p>
      <h2 className="font-display mt-2 text-3xl uppercase text-white">
        {status === "pending"
          ? "Application In Review"
          : status === "needs_info"
            ? "Additional Information Required"
          : status === "rejected"
            ? "Resubmit Required"
            : "Apply For Credentials"}
      </h2>
      {description ? <p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p> : null}

      {status === "pending" && application ? (
        <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
          <div className="flex items-start gap-3">
            <Clock3 className="mt-0.5 shrink-0 text-amber-200" size={18} aria-hidden />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-100">Pending Admin Review</p>
              <p className="mt-1 text-sm text-amber-50/80">
                {application.fullName} • {positionLabel}
              </p>
              {hasCredentialId ? (
                <p className="mt-1 text-xs text-amber-100/80">ID: {application.idNumber}</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {status === "needs_info" && application ? (
        <div className="mt-4 rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4">
          <div className="flex items-start gap-3">
            <Clock3 className="mt-0.5 shrink-0 text-sky-200" size={18} aria-hidden />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-100">More Information Requested</p>
              {application.reviewNotes ? (
                <p className="mt-2 text-sm text-sky-50/90">Admin note: {application.reviewNotes}</p>
              ) : null}
              <p className="mt-2 text-sm text-sky-50/80">
                Update your application and resubmit the missing details or documents.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {status === "rejected" && application?.reviewNotes ? (
        <p className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
          Admin note: {application.reviewNotes}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        {status === "pending" ? (
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 px-5 text-xs font-black uppercase tracking-[0.16em] text-amber-100 transition hover:border-amber-300/50"
            href={`${registerHref}?status=pending`}
          >
            View Submission Status
          </Link>
        ) : null}
        {status === "needs_info" ? (
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-sky-400/30 bg-sky-400/10 px-5 text-xs font-black uppercase tracking-[0.16em] text-sky-100 transition hover:border-sky-300/50"
            href={registerHref}
          >
            Update Application
          </Link>
        ) : null}
        <Link
          className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/10 px-5 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:border-[#FF1010]/40 hover:bg-white/5"
          href={registerHref}
        >
          {status ? "Edit Application" : `Apply — ${programLabel(program)}`}
          <ArrowRight className="ml-2" size={14} aria-hidden />
        </Link>
        {!status ? (
          <>
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-zinc-400/20 px-5 text-xs font-black uppercase tracking-[0.16em] text-zinc-200 transition hover:border-zinc-300/40 hover:bg-white/5"
              href="/register-for-license/staff"
            >
              Staff License
              <ArrowRight className="ml-2" size={14} aria-hidden />
            </Link>
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-red-400/20 px-5 text-xs font-black uppercase tracking-[0.16em] text-red-200 transition hover:border-red-300/40 hover:bg-red-500/5"
              href="/register-for-license/fighter"
            >
              Fighter License
              <ArrowRight className="ml-2" size={14} aria-hidden />
            </Link>
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-indigo-400/20 px-5 text-xs font-black uppercase tracking-[0.16em] text-indigo-200 transition hover:border-indigo-300/40 hover:bg-indigo-500/5"
              href="/register-for-license/judge"
            >
              Judge License
              <ArrowRight className="ml-2" size={14} aria-hidden />
            </Link>
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-amber-400/20 px-5 text-xs font-black uppercase tracking-[0.16em] text-amber-100 transition hover:border-amber-300/40 hover:bg-amber-500/5"
              href="/register-for-license/referee"
            >
              Referee License
              <ArrowRight className="ml-2" size={14} aria-hidden />
            </Link>
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-emerald-400/20 px-5 text-xs font-black uppercase tracking-[0.16em] text-emerald-200 transition hover:border-emerald-300/40 hover:bg-emerald-500/5"
              href="/register-for-license/trainer"
            >
              Trainer License
              <ArrowRight className="ml-2" size={14} aria-hidden />
            </Link>
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-violet-400/20 px-5 text-xs font-black uppercase tracking-[0.16em] text-violet-200 transition hover:border-violet-300/40 hover:bg-violet-500/5"
              href="/register-for-license/adviser"
            >
              Adviser License
              <ArrowRight className="ml-2" size={14} aria-hidden />
            </Link>
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-yellow-400/20 px-5 text-xs font-black uppercase tracking-[0.16em] text-yellow-100 transition hover:border-yellow-300/40 hover:bg-yellow-500/5"
              href="/register-for-license/senior-coach"
            >
              Senior Coach License
              <ArrowRight className="ml-2" size={14} aria-hidden />
            </Link>
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-blue-400/20 px-5 text-xs font-black uppercase tracking-[0.16em] text-blue-200 transition hover:border-blue-300/40 hover:bg-blue-500/5"
              href="/register-for-license/coach"
            >
              Coach License
              <ArrowRight className="ml-2" size={14} aria-hidden />
            </Link>
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-zinc-400/20 px-5 text-xs font-black uppercase tracking-[0.16em] text-zinc-200 transition hover:border-zinc-300/40 hover:bg-white/5"
              href="/register-for-license/club-owner"
            >
              Club Owner
              <ArrowRight className="ml-2" size={14} aria-hidden />
            </Link>
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#FF1010]/20 px-5 text-xs font-black uppercase tracking-[0.16em] text-red-200 transition hover:border-[#FF1010]/40 hover:bg-red-500/5"
              href="/register-for-license/grand-council-member"
            >
              Grand Council Member
              <ArrowRight className="ml-2" size={14} aria-hidden />
            </Link>
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-amber-400/20 px-5 text-xs font-black uppercase tracking-[0.16em] text-amber-100 transition hover:border-amber-300/40 hover:bg-amber-400/5"
              href="/register-for-license/grand-council-officer"
            >
              Grand Council Officer
              <ArrowRight className="ml-2" size={14} aria-hidden />
            </Link>
          </>
        ) : null}
      </div>
    </div>
  );
}
