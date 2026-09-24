"use client";

import {
  Award,
  Briefcase,
  Building2,
  ClipboardList,
  Dumbbell,
  Flag,
  IdCard,
  Landmark,
  Scale,
  Shield,
  Swords,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { AuthGateFallback } from "@/components/auth/AuthGateFallback";
import { LICENSE_PROGRAM_PRESETS, type LicenseProgramPresetKey } from "@/data/license-program-presets";
import { useAuth } from "@/lib/auth/context";

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

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LICENSE_OPTIONS.map((option) => {
            const preset = LICENSE_PROGRAM_PRESETS[option.key];
            const Icon = option.icon;
            const isMembership = option.key === "jt1_member";

            return (
              <Link
                key={option.key}
                className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-[#FF1010]/40 hover:bg-[#FF1010]/5"
                href={preset.href}
              >
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${
                    isMembership
                      ? "border-[#FF1010]/40 bg-[#FF1010]/15 text-red-100"
                      : "border-white/10 bg-black/40 text-zinc-300 group-hover:text-white"
                  }`}
                >
                  <Icon size={18} aria-hidden />
                </span>
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
    </main>
  );
}
