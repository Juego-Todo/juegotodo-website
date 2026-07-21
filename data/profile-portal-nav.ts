import {
  Award,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  CreditCard,
  FileBadge2,
  FileText,
  Flag,
  Gavel,
  Heart,
  History,
  IdCard,
  LayoutDashboard,
  Package,
  Settings,
  Shield,
  ShoppingBag,
  Star,
  Swords,
  Users,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { ProfileSectionId } from "@/components/profile/ProfileSidebarNav";
import type { UserTypeTagId } from "@/data/user-type-tags";

export type PortalNavItem = {
  id: ProfileSectionId;
  label: string;
  icon: LucideIcon;
  badge?: number;
  href?: string;
};

export type PortalNavGroup = {
  label: string;
  items: PortalNavItem[];
};

const memberCoreNav: PortalNavItem[] = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "calendar", label: "Calendar", icon: CalendarDays, href: "/calendar" },
  { id: "membership", label: "My Membership", icon: UserRound },
  { id: "licenses", label: "Licenses", icon: FileBadge2 },
  { id: "important-documents", label: "Important Documents", icon: FileText },
  { id: "digital-id", label: "Digital ID", icon: IdCard },
  { id: "certificates", label: "Certificates", icon: Award },
  { id: "club", label: "Club", icon: Building2 },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

const adminPortalNav: PortalNavItem[] = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "admin-members", label: "Member Directory", icon: Users, href: "/profile?tab=licenses&view=members" },
  { id: "admin-licenses", label: "License Approvals", icon: FileBadge2, href: "/profile?tab=licenses&view=approvals" },
  { id: "important-documents", label: "Documents", icon: FileText, href: "/admin/documents" },
  { id: "calendar", label: "Calendar", icon: CalendarDays, href: "/admin/calendar" },
  { id: "official-tools", label: "Officials", icon: Flag, href: "/admin/officials" },
  { id: "council-tools", label: "Grand Council", icon: Shield, href: "/admin/grand-council" },
  { id: "admin-reports", label: "Reports", icon: BarChart3, href: "/admin/reports" },
  { id: "orders", label: "Store Orders", icon: ShoppingBag, href: "/admin/store-orders" },
  { id: "notifications", label: "Announcements", icon: Bell, href: "/admin/announcements" },
  { id: "settings", label: "System Settings", icon: Settings, href: "/admin/settings" },
];

const fighterNav: PortalNavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "calendar", label: "Calendar", icon: CalendarDays, href: "/calendar" },
  { id: "digital-id", label: "Digital License", icon: IdCard },
  { id: "important-documents", label: "Important Documents", icon: FileText },
  { id: "record", label: "Fight Record", icon: BarChart3 },
  { id: "medical", label: "Medical", icon: FileBadge2 },
  { id: "fighter", label: "Weight Class", icon: Swords },
  { id: "coach-tools", label: "Coach / Team", icon: Users },
  { id: "rankings", label: "Rankings", icon: Star },
  { id: "achievements", label: "Achievements", icon: Award },
];

const coachNav: PortalNavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "calendar", label: "Calendar", icon: CalendarDays, href: "/calendar" },
  { id: "coach-tools", label: "Students", icon: Users },
  { id: "important-documents", label: "Important Documents", icon: FileText },
  { id: "club", label: "Club", icon: Building2 },
  { id: "certificates", label: "Certifications", icon: Award },
  { id: "licenses", label: "License", icon: FileBadge2 },
];

const refereeNav: PortalNavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "calendar", label: "Calendar", icon: CalendarDays, href: "/calendar" },
  { id: "important-documents", label: "Important Documents", icon: FileText },
  { id: "certificates", label: "Certifications", icon: Award },
  { id: "official-tools", label: "Rulebooks", icon: Flag },
  { id: "rankings", label: "Ratings", icon: Star },
  { id: "licenses", label: "Assignments", icon: FileBadge2 },
];

const judgeNav: PortalNavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "calendar", label: "Calendar", icon: CalendarDays, href: "/calendar" },
  { id: "important-documents", label: "Important Documents", icon: FileText },
  { id: "judge-tools", label: "Assignments", icon: Gavel },
  { id: "certificates", label: "Scores Submitted", icon: Award },
  { id: "licenses", label: "License", icon: FileBadge2 },
];

const councilNav: PortalNavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "important-documents", label: "Important Documents", icon: FileText },
  { id: "council-tools", label: "Council Members", icon: Shield },
  { id: "club", label: "Regions", icon: Building2 },
  { id: "certificates", label: "Committees", icon: Award },
  { id: "admin-licenses", label: "Approvals", icon: FileBadge2, href: "/profile?tab=licenses&view=approvals" },
  { id: "admin-reports", label: "Reports", icon: BarChart3, href: "/admin" },
];

const fanExtras: PortalNavItem[] = [
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "saved-fighters", label: "Saved Fighters", icon: Star },
  { id: "saved-teams", label: "Saved Teams", icon: Shield },
  { id: "history", label: "Activity", icon: History },
];

function hasTag(tagIds: UserTypeTagId[], tag: UserTypeTagId) {
  return tagIds.includes(tag);
}

function dedupeNavItems(items: PortalNavItem[]) {
  const seen = new Set<ProfileSectionId>();
  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
}

export function resolvePortalNavigation(input: {
  tagIds: UserTypeTagId[];
  isAdmin: boolean;
  unreadCount: number;
  pendingLicenseCount?: number;
}): PortalNavGroup[] {
  const { tagIds, isAdmin, unreadCount, pendingLicenseCount = 0 } = input;

  if (isAdmin) {
    return [
      {
        label: "Administration",
        items: adminPortalNav.map((item) => {
          if (item.id === "notifications") {
            return { ...item, badge: unreadCount };
          }
          if (item.id === "admin-licenses") {
            return { ...item, badge: pendingLicenseCount > 0 ? pendingLicenseCount : undefined };
          }
          return item;
        }),
      },
    ];
  }

  let primaryItems: PortalNavItem[] = [...memberCoreNav];

  if (hasTag(tagIds, "fighter")) {
    primaryItems = dedupeNavItems([
      ...fighterNav,
      ...memberCoreNav.filter((item) =>
        ["payments", "settings", "important-documents"].includes(item.id),
      ),
    ]);
  } else if (hasTag(tagIds, "coach") || hasTag(tagIds, "grandmaster")) {
    primaryItems = dedupeNavItems([
      ...coachNav,
      ...memberCoreNav.filter((item) =>
        ["payments", "notifications", "settings", "important-documents"].includes(item.id),
      ),
    ]);
  } else if (hasTag(tagIds, "referee")) {
    primaryItems = dedupeNavItems([
      ...refereeNav,
      ...memberCoreNav.filter((item) => ["payments", "settings", "important-documents"].includes(item.id)),
    ]);
  } else if (hasTag(tagIds, "judge")) {
    primaryItems = dedupeNavItems([
      ...judgeNav,
      ...memberCoreNav.filter((item) => ["payments", "settings", "important-documents"].includes(item.id)),
    ]);
  } else if (hasTag(tagIds, "grand_council_member")) {
    primaryItems = dedupeNavItems([
      ...councilNav,
      ...memberCoreNav.filter((item) => ["settings", "important-documents"].includes(item.id)),
    ]);
  }

  const groups: PortalNavGroup[] = [
    {
      label: "Member Portal",
      items: primaryItems.map((item) =>
        item.id === "notifications" ? { ...item, badge: unreadCount } : item,
      ),
    },
  ];

  if (tagIds.includes("regular_member") || tagIds.length <= 1) {
    groups.push({
      label: "Community",
      items: fanExtras,
    });
  }

  return groups;
}
