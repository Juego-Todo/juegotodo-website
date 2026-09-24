"use client";

import { useState } from "react";
import {
  Award,
  Briefcase,
  Building2,
  ClipboardList,
  Dumbbell,
  Flag,
  IdCard,
  Landmark,
  Lock,
  Scale,
  Shield,
  Swords,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { AuthGateFallback } from "@/components/auth/AuthGateFallback";
import { ProBadge } from "@/components/pro/ProBadge";
import { LICENSE_PROGRAM_PRESETS, type LicenseProgramPresetKey } from "@/data/license-program-presets";
import { PRO_PAGE_PATH } from "@/data/pro-membership";
import { useAuth } from "@/lib/auth/context";
import { useProMembership } from "@/lib/pro/use-pro-membership";

const LICENSE_OPTIONS: {
  key: LicenseProgramPresetKey;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    key: "jt1_member",
    label: "Local Membership",
    description: "JT1 member ID card via the Membership Portal",
    icon: IdCard,
  },
  {
    key: "fighter_license",
    label: "Fighter License",
    description: "Compete in sanctioned JTGC events",
    icon: Swords,
  },
  {
    key: "coach_license",
    label: "Coach License",
    description: "Official coach credential",
    icon: Users,
  },
  {
    key: "senior_coach_license",
    label: "Senior Coach",
    description: "Senior coaching credential",
    icon: Award,
  },
  {
    key: "trainer_license",
    label: "Trainer License",
    description: "Trainer credential",
    icon: Dumbbell,
  },
  {
    key: "referee_license",
    label: "Referee License",
    description: "Official referee credential",
    icon: Flag,
  },
  {
    key: "judge_license",
    label: "Judge License",
    description: "Official judge credential",
    icon: Scale,
  },
  {
    key: "adviser_license",
    label: "Adviser License",
    description: "Adviser credential",
    icon: Briefcase,
  },
  {
    key: "club_owner",
    label: "Club Owner",
    description: "Affiliated club owner credential",
    icon: Building2,
  },
  {
    key: "staff_license",
    label: "Staff License",
    description: "Operations staff credential",
    icon: ClipboardList,
  },
  {
    key: "grand_council_member",
    label: "Grand Council Member",
    description: "Council membership credential",
    icon: Landmark,
  },
  {
    key: "grand_council_officer",
    label: "Grand Council Officer",
    description: "Council officer credential",
    icon: Shield,
  },
];

/** Program chooser for membership + role licenses. */
export function RegisterForLicensePage() {
  const { user, loading } = useAuth();
  const { entitled, loading: proLoading } = useProMembership();
  const [showProModal, setShowProModal] = useState(false);

  if (!user) {
    return (
      <AuthGateFallback
        loading={loading}
        loadingLabel="Loading license registration..."
        redirectHref="/login?next=%2Fregister-for-license"
        user={user}
      />
    );
  }

  return (
    <main className="px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-[0.65rem] font-black uppercase tracking-[0.28em] text-[#FF1010]">Credentials</p>
        <h1 className="font-display mt-3 text-4xl uppercase text-white sm:text-5xl">Register for a License</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
          Choose local membership for your JT1 member ID, or apply for a role license for competition and
          official credentials.
        </p>

        {!proLoading && !entitled ? (
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-[#FFCF6A]/25 bg-[#FFCF6A]/8 px-4 py-3">
            <ProBadge label="PRO REQUIRED" variant="locked" />
            <p className="text-sm text-zinc-300">
              Role licenses need an active JuegoTodo Pro membership. JT1 Local Membership stays open.
            </p>
            <Link
              href={PRO_PAGE_PATH}
              className="ml-auto text-[0.65rem] font-black uppercase tracking-[0.14em] text-[#FFCF6A] hover:underline"
            >
              Get Pro →
            </Link>
          </div>
        ) : null}

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LICENSE_OPTIONS.map((option) => {
            const preset = LICENSE_PROGRAM_PRESETS[option.key];
            const Icon = option.icon;
            const isMembership = option.key === "jt1_member";
            const locked = !isMembership && !entitled && !proLoading;

            if (locked) {
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setShowProModal(true)}
                  className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left opacity-75 transition hover:border-[#FFCF6A]/35 hover:bg-[#FFCF6A]/5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-zinc-500">
                      <Icon size={18} aria-hidden />
                    </span>
                    <ProBadge label="PRO REQUIRED" variant="locked" />
                  </div>
                  <span className="mt-4 text-sm font-bold uppercase tracking-[0.12em] text-zinc-300">
                    {option.label}
                  </span>
                  <span className="mt-1.5 text-xs leading-relaxed text-zinc-600">{option.description}</span>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[0.65rem] font-black uppercase tracking-[0.18em] text-[#FFCF6A]">
                    <Lock size={12} aria-hidden />
                    Unlock with Pro
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={option.key}
                className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-[#FF1010]/40 hover:bg-[#FF1010]/5"
                href={preset.href}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${
                      isMembership
                        ? "border-[#FF1010]/40 bg-[#FF1010]/15 text-red-100"
                        : "border-white/10 bg-black/40 text-zinc-300 group-hover:text-white"
                    }`}
                  >
                    <Icon size={18} aria-hidden />
                  </span>
                  {!isMembership && entitled ? <ProBadge label="AVAILABLE" variant="active" /> : null}
                </div>
                <span className="mt-4 text-sm font-bold uppercase tracking-[0.12em] text-white">
                  {option.label}
                </span>
                <span className="mt-1.5 text-xs leading-relaxed text-zinc-500">{option.description}</span>
                <span className="mt-4 text-[0.65rem] font-black uppercase tracking-[0.18em] text-[#FF1010]">
                  {isMembership ? "Open membership portal →" : "Start application →"}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {showProModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pro-required-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0d0d0d] p-6 shadow-2xl">
            <ProBadge label="PRO REQUIRED" variant="locked" />
            <h2 id="pro-required-title" className="font-display mt-3 text-2xl uppercase text-white">
              Unlock with JuegoTodo Pro
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Role license applications require an active annual Pro membership. JT1 Local Membership does not
              unlock the License Center.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={PRO_PAGE_PATH}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-[#FF1010] px-5 text-xs font-black uppercase tracking-[0.14em] text-white"
              >
                Become a Pro Member
              </Link>
              <button
                type="button"
                onClick={() => setShowProModal(false)}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-5 text-xs font-black uppercase tracking-[0.14em] text-zinc-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
