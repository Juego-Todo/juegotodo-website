"use client";

import { Check, Circle, Clock3, Lock, X } from "lucide-react";
import type { MemberRecord, MemberProgressStep, MemberVerificationItem } from "@/lib/profile/member-record";
import type { ProfileRoleModule } from "@/lib/profile/role-modules";

export function OfficialIdentityPanel({
  record,
  roleModule,
  accountTypeLabel,
}: {
  record: MemberRecord["officialRecord"];
  roleModule: ProfileRoleModule;
  accountTypeLabel: string;
}) {
  const universalFields = [
    { label: "Name", value: roleModule.displayName },
    { label: "Member ID", value: roleModule.memberId },
    { label: "Status", value: roleModule.statusBadge },
    { label: "Role", value: roleModule.roleTitle },
  ];

  const credentialFields =
    record.issueDate !== "—" || record.expirationDate !== "—"
      ? [
          { label: "License", value: record.licenseLabel },
          { label: "Issue Date", value: record.issueDate },
          { label: "Expiration", value: record.expirationDate },
          { label: "Account Type", value: accountTypeLabel },
        ]
      : [{ label: "Account Type", value: accountTypeLabel }];

  return (
    <section className="glass-panel rounded-[1.75rem] p-5 sm:p-8">
      <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#FF1010]">Official Record</p>
      <h2 className="font-display mt-2 text-4xl uppercase text-white sm:text-5xl">Official Identity</h2>
      <p className="mt-2 text-sm text-zinc-400">Issued by Juego Todo Grand Council. This record is read-only.</p>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        {universalFields.map((field) => (
          <div className="rounded-2xl border border-white/10 bg-black/35 p-4" key={field.label}>
            <dt className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">{field.label}</dt>
            <dd className="mt-2 text-sm font-semibold text-white">{field.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 border-t border-white/10 pt-6">
        <p className={`text-[0.62rem] font-black uppercase tracking-[0.2em] ${roleModule.accentClass}`}>
          {roleModule.kind === "community" ? "Community Profile" : "Role Information"}
        </p>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roleModule.stats.map((field) => (
            <div className="rounded-2xl border border-white/10 bg-black/35 p-4" key={field.label}>
              <dt className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">{field.label}</dt>
              <dd className="mt-2 text-sm font-semibold text-white">{field.value}</dd>
            </div>
          ))}
        </dl>
        {roleModule.secondaryStats.length > 0 ? (
          <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {roleModule.secondaryStats.map((field) => (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/25 p-4" key={field.label}>
                <dt className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">{field.label}</dt>
                <dd className="mt-2 text-sm font-semibold text-white">{field.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>

      {credentialFields.length > 0 ? (
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {credentialFields.map((field) => (
            <div className="rounded-2xl border border-white/10 bg-black/35 p-4" key={field.label}>
              <dt className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">{field.label}</dt>
              <dd className="mt-2 text-sm font-semibold text-white">{field.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}

export function RequirementsPanel({
  requirements,
  percent,
}: {
  requirements: MemberRecord["requirements"];
  percent: number;
}) {
  return (
    <section className="rounded-[1.75rem] border border-white/[0.08] bg-white/[0.03] p-6 sm:p-7">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-white">Requirements</h3>
          <p className="mt-1 text-sm text-zinc-500">What you need before review.</p>
        </div>
        <p className="text-2xl font-semibold tabular-nums text-white">{percent}%</p>
      </div>
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-[#FF1010] transition-all" style={{ width: `${percent}%` }} />
      </div>
      <ul className="mt-5 divide-y divide-white/[0.06]">
        {requirements.map((item) => (
          <li className="flex items-center justify-between gap-3 py-3 text-sm" key={item.label}>
            <span className={item.complete ? "text-zinc-300" : "text-zinc-500"}>{item.label}</span>
            {item.complete ? (
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                <Check size={14} aria-hidden />
              </span>
            ) : (
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-zinc-600">
                <X size={14} aria-hidden />
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function VerificationPanel({ items }: { items: MemberVerificationItem[] }) {
  return (
    <section className="glass-panel rounded-[1.5rem] p-5">
      <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-zinc-500">Verification</p>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li className="flex items-center justify-between gap-3 text-sm" key={item.label}>
            <span className="text-zinc-300">{item.label}</span>
            <StatusPill status={item.status} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function LicenseProgressPanel({ steps }: { steps: MemberProgressStep[] }) {
  return (
    <section className="rounded-[1.75rem] border border-white/[0.08] bg-white/[0.03] p-6 sm:p-7">
      <h2 className="text-xl font-semibold tracking-tight text-white">License Progress</h2>
      <p className="mt-1 text-sm text-zinc-500">Follow each step from application to card.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-zinc-400">
          About 3–5 business days
        </span>
        <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-zinc-400">
          Est. ₱3,500 / year
        </span>
      </div>

      <ol className="mt-7">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const label =
            step.state === "complete"
              ? "Done"
              : step.state === "current"
                ? "In progress"
                : step.state === "waiting"
                  ? "Up next"
                  : "Locked";

          return (
            <li className="relative flex gap-4 pb-6 last:pb-0" key={step.label}>
              {!isLast ? (
                <span
                  className={`absolute left-[0.7rem] top-7 h-[calc(100%-0.75rem)] w-px ${
                    step.state === "complete" ? "bg-emerald-400/40" : "bg-white/10"
                  }`}
                  aria-hidden
                />
              ) : null}
              <ProgressIcon state={step.state} />
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-baseline justify-between gap-3">
                  <p
                    className={`text-[0.95rem] font-medium ${
                      step.state === "locked" ? "text-zinc-500" : "text-white"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p
                    className={`shrink-0 text-xs ${
                      step.state === "complete"
                        ? "text-emerald-300"
                        : step.state === "current"
                          ? "text-amber-200"
                          : "text-zinc-600"
                    }`}
                  >
                    {label}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function MembershipTimelinePanel({ timeline }: { timeline: MemberRecord["timeline"] }) {
  return (
    <section className="glass-panel rounded-[1.5rem] p-5">
      <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-zinc-500">Membership Timeline</p>
      <ol className="mt-4 space-y-0">
        {timeline.map((entry, index) => (
          <li className="relative flex gap-3 pb-5 last:pb-0" key={`${entry.label}-${entry.date}`}>
            {index < timeline.length - 1 ? (
              <span className="absolute left-[0.45rem] top-5 h-full w-px bg-white/10" aria-hidden />
            ) : null}
            <span
              className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                entry.state === "complete"
                  ? "bg-emerald-400"
                  : entry.state === "current"
                    ? "bg-[#FF1010]"
                    : "bg-zinc-600"
              }`}
            />
            <div>
              <p className="text-sm font-semibold text-white">{entry.label}</p>
              <p className="text-xs text-zinc-500">{entry.date}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function MemberActivityPanel({ activity }: { activity: MemberRecord["activity"] }) {
  return (
    <section className="glass-panel rounded-[1.5rem] p-5">
      <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-zinc-500">Member History</p>
      <ul className="mt-4 space-y-3">
        {activity.map((entry) => (
          <li className="border-b border-white/5 pb-3 last:border-0 last:pb-0" key={`${entry.label}-${entry.date}`}>
            <p className="text-sm font-semibold text-white">{entry.label}</p>
            <p className="text-xs text-zinc-500">{entry.date}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AdminPermissionsPanel({ permissions }: { permissions: MemberRecord["adminPermissions"] }) {
  if (permissions.length === 0) {
    return null;
  }

  return (
    <section className="glass-panel rounded-[1.5rem] border border-amber-500/20 p-5">
      <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-amber-200">Permissions</p>
      <ul className="mt-4 space-y-2">
        {permissions.map((permission) => (
          <li className="flex items-center gap-2 text-sm text-amber-50/90" key={permission.label}>
            <Check className="text-emerald-300" size={14} aria-hidden />
            {permission.label}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function MemberStatisticsRow({ statistics }: { statistics: MemberRecord["statistics"] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {statistics.map((stat) => (
        <div className="glass-panel rounded-2xl p-4" key={stat.label}>
          <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">{stat.label}</p>
          <p className="font-display mt-2 text-3xl uppercase text-white">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

function StatusPill({ status }: { status: MemberVerificationItem["status"] }) {
  const label =
    status === "verified"
      ? "Verified"
      : status === "approved"
        ? "Approved"
        : status === "pending"
          ? "Pending"
          : "Not Submitted";

  const className =
    status === "verified" || status === "approved"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
      : status === "pending"
        ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
        : "border-white/10 bg-white/5 text-zinc-400";

  return (
    <span className={`rounded-full border px-2.5 py-1 text-[0.58rem] font-black uppercase tracking-[0.12em] ${className}`}>
      {label}
    </span>
  );
}

function ProgressIcon({ state }: { state: MemberProgressStep["state"] }) {
  if (state === "complete") {
    return (
      <span className="relative z-[1] inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
        <Check size={13} strokeWidth={2.5} aria-hidden />
      </span>
    );
  }
  if (state === "current") {
    return (
      <span className="relative z-[1] inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400/20 ring-2 ring-amber-300/70">
        <Clock3 className="text-amber-200" size={13} aria-hidden />
      </span>
    );
  }
  if (state === "waiting") {
    return (
      <span className="relative z-[1] inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black">
        <Circle className="text-zinc-400" size={10} aria-hidden />
      </span>
    );
  }
  return (
    <span className="relative z-[1] inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black">
      <Lock className="text-zinc-600" size={12} aria-hidden />
    </span>
  );
}
