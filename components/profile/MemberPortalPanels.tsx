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
    <section className="glass-panel rounded-[1.5rem] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-zinc-500">Requirements</p>
          <h3 className="font-display mt-2 text-3xl uppercase text-white">Profile</h3>
        </div>
        <p className="font-display text-3xl text-[#FF1010]">{percent}%</p>
      </div>
      <ul className="mt-4 space-y-2">
        {requirements.map((item) => (
          <li className="flex items-center gap-2 text-sm text-zinc-300" key={item.label}>
            {item.complete ? (
              <Check className="text-emerald-400" size={16} aria-hidden />
            ) : (
              <X className="text-red-400" size={16} aria-hidden />
            )}
            {item.label}
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
    <section className="glass-panel rounded-[1.75rem] p-5 sm:p-8">
      <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#FF1010]">License Progress</p>
      <h2 className="font-display mt-2 text-4xl uppercase text-white sm:text-5xl">Credential Pipeline</h2>
      <ol className="mt-6 space-y-3">
        {steps.map((step) => (
          <li className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3" key={step.label}>
            <ProgressIcon state={step.state} />
            <span className="flex-1 text-sm font-semibold text-white">{step.label}</span>
            <span className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-500">
              {step.state === "complete"
                ? "Complete"
                : step.state === "current"
                  ? "In Review"
                  : step.state === "waiting"
                    ? "Waiting"
                    : "Locked"}
            </span>
          </li>
        ))}
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
    return <Check className="text-emerald-400" size={18} aria-hidden />;
  }
  if (state === "current") {
    return <Clock3 className="text-amber-300" size={18} aria-hidden />;
  }
  if (state === "waiting") {
    return <Circle className="text-zinc-500" size={18} aria-hidden />;
  }
  return <Lock className="text-zinc-600" size={18} aria-hidden />;
}
