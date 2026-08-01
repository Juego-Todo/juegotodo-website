"use client";

import { ArrowUpRight, Check, ChevronRight, Circle, Clock3, Lock, X } from "lucide-react";
import Link from "next/link";
import type { LicenseApplication } from "@/data/license-applications";
import {
  formatFighterRecord,
  formatJudgeLevels,
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
import type { MemberProgressStep, MemberRequirement } from "@/lib/profile/member-record";

const licenseOptions = [
  { href: "/register-for-license", label: "Member License", detail: "JT1 membership" },
  { href: "/register-for-license/fighter", label: "Fighter License", detail: "Competition athlete" },
  { href: "/register-for-license/coach", label: "Coach License", detail: "Team coaching" },
  { href: "/register-for-license/senior-coach", label: "Senior Coach", detail: "Elite coaching" },
  { href: "/register-for-license/trainer", label: "Trainer License", detail: "Training credentials" },
  { href: "/register-for-license/referee", label: "Referee License", detail: "Officiating" },
  { href: "/register-for-license/judge", label: "Judge License", detail: "Scoring officials" },
  { href: "/register-for-license/adviser", label: "Adviser License", detail: "Professional adviser" },
  { href: "/register-for-license/club-owner", label: "Club Owner", detail: "Gym affiliation" },
  { href: "/register-for-license/staff", label: "Staff License", detail: "League operations" },
  { href: "/register-for-license/grand-council-member", label: "Grand Council Member", detail: "Council membership" },
  { href: "/register-for-license/grand-council-officer", label: "Grand Council Officer", detail: "Council officer" },
] as const;

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
      return "Member License";
  }
}

function approvedTitle(input: {
  isOfficerApplication: boolean;
  isCouncilMemberApplication: boolean;
  isClubOwner: boolean;
  isCoach: boolean;
  isSeniorCoach: boolean;
  isAdviser: boolean;
  isTrainer: boolean;
  isReferee: boolean;
  isJudge: boolean;
  isFighter: boolean;
  isStaff: boolean;
}) {
  if (input.isOfficerApplication) return "Officer ID Active";
  if (input.isCouncilMemberApplication) return "Council Member ID Active";
  if (input.isClubOwner) return "Club Owner ID Active";
  if (input.isCoach) return "Coach License Active";
  if (input.isSeniorCoach) return "Senior Coach License Active";
  if (input.isAdviser) return "Adviser License Active";
  if (input.isTrainer) return "Trainer License Active";
  if (input.isReferee) return "Referee License Active";
  if (input.isJudge) return "Judge License Active";
  if (input.isFighter) return "Fighter License Active";
  if (input.isStaff) return "Staff License Active";
  return "License Active";
}

function resolveOverallPercent(requirementsPercent: number, steps: MemberProgressStep[]) {
  if (steps.length === 0) {
    return requirementsPercent;
  }

  const completeSteps = steps.filter((step) => step.state === "complete").length;
  const currentBonus = steps.some((step) => step.state === "current") ? 0.35 : 0;
  const stepPercent = Math.round(((completeSteps + currentBonus) / steps.length) * 100);

  // Blend document readiness with pipeline progress so one number reflects the whole journey.
  return Math.min(100, Math.round(requirementsPercent * 0.45 + stepPercent * 0.55));
}

function StepIcon({ state }: { state: MemberProgressStep["state"] }) {
  if (state === "complete") {
    return (
      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
        <Check size={11} strokeWidth={2.5} aria-hidden />
      </span>
    );
  }
  if (state === "current") {
    return (
      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400/20 ring-2 ring-amber-300/60">
        <Clock3 className="text-amber-200" size={11} aria-hidden />
      </span>
    );
  }
  if (state === "waiting") {
    return (
      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black">
        <Circle className="text-zinc-400" size={8} aria-hidden />
      </span>
    );
  }
  return (
    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black">
      <Lock className="text-zinc-600" size={10} aria-hidden />
    </span>
  );
}

export function LicenseApplicationProfileSection({
  application,
  requirements = [],
  requirementsPercent = 0,
  steps = [],
}: {
  application: LicenseApplication | null;
  requirements?: MemberRequirement[];
  requirementsPercent?: number;
  steps?: MemberProgressStep[];
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
    (application && isTrainer
      ? formatTrainerDisciplines(application.backgroundAnswers) || getRestrictionLabel(application.restrictionCode)
      : "") ||
    application?.backgroundAnswers.clubName ||
    application?.backgroundAnswers.officerPosition ||
    application?.backgroundAnswers.councilPosition ||
    (application ? getRestrictionLabel(application.restrictionCode) : "");
  const hasCredentialId =
    isOfficerApplication ||
    isCouncilMemberApplication ||
    isClubOwner ||
    isCoach ||
    isSeniorCoach ||
    isAdviser ||
    isTrainer ||
    isReferee ||
    isJudge ||
    isFighter ||
    isStaff;

  const overallPercent =
    status === "approved" ? 100 : resolveOverallPercent(requirementsPercent, steps);
  const requirementsDone = requirements.filter((item) => item.complete).length;
  const stepsDone = steps.filter((step) => step.state === "complete").length;
  const currentStep = steps.find((step) => step.state === "current" || step.state === "waiting");

  const title =
    status === "approved"
      ? approvedTitle({
          isOfficerApplication,
          isCouncilMemberApplication,
          isClubOwner,
          isCoach,
          isSeniorCoach,
          isAdviser,
          isTrainer,
          isReferee,
          isJudge,
          isFighter,
          isStaff,
        })
      : status === "pending"
        ? "Application in review"
        : status === "needs_info"
          ? "More information needed"
          : status === "rejected"
            ? "Resubmit required"
            : "Apply for a license";

  const subtitle =
    status === "approved"
      ? `Your ${programLabel(program)} is active on this profile.`
      : status
        ? `Your ${programLabel(program)} application is ${overallPercent}% complete.`
        : "Track readiness, pick a credential, and finish your application.";

  return (
    <section className="rounded-[1.75rem] border border-white/[0.08] bg-white/[0.03] p-6 sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {status === "approved" ? (
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-300">Approved</p>
          ) : null}
          <h2
            className={`text-xl font-semibold tracking-tight text-white ${status === "approved" ? "mt-2" : ""}`}
          >
            {title}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-2xl font-semibold tabular-nums text-white">{overallPercent}%</p>
          <p className="mt-0.5 text-[0.62rem] font-medium uppercase tracking-[0.12em] text-zinc-500">Complete</p>
        </div>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#FF1010] transition-all"
          style={{ width: `${overallPercent}%` }}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-zinc-400">
          {requirementsDone} of {requirements.length || 0} requirements
        </span>
        <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-zinc-400">
          {stepsDone} of {steps.length || 0} steps
        </span>
        <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-zinc-400">
          About 3–5 business days
        </span>
        <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-zinc-400">
          Est. ₱3,500 / year
        </span>
      </div>

      {requirements.length > 0 ? (
        <div className="mt-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-zinc-500">Requirements</p>
            {currentStep ? (
              <p className="text-xs text-zinc-500">
                Up next: <span className="text-zinc-300">{currentStep.label}</span>
              </p>
            ) : null}
          </div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {requirements.map((item) => (
              <li
                className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-sm ${
                  item.complete
                    ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
                    : "border-white/[0.06] bg-black/25 text-zinc-500"
                }`}
                key={item.label}
              >
                <span>{item.label}</span>
                {item.complete ? (
                  <Check className="shrink-0 text-emerald-300" size={14} aria-hidden />
                ) : (
                  <X className="shrink-0 text-zinc-600" size={14} aria-hidden />
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {steps.length > 0 ? (
        <div className="mt-6">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-zinc-500">License pathway</p>
          <ol className="mt-3 grid gap-2 sm:grid-cols-2">
            {steps.map((step) => {
              const label =
                step.state === "complete"
                  ? "Done"
                  : step.state === "current"
                    ? "In progress"
                    : step.state === "waiting"
                      ? "Up next"
                      : "Locked";

              return (
                <li
                  className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 ${
                    step.state === "complete"
                      ? "border-emerald-400/20 bg-emerald-500/10"
                      : step.state === "current"
                        ? "border-amber-400/25 bg-amber-500/10"
                        : "border-white/[0.06] bg-black/20"
                  }`}
                  key={step.label}
                >
                  <StepIcon state={step.state} />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm font-medium ${
                        step.state === "locked" ? "text-zinc-500" : "text-white"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                  <p
                    className={`shrink-0 text-[0.62rem] font-semibold uppercase tracking-[0.1em] ${
                      step.state === "complete"
                        ? "text-emerald-300"
                        : step.state === "current"
                          ? "text-amber-200"
                          : "text-zinc-600"
                    }`}
                  >
                    {label}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}

      <div className="mt-6 border-t border-white/[0.08] pt-6">
        {status === "approved" ? (
          <Link
            className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#FF1010] transition hover:text-[#ff3a3a]"
            href={registerHref}
          >
            View application details
            <ArrowUpRight size={16} aria-hidden />
          </Link>
        ) : (
          <>
            <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-zinc-500">
              {status ? "Your application" : "Choose a credential"}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {status
                ? `${programLabel(program)} · continue where you left off.`
                : "Pick the license that matches your role to begin."}
            </p>

            {status === "pending" && application ? (
              <div className="mt-4 flex items-start gap-3 rounded-2xl bg-amber-400/10 px-4 py-3.5">
                <Clock3 className="mt-0.5 shrink-0 text-amber-200" size={18} aria-hidden />
                <div>
                  <p className="text-sm font-medium text-amber-50">Pending admin review</p>
                  <p className="mt-0.5 text-sm text-amber-50/70">
                    {application.fullName}
                    {positionLabel ? ` · ${positionLabel}` : ""}
                  </p>
                  {hasCredentialId ? (
                    <p className="mt-1 text-xs text-amber-100/60">ID {application.idNumber}</p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {status === "needs_info" && application ? (
              <div className="mt-4 rounded-2xl bg-sky-400/10 px-4 py-3.5">
                <p className="text-sm font-medium text-sky-50">Update and resubmit</p>
                {application.reviewNotes ? (
                  <p className="mt-1 text-sm text-sky-50/80">{application.reviewNotes}</p>
                ) : (
                  <p className="mt-1 text-sm text-sky-50/70">
                    Add the missing details, then send it back for review.
                  </p>
                )}
              </div>
            ) : null}

            {status === "rejected" && application?.reviewNotes ? (
              <div className="mt-4 rounded-2xl bg-red-500/10 px-4 py-3.5">
                <p className="text-sm font-medium text-red-100">Admin note</p>
                <p className="mt-1 text-sm text-red-100/80">{application.reviewNotes}</p>
              </div>
            ) : null}

            {status ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {status === "pending" ? (
                  <Link
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-black transition hover:bg-zinc-200"
                    href={`${registerHref}?status=pending`}
                  >
                    View status
                  </Link>
                ) : null}
                {status === "needs_info" ? (
                  <Link
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-black transition hover:bg-zinc-200"
                    href={registerHref}
                  >
                    Update application
                  </Link>
                ) : null}
                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-5 text-sm font-medium text-white transition hover:bg-white/5"
                  href={registerHref}
                >
                  Edit application
                </Link>
              </div>
            ) : (
              <div className="mt-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-black/25">
                {licenseOptions.map((option, index) => (
                  <Link
                    className={`flex items-center justify-between gap-3 px-4 py-3.5 transition hover:bg-white/[0.04] ${
                      index > 0 ? "border-t border-white/[0.06]" : ""
                    }`}
                    href={option.href}
                    key={option.href}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">{option.label}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">{option.detail}</p>
                    </div>
                    <ChevronRight className="shrink-0 text-zinc-600" size={18} aria-hidden />
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
