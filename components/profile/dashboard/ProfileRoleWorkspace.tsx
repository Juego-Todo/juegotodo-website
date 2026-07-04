"use client";

import type { MemberRecord } from "@/lib/profile/member-record";
import { workspaceTitle } from "@/lib/profile/mission-control";

export function ProfileRoleWorkspace({ memberRecord }: { memberRecord: MemberRecord }) {
  const role = memberRecord.roleModule;

  return (
    <section className="space-y-5">
      <div>
        <p className={`text-[0.62rem] font-black uppercase tracking-[0.28em] ${role.accentClass}`}>Role Workspace</p>
        <h2 className="font-display mt-2 text-3xl uppercase text-white sm:text-4xl">{workspaceTitle(role.kind)}</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {role.careerSnapshot.map((item) => (
          <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.02] px-5 py-4" key={item.label}>
            <p className="text-xl" aria-hidden>
              {item.icon}
            </p>
            <p className="mt-3 text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-500">{item.label}</p>
            <p className="mt-1 text-lg font-semibold text-white">{item.value}</p>
            {item.detail ? <p className="mt-1 text-xs text-zinc-500">{item.detail}</p> : null}
          </div>
        ))}

        {role.secondaryStats.map((stat) => (
          <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.02] px-5 py-4" key={stat.label}>
            <p className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-500">{stat.label}</p>
            <p className="mt-2 text-lg font-semibold text-white">{stat.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
