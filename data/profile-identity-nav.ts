import {
  Award,
  BarChart3,
  Crown,
  Flag,
  Gavel,
  History,
  LayoutDashboard,
  Shield,
  Swords,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ProfileSectionId } from "@/components/profile/ProfileSidebarNav";
import type { UserTypeTagId } from "@/data/user-type-tags";

export type IdentityNavItem = {
  id: ProfileSectionId;
  label: string;
  icon: LucideIcon;
  requiredTags: UserTypeTagId[];
};

export type IdentityNavLink = {
  label: string;
  icon: LucideIcon;
  href: string;
  requiredTags: UserTypeTagId[];
};

const baseIdentityNav: IdentityNavItem[] = [{ id: "profile", label: "Profile", icon: UserRound, requiredTags: [] }];

const tagIdentityNav: IdentityNavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, requiredTags: ["fighter"] },
  { id: "fighter", label: "Fighter Profile", icon: Swords, requiredTags: ["fighter"] },
  { id: "record", label: "Record & Stats", icon: BarChart3, requiredTags: ["fighter"] },
  { id: "history", label: "Fight History", icon: History, requiredTags: ["fighter"] },
  { id: "achievements", label: "Achievements", icon: Award, requiredTags: ["fighter"] },
  { id: "coach-tools", label: "Coach Tools", icon: Users, requiredTags: ["coach", "grandmaster"] },
  { id: "official-tools", label: "Official Tools", icon: Flag, requiredTags: ["referee"] },
  { id: "judge-tools", label: "Judge Tools", icon: Gavel, requiredTags: ["judge"] },
  { id: "council-tools", label: "Council Tools", icon: Crown, requiredTags: ["grand_council_member"] },
  { id: "staff-tools", label: "Staff Tools", icon: Shield, requiredTags: ["staff"] },
];

export const identityNavLinks: IdentityNavLink[] = [
  { label: "Admin Panel", icon: Shield, href: "/admin", requiredTags: ["admin"] },
];

function hasRequiredTag(tagIds: UserTypeTagId[], requiredTags: UserTypeTagId[]) {
  if (requiredTags.length === 0) {
    return true;
  }

  return requiredTags.some((tag) => tagIds.includes(tag));
}

export function resolveIdentityNavItems(tagIds: UserTypeTagId[]): IdentityNavItem[] {
  const items = [...baseIdentityNav];

  tagIdentityNav.forEach((item) => {
    if (hasRequiredTag(tagIds, item.requiredTags)) {
      items.push(item);
    }
  });

  return items;
}

export function resolveIdentityNavLinks(tagIds: UserTypeTagId[]): IdentityNavLink[] {
  return identityNavLinks.filter((link) => hasRequiredTag(tagIds, link.requiredTags));
}

export function hasFighterIdentityAccess(tagIds: UserTypeTagId[]) {
  return tagIds.includes("fighter");
}
