import { adminPortalSections } from "@/data/admin-portal-sections";
import type { AdminPermission } from "@/lib/profile/member-record";

export type AdminPageAccessLevel = "Full Access" | "Read Only" | "Restricted" | "No Access";

export type AdminPageAccessEntry = {
  id: string;
  page: string;
  route: string;
  category: string;
  description: string;
  requiredPermission?: string;
};

const profileWorkspacePages: AdminPageAccessEntry[] = [
  {
    id: "profile-overview",
    page: "Overview",
    route: "/profile",
    category: "Profile Workspace",
    description: "Mission control, platform operations, and admin dashboard summary.",
  },
  {
    id: "profile-membership",
    page: "Administration",
    route: "/profile?tab=membership",
    category: "Profile Workspace",
    description: "Membership administration entry point with directory and approvals workspaces.",
    requiredPermission: "Can Review Licenses",
  },
  {
    id: "profile-members-directory",
    page: "Members Directory",
    route: "/profile?tab=membership&view=members",
    category: "Profile Workspace",
    description: "Searchable registry of every registered platform member.",
    requiredPermission: "Can Review Licenses",
  },
  {
    id: "profile-license-approvals",
    page: "License Approvals",
    route: "/profile?tab=membership&view=approvals",
    category: "Profile Workspace",
    description: "Pending and submitted license application review queue.",
    requiredPermission: "Can Review Licenses",
  },
  {
    id: "profile-membership-analytics",
    page: "Analytics",
    route: "/profile?tab=membership-analytics",
    category: "Profile Workspace",
    description: "Member growth, license pipeline volume, pending reviews, and approval performance.",
    requiredPermission: "Can Review Licenses",
  },
  {
    id: "profile-shop-analytics",
    page: "Shop Orders Analytics",
    route: "/profile",
    category: "Profile Workspace",
    description: "Commerce activity, order fulfillment, and shop revenue metrics.",
    requiredPermission: "Can Manage Shop",
  },
  {
    id: "profile-permissions",
    page: "Permissions",
    route: "/profile",
    category: "Profile Workspace",
    description: "Administrator capability flags, available inside Settings.",
  },
  {
    id: "profile-calendar",
    page: "Calendar",
    route: "/profile?tab=calendar",
    category: "Profile Workspace",
    description: "Event scheduling, calendar views, and platform event management.",
  },
  {
    id: "profile-page-access",
    page: "Page Access",
    route: "/profile",
    category: "Profile Workspace",
    description: "Route-level access map for profile and admin console pages.",
  },
  {
    id: "profile-settings",
    page: "Settings",
    route: "/profile",
    category: "Profile Workspace",
    description: "Account preferences and profile configuration.",
  },
];

const adminConsolePages: AdminPageAccessEntry[] = [
  {
    id: "admin-home",
    page: "Admin Console",
    route: "/admin",
    category: "Admin Console",
    description: "Central administration hub and platform operations entry point.",
  },
  {
    id: "admin-license-review",
    page: "License Application Review",
    route: "/admin/license-approvals/[applicationId]",
    category: "Admin Console",
    description: "Inspect applicant submissions, attachments, and approval actions.",
    requiredPermission: "Can Review Licenses",
  },
  ...Object.values(adminPortalSections).map((section) => ({
    id: `admin-${section.id}`,
    page: section.title,
    route: `/admin/${section.id}`,
    category: "Admin Console",
    description: section.description,
    requiredPermission: resolveSectionPermission(section.id),
  })),
];

const publicSitePages: AdminPageAccessEntry[] = [
  { id: "public-calendar", page: "Calendar", route: "/calendar", category: "Public Site", description: "League calendar and published events." },
  { id: "public-fighters", page: "Fighters", route: "/fighters", category: "Public Site", description: "Public fighter profiles and rankings.", requiredPermission: undefined },
  { id: "public-events", page: "Events", route: "/events", category: "Public Site", description: "Sanctioned event listings and fight cards." },
  { id: "public-shop", page: "Shop", route: "/shop", category: "Public Site", description: "Official merchandise and league gear.", requiredPermission: "Can Manage Shop" },
  { id: "public-teams", page: "Teams", route: "/teams", category: "Public Site", description: "Affiliated gyms and team profiles." },
  { id: "public-register", page: "Register For License", route: "/register-for-license", category: "Public Site", description: "Public license registration entry flows." },
];

function resolveSectionPermission(sectionId: string): string | undefined {
  switch (sectionId) {
    case "members":
    case "documents":
      return "Can Review Licenses";
    case "calendar":
    case "competitions":
    case "events":
      return "Can Edit Events";
    case "officials":
      return "Can Create Officials";
    case "store-orders":
      return "Can Manage Shop";
    case "reports":
    case "announcements":
    case "grand-council":
    case "settings":
      return undefined;
    default:
      return undefined;
  }
}

function permissionEnabled(permissions: AdminPermission[], label?: string) {
  if (!label) {
    return true;
  }

  const match = permissions.find((permission) => permission.label === label);
  return match?.enabled ?? false;
}

function resolveAccessLevel(
  permissions: AdminPermission[],
  entry: AdminPageAccessEntry,
  isAdmin: boolean,
): AdminPageAccessLevel {
  if (!isAdmin) {
    return "No Access";
  }

  if (!entry.requiredPermission) {
    return "Full Access";
  }

  return permissionEnabled(permissions, entry.requiredPermission) ? "Full Access" : "No Access";
}

export function buildAdminPageAccessList(input: {
  isAdmin: boolean;
  permissions: AdminPermission[];
}): Array<AdminPageAccessEntry & { access: AdminPageAccessLevel }> {
  const entries = [...profileWorkspacePages, ...adminConsolePages, ...publicSitePages];

  return entries.map((entry) => ({
    ...entry,
    access: resolveAccessLevel(input.permissions, entry, input.isAdmin),
  }));
}

export function adminPageAccessTone(access: AdminPageAccessLevel): string {
  switch (access) {
    case "Full Access":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
    case "Read Only":
      return "border-sky-500/30 bg-sky-500/10 text-sky-200";
    case "Restricted":
      return "border-amber-500/30 bg-amber-500/10 text-amber-200";
    case "No Access":
      return "border-red-500/30 bg-red-500/10 text-red-200";
  }
}
