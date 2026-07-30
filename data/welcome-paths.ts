import type { AccountType } from "@/lib/auth/types";
import type { LucideIcon } from "lucide-react";
import { Building2, Swords, UserRound, Users } from "lucide-react";

export type WelcomePathId = "member" | "fighter" | "coach" | "gym";

export type WelcomePath = {
  id: WelcomePathId;
  title: string;
  description: string;
  href: string;
  accountType?: AccountType;
  icon: LucideIcon;
  accent: string;
};

export const welcomePaths: WelcomePath[] = [
  {
    id: "member",
    title: "Member Portal",
    description: "Explore your profile, membership, tickets, and community tools.",
    href: "/profile",
    icon: UserRound,
    accent: "from-zinc-500/20 to-transparent",
  },
  {
    id: "fighter",
    title: "Fighter License",
    description: "Apply for your official JTGC fighter license and competition pathway.",
    href: "/register-for-license/fighter",
    accountType: "athlete",
    icon: Swords,
    accent: "from-[#FF1010]/25 to-transparent",
  },
  {
    id: "coach",
    title: "Coach License",
    description: "Register as a coach and manage athletes under your team.",
    href: "/register-for-license/coach",
    accountType: "coach",
    icon: Users,
    accent: "from-amber-500/20 to-transparent",
  },
  {
    id: "gym",
    title: "Club / Gym",
    description: "Register your club or gym and connect fighters to your house.",
    href: "/register-for-license/club-owner",
    accountType: "gym_owner",
    icon: Building2,
    accent: "from-sky-500/20 to-transparent",
  },
];

/** Paths that already express intent — skip the welcome chooser. */
export function shouldSkipWelcomeChooser(nextPath: string) {
  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return false;
  }

  if (nextPath === "/profile" || nextPath.startsWith("/profile?")) {
    return false;
  }

  if (nextPath === "/welcome" || nextPath.startsWith("/welcome?")) {
    return false;
  }

  return true;
}
