import type { LucideIcon } from "lucide-react";
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
} from "lucide-react";
import type { LicenseProgramPresetKey } from "@/data/license-program-presets";

export type LicenseCenterCategoryId =
  | "membership"
  | "athlete"
  | "coaching"
  | "officiating"
  | "professional"
  | "organization"
  | "governance";

export type LicenseCenterCategory = {
  id: LicenseCenterCategoryId;
  label: string;
};

/** Presentation-only grouping — not a database model. */
export const LICENSE_CENTER_CATEGORIES: LicenseCenterCategory[] = [
  { id: "membership", label: "Membership" },
  { id: "athlete", label: "Athlete" },
  { id: "coaching", label: "Coaching" },
  { id: "officiating", label: "Officiating" },
  { id: "professional", label: "Professional" },
  { id: "organization", label: "Organization" },
  { id: "governance", label: "Governance" },
];

export type LicenseCenterCatalogItem = {
  key: LicenseProgramPresetKey;
  label: string;
  shortDescription: string;
  category: LicenseCenterCategoryId;
  icon: LucideIcon;
  /** JT1 membership stays open without Pro. */
  requiresPro: boolean;
};

export const LICENSE_CENTER_CATALOG: LicenseCenterCatalogItem[] = [
  {
    key: "jt1_member",
    label: "Member License",
    shortDescription: "JT1 local membership ID via the Membership Portal",
    category: "membership",
    icon: IdCard,
    requiresPro: false,
  },
  {
    key: "fighter_license",
    label: "Fighter License",
    shortDescription: "Competition athlete",
    category: "athlete",
    icon: Swords,
    requiresPro: true,
  },
  {
    key: "coach_license",
    label: "Coach License",
    shortDescription: "Team coaching credential",
    category: "coaching",
    icon: Users,
    requiresPro: true,
  },
  {
    key: "senior_coach_license",
    label: "Senior Coach",
    shortDescription: "Elite coaching credential",
    category: "coaching",
    icon: Award,
    requiresPro: true,
  },
  {
    key: "trainer_license",
    label: "Trainer License",
    shortDescription: "Training camp credential",
    category: "coaching",
    icon: Dumbbell,
    requiresPro: true,
  },
  {
    key: "referee_license",
    label: "Referee License",
    shortDescription: "Event officiating",
    category: "officiating",
    icon: Flag,
    requiresPro: true,
  },
  {
    key: "judge_license",
    label: "Judge License",
    shortDescription: "Scoring officials",
    category: "officiating",
    icon: Scale,
    requiresPro: true,
  },
  {
    key: "adviser_license",
    label: "Adviser License",
    shortDescription: "Professional adviser",
    category: "professional",
    icon: Briefcase,
    requiresPro: true,
  },
  {
    key: "club_owner",
    label: "Club Owner",
    shortDescription: "Affiliated gym / club",
    category: "organization",
    icon: Building2,
    requiresPro: true,
  },
  {
    key: "staff_license",
    label: "Staff License",
    shortDescription: "League operations",
    category: "organization",
    icon: ClipboardList,
    requiresPro: true,
  },
  {
    key: "grand_council_member",
    label: "Grand Council Member",
    shortDescription: "Council membership",
    category: "governance",
    icon: Landmark,
    requiresPro: true,
  },
  {
    key: "grand_council_officer",
    label: "Grand Council Officer",
    shortDescription: "Council officer",
    category: "governance",
    icon: Shield,
    requiresPro: true,
  },
];
