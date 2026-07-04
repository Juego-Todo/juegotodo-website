"use client";

import Link from "next/link";
import {
  AdminPermissionsPanel,
  MemberStatisticsRow,
  OfficialIdentityPanel,
} from "@/components/profile/MemberPortalPanels";
import type { ProfileSectionId } from "@/components/profile/ProfileSidebarNav";
import type { MemberRecord } from "@/lib/profile/member-record";
import type { ProfileRoleModule } from "@/lib/profile/role-modules";

export function ProfileOverviewShell({
  memberRecord,
  onNavigate,
}: {
  memberRecord: MemberRecord;
  onNavigate: (section: ProfileSectionId) => void;
}) {
  const role = memberRecord.roleModule;

  return (
    <div className="space-y-6">
      <OfficialIdentityPanel
        accountTypeLabel={memberRecord.accountTypeLabel}
        record={memberRecord.officialRecord}
        roleModule={role}
      />

      <ProfileStatisticsModule role={role} statistics={memberRecord.statistics} />

      {role.careerSnapshot.length > 0 ? (
        <ProfileCareerModule items={role.careerSnapshot} role={role} />
      ) : null}

      <ProfileActivityModule activity={memberRecord.activity} role={role} />

      {role.quickLinks.length > 0 ? (
        <ProfilePermissionsModule isAdmin={memberRecord.isAdmin} onNavigate={onNavigate} role={role} />
      ) : null}

      {memberRecord.isAdmin ? <AdminPermissionsPanel permissions={memberRecord.adminPermissions} /> : null}
    </div>
  );
}

function ProfileStatisticsModule({
  role,
  statistics,
}: {
  role: ProfileRoleModule;
  statistics: MemberRecord["statistics"];
}) {
  const title =
    role.kind === "admin"
      ? "Platform Operations"
      : role.kind === "community"
        ? "Community Activity"
        : "Career Statistics";

  return (
    <section className="glass-panel rounded-[1.75rem] p-5 sm:p-8">
      <p className={`text-[0.62rem] font-black uppercase tracking-[0.2em] ${role.accentClass}`}>Statistics Module</p>
      <h2 className="font-display mt-2 text-3xl uppercase text-white sm:text-4xl">{title}</h2>
      <div className="mt-6">
        <MemberStatisticsRow statistics={statistics} />
      </div>
    </section>
  );
}

function ProfileCareerModule({
  role,
  items,
}: {
  role: ProfileRoleModule;
  items: ProfileRoleModule["careerSnapshot"];
}) {
  return (
    <section className="glass-panel rounded-[1.75rem] p-5 sm:p-8">
      <p className={`text-[0.62rem] font-black uppercase tracking-[0.2em] ${role.accentClass}`}>Career Module</p>
      <h2 className="font-display mt-2 text-3xl uppercase text-white sm:text-4xl">Career Snapshot</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <div className="rounded-2xl border border-white/10 bg-black/35 p-4" key={item.label}>
            <p className="text-2xl" aria-hidden>
              {item.icon}
            </p>
            <p className="mt-2 text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-500">{item.label}</p>
            <p className="mt-1 text-sm font-semibold text-white">{item.value}</p>
            {item.detail ? <p className="mt-1 text-xs text-zinc-500">{item.detail}</p> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function ProfileActivityModule({
  role,
  activity,
}: {
  role: ProfileRoleModule;
  activity: MemberRecord["activity"];
}) {
  const title =
    role.kind === "admin"
      ? "Recent Platform Activity"
      : role.kind === "fighter" || role.kind === "coach"
        ? "Career Activity"
        : "Member Activity";

  return (
    <section className="glass-panel rounded-[1.75rem] p-5 sm:p-8">
      <p className={`text-[0.62rem] font-black uppercase tracking-[0.2em] ${role.accentClass}`}>Activity Module</p>
      <h2 className="font-display mt-2 text-3xl uppercase text-white sm:text-4xl">{title}</h2>
      <ul className="mt-6 space-y-3">
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

function ProfilePermissionsModule({
  role,
  isAdmin,
  onNavigate,
}: {
  role: ProfileRoleModule;
  isAdmin: boolean;
  onNavigate: (section: ProfileSectionId) => void;
}) {
  const title = isAdmin
    ? "Admin Console"
    : role.kind === "community"
      ? "Community Rewards"
      : role.kind === "fighter"
        ? "Career Overview"
        : "Quick Access";

  return (
    <section className="glass-panel rounded-[1.75rem] p-5 sm:p-8">
      <p className={`text-[0.62rem] font-black uppercase tracking-[0.2em] ${role.accentClass}`}>Permissions Module</p>
      <h2 className="font-display mt-2 text-3xl uppercase text-white sm:text-4xl">{title}</h2>
      <div className="mt-6 flex flex-wrap gap-2">
        {role.quickLinks.map((link) =>
          link.href ? (
            <Link
              className="rounded-full border border-white/15 bg-black/35 px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white transition hover:border-red-500/40"
              href={link.href}
              key={link.label}
            >
              {link.label}
            </Link>
          ) : (
            <button
              className="rounded-full border border-white/15 bg-black/35 px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white transition hover:border-red-500/40"
              key={link.label}
              onClick={() => link.section && onNavigate(link.section)}
              type="button"
            >
              {link.label}
            </button>
          ),
        )}
      </div>
    </section>
  );
}
