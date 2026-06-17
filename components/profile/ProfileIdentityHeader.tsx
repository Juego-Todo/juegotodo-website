"use client";

import { CheckCircle2 } from "lucide-react";
import { RoleBadge, VerificationBadge } from "@/components/profile/RoleBadge";
import { JtgcMemberIdCard } from "@/components/profile/JtgcMemberIdCard";
import type { ProfileIdentity } from "@/lib/profile/identity";
import { getVerificationLabel } from "@/lib/profile/identity";
import type { UserProfile } from "@/lib/auth/types";

export function ProfileIdentityHeader({
  user,
  identity,
  initials,
}: {
  user: UserProfile;
  identity: ProfileIdentity;
  initials: string;
}) {
  const bannerTone = identity.athlete?.bannerTone ?? "from-red-950/90 via-black/80 to-zinc-950/90";

  return (
    <div className="glass-panel overflow-hidden rounded-[1.75rem]">
      <div className={`relative bg-gradient-to-br ${bannerTone}`}>
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,16,16,0.35),transparent_32%),linear-gradient(90deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.55)_45%,rgba(0,0,0,0.2)_100%)]"
          aria-hidden
        />
        <div
          className="absolute inset-y-0 right-0 hidden w-[42%] bg-[radial-gradient(circle_at_70%_50%,rgba(255,16,16,0.25),transparent_55%),linear-gradient(270deg,rgba(255,16,16,0.08),transparent)] opacity-80 lg:block"
          aria-hidden
        />

        <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-[#FF1010]/70 bg-black/50 shadow-[0_0_40px_rgba(255,16,16,0.35)] sm:h-32 sm:w-32">
              <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_35%_18%,rgba(255,16,16,0.45),transparent_38%),linear-gradient(145deg,#27272a,#050505)] font-display text-4xl text-white">
                {initials}
              </div>
              {identity.verifications.includes("verified_athlete") ? (
                <span className="absolute bottom-1 right-1 rounded-full bg-[#FF1010] p-1 text-white">
                  <CheckCircle2 size={14} aria-hidden />
                </span>
              ) : null}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {identity.verifications.map((verification) => (
                  <VerificationBadge key={verification} label={getVerificationLabel(verification)} />
                ))}
              </div>
              <h1 className="font-display mt-3 text-4xl uppercase leading-none text-white sm:text-6xl lg:text-7xl">
                {user.fullName}
                {identity.verifications.length > 0 ? (
                  <span className="ml-2 inline-block text-emerald-300">✓</span>
                ) : null}
              </h1>
              <div className="mt-3 flex flex-wrap gap-2">
                {identity.roles.map((roleId) => (
                  <RoleBadge key={roleId} roleId={roleId} />
                ))}
              </div>
              <p className="mt-3 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-300">
                🇵🇭 {identity.athlete?.region ?? user.city ?? "Philippines"}
                {identity.athlete?.country ? `, ${identity.athlete.country}` : ""}
              </p>
            </div>
          </div>

          <JtgcMemberIdCard identity={identity} user={user} />
        </div>
      </div>
    </div>
  );
}
