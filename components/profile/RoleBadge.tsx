"use client";

import type { ProfileRoleId } from "@/data/profile-roles";
import { getRoleMeta } from "@/lib/profile/identity";

export function RoleBadge({ roleId }: { roleId: ProfileRoleId }) {
  const role = getRoleMeta(roleId);
  const Icon = role.icon;

  return (
    <span
      className={`group relative inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em] ${role.borderColor} ${role.backgroundColor} ${role.color}`}
      title={role.description}
    >
      <Icon size={12} aria-hidden />
      {role.shortLabel}
      <span className="pointer-events-none absolute left-1/2 top-[calc(100%+0.5rem)] z-20 hidden w-56 -translate-x-1/2 rounded-xl border border-white/10 bg-[#0a0a0a]/95 p-3 text-[0.68rem] normal-case leading-5 tracking-normal text-zinc-300 shadow-xl group-hover:block">
        <span className="block text-[0.62rem] font-black uppercase tracking-[0.16em] text-white">{role.label}</span>
        {role.description}
      </span>
    </span>
  );
}

export function VerificationBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[0.62rem] font-black uppercase tracking-[0.14em] text-emerald-200">
      ✓ {label}
    </span>
  );
}
