import {
  BadgeCheck,
  Crown,
  Flag,
  Gavel,
  Megaphone,
  Shield,
  Swords,
  Trophy,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

export type ProfileRoleId =
  | "fan"
  | "fighter"
  | "coach"
  | "referee"
  | "judge"
  | "event_official"
  | "gym_owner"
  | "media"
  | "sponsor"
  | "grand_council"
  | "administrator";

export type ProfileRole = {
  id: ProfileRoleId;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  borderColor: string;
  backgroundColor: string;
  icon: LucideIcon;
};

export const profileRoles: Record<ProfileRoleId, ProfileRole> = {
  fan: {
    id: "fan",
    label: "Fan Member",
    shortLabel: "FAN",
    description: "Official JTGC community member with access to events, shop, and league content.",
    color: "text-zinc-200",
    borderColor: "border-zinc-400/40",
    backgroundColor: "bg-zinc-500/15",
    icon: UserRound,
  },
  fighter: {
    id: "fighter",
    label: "Fighter",
    shortLabel: "FIGHTER",
    description: "Verified JTGC competitor with an official ranking, record, and athlete credential.",
    color: "text-red-200",
    borderColor: "border-red-500/50",
    backgroundColor: "bg-red-600/20",
    icon: Swords,
  },
  coach: {
    id: "coach",
    label: "Coach",
    shortLabel: "COACH",
    description: "Certified coach affiliated with an official JTGC team or gym.",
    color: "text-sky-200",
    borderColor: "border-sky-500/50",
    backgroundColor: "bg-sky-600/20",
    icon: Users,
  },
  referee: {
    id: "referee",
    label: "Referee",
    shortLabel: "REFEREE",
    description: "Sanctioned JTGC referee cleared for official league competition.",
    color: "text-amber-200",
    borderColor: "border-amber-400/50",
    backgroundColor: "bg-amber-500/15",
    icon: Flag,
  },
  judge: {
    id: "judge",
    label: "Judge",
    shortLabel: "JUDGE",
    description: "Official JTGC judge assigned to scoring and bout oversight.",
    color: "text-yellow-200",
    borderColor: "border-yellow-400/50",
    backgroundColor: "bg-yellow-500/15",
    icon: Gavel,
  },
  event_official: {
    id: "event_official",
    label: "Event Official",
    shortLabel: "OFFICIAL",
    description: "League operations staff supporting sanctioned events and fight weeks.",
    color: "text-orange-200",
    borderColor: "border-orange-400/50",
    backgroundColor: "bg-orange-500/15",
    icon: Shield,
  },
  gym_owner: {
    id: "gym_owner",
    label: "Gym Owner",
    shortLabel: "GYM",
    description: "Affiliated gym operator within the JTGC regional ecosystem.",
    color: "text-emerald-200",
    borderColor: "border-emerald-500/50",
    backgroundColor: "bg-emerald-600/15",
    icon: Trophy,
  },
  media: {
    id: "media",
    label: "Media",
    shortLabel: "MEDIA",
    description: "Accredited media partner covering JTGC events and athletes.",
    color: "text-cyan-200",
    borderColor: "border-cyan-500/50",
    backgroundColor: "bg-cyan-600/15",
    icon: Megaphone,
  },
  sponsor: {
    id: "sponsor",
    label: "Sponsor",
    shortLabel: "SPONSOR",
    description: "Commercial partner supporting JTGC events, teams, or athletes.",
    color: "text-pink-200",
    borderColor: "border-pink-500/50",
    backgroundColor: "bg-pink-600/15",
    icon: BadgeCheck,
  },
  grand_council: {
    id: "grand_council",
    label: "Grand Council",
    shortLabel: "GRAND COUNCIL",
    description: "JTGC governance leadership with league-wide authority and oversight.",
    color: "text-violet-200",
    borderColor: "border-violet-500/50",
    backgroundColor: "bg-violet-600/20",
    icon: Crown,
  },
  administrator: {
    id: "administrator",
    label: "Administrator",
    shortLabel: "ADMIN",
    description: "Platform administrator with commerce, credential, and league operations access.",
    color: "text-white",
    borderColor: "border-white/50",
    backgroundColor: "bg-white/10",
    icon: Shield,
  },
};

export type VerificationId =
  | "verified_athlete"
  | "verified_coach"
  | "verified_referee"
  | "verified_gym"
  | "verified_official";

export const verificationLabels: Record<VerificationId, string> = {
  verified_athlete: "Verified Athlete",
  verified_coach: "Verified Coach",
  verified_referee: "Verified Referee",
  verified_gym: "Verified Gym",
  verified_official: "Verified Official",
};

export const jtgcTierLabels = {
  free: "Fan Tier",
  pro: "Athlete Tier",
  elite: "Professional Tier",
} as const;
