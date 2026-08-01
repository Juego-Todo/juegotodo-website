"use client";

import {
  Award,
  Briefcase,
  Building2,
  Check,
  ChevronDown,
  Circle,
  ClipboardList,
  Clock3,
  Dumbbell,
  Flag,
  IdCard,
  Landmark,
  Lock,
  PhilippinePeso,
  Scale,
  Shield,
  Swords,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  licenseApplicationStatusLabels,
  resolveApplicationProgram,
  resolveLicenseApplicationHref,
  type LicenseApplication,
} from "@/data/license-applications";
import type { LicenseProgramPresetKey } from "@/data/license-program-presets";
import { LICENSE_PROGRAM_PRESETS } from "@/data/license-program-presets";
import { getLicenseProcessMeta } from "@/lib/profile/license-process";
import type { MemberProgressStep, MemberRequirement } from "@/lib/profile/member-record";

const LICENSE_OPTIONS: {
  key: LicenseProgramPresetKey;
  label: string;
  icon: LucideIcon;
}[] = [
  { key: "jt1_member", label: "Member License", icon: IdCard },
  { key: "fighter_license", label: "Fighter License", icon: Swords },
  { key: "coach_license", label: "Coach License", icon: Users },
  { key: "senior_coach_license", label: "Senior Coach", icon: Award },
  { key: "trainer_license", label: "Trainer License", icon: Dumbbell },
  { key: "referee_license", label: "Referee License", icon: Flag },
  { key: "judge_license", label: "Judge License", icon: Scale },
  { key: "adviser_license", label: "Adviser License", icon: Briefcase },
  { key: "club_owner", label: "Club Owner", icon: Building2 },
  { key: "staff_license", label: "Staff License", icon: ClipboardList },
  { key: "grand_council_member", label: "Grand Council Member", icon: Landmark },
  { key: "grand_council_officer", label: "Grand Council Officer", icon: Shield },
];

function resolveOverallPercent(requirementsPercent: number, steps: MemberProgressStep[]) {
  if (steps.length === 0) {
    return requirementsPercent;
  }

  const completeSteps = steps.filter((step) => step.state === "complete").length;
  const currentBonus = steps.some((step) => step.state === "current") ? 0.35 : 0;
  const stepPercent = Math.round(((completeSteps + currentBonus) / steps.length) * 100);

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

function statusBadgeClasses(kind: "idle" | "progress" | "pending" | "needs_info" | "rejected" | "approved") {
  switch (kind) {
    case "approved":
      return "border-emerald-400/30 bg-emerald-500/15 text-emerald-200";
    case "pending":
      return "border-amber-400/30 bg-amber-500/15 text-amber-100";
    case "needs_info":
      return "border-sky-400/30 bg-sky-500/15 text-sky-100";
    case "rejected":
      return "border-red-400/30 bg-red-500/15 text-red-100";
    case "progress":
      return "border-[#FF1010]/35 bg-[#FF1010]/15 text-red-100";
    default:
      return "border-white/10 bg-white/[0.04] text-zinc-400";
  }
}

function actionButtonClass(variant: "primary" | "secondary" | "accent" = "primary") {
  const base =
    "inline-flex min-h-11 w-full items-center justify-center rounded-full px-5 text-sm font-semibold transition sm:w-auto";
  if (variant === "secondary") {
    return `${base} border border-white/15 text-white hover:bg-white/5`;
  }
  if (variant === "accent") {
    return `${base} bg-[#FF1010] text-white hover:bg-[#ff2a2a]`;
  }
  return `${base} bg-white text-black hover:bg-zinc-200`;
}

function LicenseOptionCard({
  optionKey,
  label,
  Icon,
  active,
  application,
  requirements,
  requirementsPercent,
  steps,
  expanded,
  onToggle,
}: {
  optionKey: LicenseProgramPresetKey;
  label: string;
  Icon: LucideIcon;
  active: boolean;
  application: LicenseApplication | null;
  requirements: MemberRequirement[];
  requirementsPercent: number;
  steps: MemberProgressStep[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const cardRef = useRef<HTMLElement | null>(null);
  const preset = LICENSE_PROGRAM_PRESETS[optionKey];
  const process = getLicenseProcessMeta(optionKey);
  const status = active ? application?.status ?? null : null;
  const overallPercent =
    status === "approved"
      ? 100
      : active
        ? resolveOverallPercent(requirementsPercent, steps)
        : requirementsPercent;
  const trackCompletion = active || requirements.length > 0;

  const badge = (() => {
    if (!active || !status) {
      return { kind: "idle" as const, label: "Available" };
    }
    if (status === "approved") {
      return { kind: "approved" as const, label: "Approved" };
    }
    if (status === "pending") {
      return { kind: "pending" as const, label: "Pending" };
    }
    if (status === "needs_info") {
      return { kind: "needs_info" as const, label: "Needs info" };
    }
    if (status === "rejected") {
      return { kind: "rejected" as const, label: "Resubmit" };
    }
    return { kind: "progress" as const, label: `${overallPercent}%` };
  })();

  const applyHref = status === "pending" ? `${preset.href}?status=pending` : preset.href;
  const pathwaySteps: MemberProgressStep[] = active
    ? steps
    : process.steps.map((stepLabel, index) => ({
        label: stepLabel,
        state: index === 0 ? "waiting" : "locked",
      }));

  const displayRequirements: MemberRequirement[] =
    requirements.length > 0
      ? requirements
      : [
          { label: "Membership Profile", complete: false },
          { label: "Photo", complete: false },
          { label: "Government ID", complete: false },
          { label: "Signature", complete: false },
          { label: "Medical Certificate", complete: false },
          { label: "Emergency Contact", complete: false },
        ];

  useEffect(() => {
    if (!expanded || !cardRef.current) {
      return;
    }
    if (typeof window === "undefined" || window.matchMedia("(min-width: 640px)").matches) {
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [expanded]);

  return (
    <article
      className={`overflow-hidden rounded-2xl border transition ${
        active
          ? status === "approved"
            ? "border-emerald-400/30 bg-emerald-500/[0.06]"
            : status === "pending"
              ? "border-amber-400/30 bg-amber-500/[0.06]"
              : "border-[#FF1010]/30 bg-[#FF1010]/[0.05]"
          : "border-white/[0.08] bg-black/25"
      }`}
      ref={cardRef}
    >
      <button
        aria-expanded={expanded}
        className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-x-3 px-3 py-3.5 text-left transition hover:bg-white/[0.03] active:bg-white/[0.05] sm:gap-x-3.5 sm:px-4 sm:py-4"
        onClick={onToggle}
        type="button"
      >
        <span
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
            active
              ? "border-white/15 bg-white/10 text-white"
              : "border-white/10 bg-white/[0.04] text-zinc-400"
          }`}
        >
          <Icon size={18} aria-hidden />
        </span>

        <span className="min-w-0">
          <span className="block truncate text-[0.9rem] font-semibold leading-5 text-white sm:text-sm">
            {label}
          </span>
          <span className="mt-0.5 block truncate text-[0.7rem] leading-4 text-zinc-500 sm:text-xs">
            {process.detail}
            {active && status && status !== "approved" ? ` · ${overallPercent}%` : ""}
          </span>
        </span>

        <span
          className={`inline-flex h-6 min-w-[4.75rem] items-center justify-center rounded-full border px-2 text-[0.55rem] font-black uppercase tracking-[0.1em] ${statusBadgeClasses(badge.kind)}`}
        >
          {badge.label}
        </span>

        <span className="inline-flex h-8 w-8 items-center justify-center text-zinc-500">
          <ChevronDown
            className={`transition ${expanded ? "rotate-180" : ""}`}
            size={18}
            aria-hidden
          />
        </span>

        {active && status && status !== "approved" ? (
          <span className="col-span-full mt-2 h-1 overflow-hidden rounded-full bg-white/10 sm:hidden">
            <span
              className="block h-full rounded-full bg-[#FF1010]"
              style={{ width: `${overallPercent}%` }}
            />
          </span>
        ) : null}
      </button>

      {expanded ? (
        <div className="border-t border-white/[0.06] px-3 pb-3 pt-3 sm:px-4 sm:pb-4 sm:pt-4">
          <p className="text-[0.8rem] leading-5 text-zinc-400 sm:text-sm sm:leading-6">
            {process.description}
          </p>

          <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden">
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1.5 text-[0.7rem] font-medium text-zinc-300 sm:text-xs">
              <Clock3 size={12} aria-hidden />
              {process.durationLabel}
            </span>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1.5 text-[0.7rem] font-medium text-zinc-300 sm:text-xs">
              <PhilippinePeso size={12} aria-hidden />
              {process.costLabel}
            </span>
            {active && status ? (
              <span
                className={`inline-flex shrink-0 rounded-full border px-2.5 py-1.5 text-[0.7rem] font-medium sm:text-xs ${statusBadgeClasses(badge.kind)}`}
              >
                {licenseApplicationStatusLabels[status]}
              </span>
            ) : null}
          </div>

          {trackCompletion ? (
            <div className="mt-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[0.7rem] font-medium text-zinc-400 sm:text-xs">
                  {active ? "Submission progress" : "Readiness"}
                </p>
                <p className="text-sm font-bold tabular-nums text-white">{overallPercent}%</p>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#FF1010] transition-all"
                  style={{ width: `${overallPercent}%` }}
                />
              </div>
            </div>
          ) : null}

          <div className="mt-4 sm:mt-5">
            <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-zinc-500">
              Requirements
            </p>
            <ul className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {displayRequirements.map((item) => (
                <li
                  className={`flex min-h-10 items-center justify-between gap-2 rounded-xl border px-2.5 py-2 text-[0.8rem] sm:px-3 sm:text-sm ${
                    trackCompletion && item.complete
                      ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
                      : "border-white/[0.06] bg-black/20 text-zinc-500"
                  }`}
                  key={item.label}
                >
                  <span className="truncate">{item.label}</span>
                  {trackCompletion && item.complete ? (
                    <Check className="shrink-0 text-emerald-300" size={14} aria-hidden />
                  ) : (
                    <X className="shrink-0 text-zinc-600" size={14} aria-hidden />
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 sm:mt-5">
            <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-zinc-500">
              License pathway
            </p>

            {/* Mobile: compact horizontal steps */}
            <ol className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] sm:hidden [&::-webkit-scrollbar]:hidden">
              {pathwaySteps.map((step, index) => (
                <li
                  className={`flex min-w-[7.5rem] shrink-0 flex-col gap-1.5 rounded-xl border px-2.5 py-2 ${
                    step.state === "complete"
                      ? "border-emerald-400/20 bg-emerald-500/10"
                      : step.state === "current"
                        ? "border-amber-400/25 bg-amber-500/10"
                        : "border-white/[0.06] bg-black/20"
                  }`}
                  key={step.label}
                >
                  <div className="flex items-center gap-1.5">
                    <StepIcon state={step.state} />
                    <span className="text-[0.58rem] font-bold uppercase tracking-[0.1em] text-zinc-500">
                      {index + 1}/{pathwaySteps.length}
                    </span>
                  </div>
                  <p
                    className={`text-[0.75rem] font-medium leading-4 ${
                      step.state === "locked" ? "text-zinc-500" : "text-white"
                    }`}
                  >
                    {step.label}
                  </p>
                </li>
              ))}
            </ol>

            {/* Desktop / tablet: 2-col grid */}
            <ol className="mt-2.5 hidden gap-1.5 sm:grid sm:grid-cols-2">
              {pathwaySteps.map((step) => {
                const stepLabel =
                  step.state === "complete"
                    ? "Done"
                    : step.state === "current"
                      ? "In progress"
                      : step.state === "waiting"
                        ? "Up next"
                        : "Locked";

                return (
                  <li
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                      step.state === "complete"
                        ? "border-emerald-400/20 bg-emerald-500/10"
                        : step.state === "current"
                          ? "border-amber-400/25 bg-amber-500/10"
                          : "border-white/[0.06] bg-black/20"
                    }`}
                    key={step.label}
                  >
                    <StepIcon state={step.state} />
                    <p
                      className={`min-w-0 flex-1 truncate text-sm font-medium ${
                        step.state === "locked" ? "text-zinc-500" : "text-white"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p
                      className={`shrink-0 text-[0.58rem] font-semibold uppercase tracking-[0.1em] ${
                        step.state === "complete"
                          ? "text-emerald-300"
                          : step.state === "current"
                            ? "text-amber-200"
                            : "text-zinc-600"
                      }`}
                    >
                      {stepLabel}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>

          {active && status === "needs_info" && application?.reviewNotes ? (
            <div className="mt-4 rounded-xl bg-sky-400/10 px-3 py-3">
              <p className="text-sm font-medium text-sky-50">Admin note</p>
              <p className="mt-1 text-sm leading-5 text-sky-50/80">{application.reviewNotes}</p>
            </div>
          ) : null}

          {active && status === "rejected" && application?.reviewNotes ? (
            <div className="mt-4 rounded-xl bg-red-500/10 px-3 py-3">
              <p className="text-sm font-medium text-red-100">Admin note</p>
              <p className="mt-1 text-sm leading-5 text-red-100/80">{application.reviewNotes}</p>
            </div>
          ) : null}

          <div className="mt-4 flex flex-col gap-2 sm:mt-5 sm:flex-row sm:flex-wrap">
            {status === "approved" ? (
              <Link
                className={actionButtonClass("primary")}
                href={resolveLicenseApplicationHref(application)}
              >
                View license
              </Link>
            ) : status === "pending" ? (
              <>
                <Link className={actionButtonClass("primary")} href={applyHref}>
                  View status
                </Link>
                <Link className={actionButtonClass("secondary")} href={preset.href}>
                  Edit application
                </Link>
              </>
            ) : status === "needs_info" || status === "rejected" ? (
              <Link className={actionButtonClass("primary")} href={preset.href}>
                {status === "needs_info" ? "Update application" : "Resubmit application"}
              </Link>
            ) : (
              <Link className={actionButtonClass("accent")} href={preset.href}>
                Start application
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </article>
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
  const activeProgram = application ? resolveApplicationProgram(application) : null;
  const activeKey = useMemo(() => {
    if (!activeProgram || activeProgram === "legacy") {
      return application ? ("jt1_member" as LicenseProgramPresetKey) : null;
    }
    return activeProgram as LicenseProgramPresetKey;
  }, [activeProgram, application]);

  const [expandedKey, setExpandedKey] = useState<LicenseProgramPresetKey | null>(activeKey);

  useEffect(() => {
    if (activeKey) {
      setExpandedKey(activeKey);
    }
  }, [activeKey]);

  const sortedOptions = useMemo(() => {
    if (!activeKey) {
      return LICENSE_OPTIONS;
    }
    return [...LICENSE_OPTIONS].sort((a, b) => {
      if (a.key === activeKey) return -1;
      if (b.key === activeKey) return 1;
      return 0;
    });
  }, [activeKey]);

  return (
    <section className="space-y-4 sm:space-y-5">
      <div className="px-0.5">
        <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">Apply for a license</h2>
        <p className="mt-1 text-xs leading-5 text-zinc-500 sm:text-sm">
          Tap a credential for requirements, pathway, cost, and progress.
        </p>
      </div>

      <div className="space-y-2 rounded-[1.25rem] border border-white/[0.08] bg-white/[0.03] p-2 sm:space-y-2.5 sm:rounded-[1.75rem] sm:p-3">
        {sortedOptions.map((option) => {
          const active = activeKey === option.key;
          const showSharedRequirements = active || !application;
          return (
            <LicenseOptionCard
              Icon={option.icon}
              active={active}
              application={active ? application : null}
              expanded={expandedKey === option.key}
              key={option.key}
              label={option.label}
              onToggle={() =>
                setExpandedKey((current) => (current === option.key ? null : option.key))
              }
              optionKey={option.key}
              requirements={showSharedRequirements ? requirements : []}
              requirementsPercent={showSharedRequirements ? requirementsPercent : 0}
              steps={active ? steps : []}
            />
          );
        })}
      </div>
    </section>
  );
}
