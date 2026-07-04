"use client";

import { formatUsername } from "@/lib/auth/username";
import type { MemberRecord } from "@/lib/profile/member-record";
import type { UserProfile } from "@/lib/auth/types";

export function ProfileAdminUserCard({
  user,
  memberRecord,
}: {
  user: UserProfile;
  memberRecord: MemberRecord;
}) {
  const role = memberRecord.roleModule;

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-black to-black p-5">
      <h2 className="font-display text-3xl uppercase leading-none text-white">{user.fullName}</h2>
      <p className="mt-2 text-sm font-semibold tracking-[0.08em] text-zinc-400">{formatUsername(user.username)}</p>
      <p className="mt-1 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-400">{role.roleTitle}</p>
    </section>
  );
}
