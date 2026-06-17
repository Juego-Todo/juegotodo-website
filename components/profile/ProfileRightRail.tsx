"use client";

import Link from "next/link";
import type { ProfileIdentity } from "@/lib/profile/identity";
import { getJtgcTierLabel } from "@/lib/profile/identity";
import type { MembershipTier } from "@/lib/commerce/types";

export function ProfileRightRail({
  identity,
  membershipTier,
  onCompleteProfile,
}: {
  identity: ProfileIdentity;
  membershipTier: MembershipTier;
  onCompleteProfile?: () => void;
}) {
  const tierLabel = identity.roles.includes("grand_council")
    ? "Grand Council"
    : getJtgcTierLabel(membershipTier);

  return (
    <aside className="space-y-4">
      <div className="glass-panel rounded-[1.5rem] p-5">
        <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-zinc-500">Profile Completion</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0">
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
              <circle className="text-white/10" cx="18" cy="18" fill="none" r="15.5" stroke="currentColor" strokeWidth="3" />
              <circle
                className="text-[#FF1010]"
                cx="18"
                cy="18"
                fill="none"
                r="15.5"
                stroke="currentColor"
                strokeDasharray={`${identity.profileCompletion} 100`}
                strokeLinecap="round"
                strokeWidth="3"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-display text-xl text-white">
              {identity.profileCompletion}%
            </span>
          </div>
          <div>
            <p className="text-sm text-zinc-400">Complete your league credential for full visibility.</p>
            {onCompleteProfile ? (
              <button
                className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-red-200 hover:text-white"
                onClick={onCompleteProfile}
                type="button"
              >
                Complete Profile →
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-[1.5rem] p-5">
        <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-zinc-500">JTGC Member</p>
        <p className="font-display mt-2 text-3xl uppercase text-white">{tierLabel}</p>
        <ul className="mt-4 space-y-2 text-sm text-zinc-400">
          <li>Exclusive league content</li>
          <li>Early event access</li>
          <li>Official credential visibility</li>
        </ul>
        <Link className="mt-4 inline-flex text-xs font-black uppercase tracking-[0.16em] text-red-200" href="/registration">
          Upgrade Tier →
        </Link>
      </div>

      {identity.athlete?.achievements.length ? (
        <div className="glass-panel rounded-[1.5rem] p-5">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-zinc-500">Recent Honors</p>
          <ul className="mt-4 space-y-2">
            {identity.athlete.achievements.slice(0, 4).map((item) => (
              <li className="flex items-center gap-2 text-sm text-white" key={item}>
                <span aria-hidden>🏆</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="glass-panel rounded-[1.5rem] p-5">
        <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-zinc-500">Recent Activity</p>
        <ul className="mt-4 space-y-3">
          {identity.recentActivity.map((entry) => (
            <li className="border-b border-white/5 pb-3 last:border-0 last:pb-0" key={`${entry.label}-${entry.date}`}>
              <p className="text-sm font-semibold text-white">{entry.label}</p>
              <p className="text-xs text-zinc-500">{entry.date}</p>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
