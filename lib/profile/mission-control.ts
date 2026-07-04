import type { ProfileSectionId } from "@/components/profile/ProfileSidebarNav";
import type { MemberRecord } from "@/lib/profile/member-record";
import type { ProfileRoleKind, ProfileRoleModule } from "@/lib/profile/role-modules";

export type WorkspaceTabId =
  | "overview"
  | "camp"
  | "activity"
  | "documents"
  | "analytics"
  | "membership-analytics"
  | "shop-analytics"
  | "calendar"
  | "achievements"
  | "page-access"
  | "settings";

export type MobileTabId = "dashboard" | "career" | "credential" | "activity" | "settings";

export type MissionItem = {
  id: string;
  label: string;
  headline: string;
  detail: string;
  actionLabel: string;
  href?: string;
  section?: ProfileSectionId;
  urgent?: boolean;
};

export type StoryKpi = {
  label: string;
  value: string;
  detail?: string;
  href?: string;
  section?: ProfileSectionId;
};

export type CommandAction = {
  id: string;
  label: string;
  keywords: string[];
  href?: string;
  section?: ProfileSectionId;
  tab?: WorkspaceTabId;
};

export const workspaceTabs: { id: WorkspaceTabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "activity", label: "Activity" },
  { id: "documents", label: "Documents" },
  { id: "analytics", label: "Analytics" },
  { id: "achievements", label: "Achievements" },
  { id: "settings", label: "Settings" },
];

export const adminWorkspaceTabs: { id: WorkspaceTabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "activity", label: "Administration" },
  { id: "membership-analytics", label: "Analytics" },
  { id: "shop-analytics", label: "Shop Orders" },
  { id: "calendar", label: "Calendar" },
  { id: "page-access", label: "Page Access" },
  { id: "settings", label: "Settings" },
];

export const fighterWorkspaceTabs: { id: WorkspaceTabId; label: string }[] = [
  { id: "overview", label: "Profile" },
  { id: "camp", label: "Dashboard" },
  { id: "documents", label: "Documents" },
  { id: "settings", label: "Settings" },
];

export const mobileTabs: { id: MobileTabId; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "career", label: "Career" },
  { id: "credential", label: "Credential" },
  { id: "activity", label: "Activity" },
  { id: "settings", label: "Settings" },
];

export function mobileTabToWorkspace(tab: MobileTabId): WorkspaceTabId {
  switch (tab) {
    case "dashboard":
      return "overview";
    case "career":
      return "camp";
    case "credential":
      return "overview";
    case "activity":
      return "activity";
    case "settings":
      return "settings";
  }
}

export function buildMissionItems(role: ProfileRoleModule, memberRecord: MemberRecord): MissionItem[] {
  const pending = memberRecord.statistics.find((s) => s.label.includes("Pending"))?.value ?? "0";

  switch (role.kind) {
    case "admin":
      return [
        {
          id: "licenses",
          label: "Pending Licenses",
          headline: pending,
          detail: "3 waiting today",
          actionLabel: "View Queue",
          href: "/profile?tab=membership&view=approvals",
          urgent: Number.parseInt(pending.replace(/\D/g, ""), 10) > 0,
        },
        {
          id: "cards",
          label: "Pending Cards",
          headline: "12",
          detail: "Ready for issuance",
          actionLabel: "Issue Cards",
          href: "/profile?tab=membership&view=approvals",
        },
        {
          id: "events",
          label: "Events Today",
          headline: "5",
          detail: "2 require final review",
          actionLabel: "Open Calendar",
          href: "/profile?tab=calendar",
        },
      ];
    case "fighter":
      return [
        {
          id: "fight",
          label: "Next Fight",
          headline: "7 Days",
          detail: "Ascension Manila · Aug 22",
          actionLabel: "View Bout",
          section: "fighter",
          urgent: true,
        },
        {
          id: "weight",
          label: "Weight Check",
          headline: "Tomorrow",
          detail: "Welterweight · 170 lbs",
          actionLabel: "Upload Medical",
          section: "medical",
        },
        {
          id: "medical",
          label: "Medical Clearance",
          headline: role.secondaryStats.find((s) => s.label === "Medical")?.value ?? "Valid",
          detail: "Expires in 94 days",
          actionLabel: "View Status",
          section: "medical",
        },
      ];
    case "coach":
      return [
        {
          id: "corner",
          label: "Student Fighting Tonight",
          headline: "1 Bout",
          detail: "Regional Open · 8:00 PM",
          actionLabel: "View Corner",
          section: "coach-tools",
          urgent: true,
        },
        {
          id: "students",
          label: "Active Students",
          headline: role.stats[0]?.value ?? "48",
          detail: "4 competing this week",
          actionLabel: "Manage Students",
          section: "coach-tools",
        },
        {
          id: "seminar",
          label: "Upcoming Seminar",
          headline: "Saturday",
          detail: "Striking intensive · Cebu",
          actionLabel: "Register",
          section: "calendar",
        },
      ];
    case "grandmaster":
      return [
        {
          id: "seminar",
          label: "Next Seminar",
          headline: "Saturday",
          detail: "38 registered",
          actionLabel: "View Roster",
          section: "calendar",
        },
        {
          id: "students",
          label: "Students Certified",
          headline: "48",
          detail: "This quarter",
          actionLabel: "View Lineage",
          section: "achievements",
        },
      ];
    default:
      return role.careerSnapshot.slice(0, 3).map((item, index) => ({
        id: `mission-${index}`,
        label: item.label,
        headline: item.value,
        detail: item.detail ?? "Updated recently",
        actionLabel: "Open",
        section: role.quickLinks[index]?.section,
        href: role.quickLinks[index]?.href,
      }));
  }
}

export function buildStoryKpis(role: ProfileRoleModule): StoryKpi[] {
  return role.stats.slice(0, 4).map((stat) => ({
    label: stat.label,
    value: stat.value,
    detail: stat.tone === "pending" ? "Action required" : stat.tone === "verified" ? "Verified" : undefined,
  }));
}

export function buildCommandActions(role: ProfileRoleModule, isAdmin: boolean): CommandAction[] {
  const memberCredentialActions: CommandAction[] = isAdmin
    ? []
    : [
        { id: "credential", label: "View Digital Credential", keywords: ["credential", "wallet", "card", "id"], tab: "overview" },
        { id: "documents", label: "View Documents", keywords: ["documents", "license", "upload"], tab: "documents" },
      ];

  const base: CommandAction[] = [
    { id: "search-member", label: "Search Member", keywords: ["member", "directory", "find"], href: "/admin/members" },
    { id: "open-reports", label: "Open Reports", keywords: ["reports", "analytics"], href: "/admin/reports" },
    { id: "view-pending", label: "View Pending Licenses", keywords: ["license", "approve", "pending"], href: "/profile?tab=membership&view=approvals" },
    { id: "issue-card", label: "Issue Card", keywords: ["card", "credential", "id"], href: "/profile?tab=membership&view=approvals" },
    { id: "calendar", label: "Open Calendar", keywords: ["calendar", "events"], href: "/calendar" },
    { id: "shop", label: "Browse Shop", keywords: ["shop", "gear", "merch"], href: "/shop" },
    { id: "settings", label: "Open Settings", keywords: ["settings", "account"], tab: "settings" },
    ...memberCredentialActions,
  ];

  const roleActions: CommandAction[] = role.quickLinks.map((link, index) => ({
    id: `role-${index}`,
    label: link.label,
    keywords: link.label.toLowerCase().split(/\s+/),
    href: link.href,
    section: link.section,
  }));

  if (isAdmin) {
    return [
      { id: "approve", label: "Approve Licenses", keywords: ["approve", "license"], href: "/profile?tab=membership&view=approvals" },
      { id: "create-event", label: "Create Event", keywords: ["event", "calendar", "schedule"], tab: "calendar" },
      { id: "create-seminar", label: "Create Seminar", keywords: ["seminar", "clinic", "training"], tab: "calendar" },
      ...base.map((action) =>
        action.id === "calendar" ? { ...action, href: undefined, tab: "calendar" as const } : action,
      ),
      ...roleActions,
    ];
  }

  if (role.kind === "fighter") {
    return [
      { id: "register-event", label: "Register for Event", keywords: ["register", "competition"], section: "competition-entries" },
      { id: "upload-medical", label: "Upload Medical", keywords: ["medical", "clearance"], section: "medical" },
      { id: "rankings", label: "View Rankings", keywords: ["rank", "ranking"], section: "rankings" },
      ...base.filter((a) => !a.href?.startsWith("/admin")),
      ...roleActions,
    ];
  }

  return [...base.filter((a) => !a.href?.startsWith("/admin")), ...roleActions];
}

export function workspaceTitle(kind: ProfileRoleKind): string {
  switch (kind) {
    case "admin":
      return "Platform Operations";
    case "fighter":
      return "Fight Career";
    case "coach":
      return "Coaching Workspace";
    case "grandmaster":
      return "Grand Master Legacy";
    case "referee":
    case "judge":
      return "Official Assignments";
    case "club_owner":
      return "Club Operations";
    case "grand_council":
      return "Council Governance";
    default:
      return "Member Workspace";
  }
}
