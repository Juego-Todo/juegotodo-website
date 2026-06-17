import {
  Award,
  Baby,
  Feather,
  Hand,
  Shield,
  Star,
  Trophy,
  UserRound,
  Users,
  Wind,
  Zap,
} from "lucide-react";

export const jtgcWeightClasses = [
  { label: "Flyweight", icon: Feather },
  { label: "Bantamweight", icon: Hand },
  { label: "Featherweight", icon: Wind },
  { label: "Lightweight", icon: Zap },
] as const;

export const jtgcSystems = [
  { label: "Amateur", icon: Shield },
  { label: "Semi", icon: Award },
  { label: "Pro", icon: Star },
  { label: "Championships", icon: Trophy },
] as const;

export const jtgcAgeDivisions = [
  {
    label: "Kids",
    detail: "5–11 years old",
    icon: Baby,
  },
  {
    label: "Teens (Minors)",
    detail: "12–17 years old",
    icon: Users,
  },
  {
    label: "Amateur (Adults)",
    detail: "18 years old and above",
    icon: UserRound,
  },
] as const;

export const jtgcCompetitionLevels = [
  {
    label: "Championship Division",
    detail:
      "Open to qualified fighters based on ranking, record, and sanctioning rules (not strictly age-based)",
    icon: Trophy,
  },
] as const;
