export type AdminPortalSectionId =
  | "members"
  | "documents"
  | "calendar"
  | "competitions"
  | "events"
  | "officials"
  | "grand-council"
  | "reports"
  | "store-orders"
  | "announcements"
  | "settings";

export type AdminPortalSectionConfig = {
  id: AdminPortalSectionId;
  tag: string;
  title: string;
  description: string;
  placeholder?: string;
};

export const adminPortalSections: Record<AdminPortalSectionId, AdminPortalSectionConfig> = {
  members: {
    id: "members",
    tag: "Administration",
    title: "Member Directory",
    description: "Search members, review account standing, and manage official account type tags.",
  },
  documents: {
    id: "documents",
    tag: "Administration",
    title: "Documents",
    description: "Review credential pipelines, issued licenses, and league document submissions.",
    placeholder: "Centralize member credential files, verification packets, and official document queues here.",
  },
  competitions: {
    id: "competitions",
    tag: "Administration",
    title: "Competitions",
    description: "Manage sanctioned competition entries, bout assignments, and registration approvals.",
    placeholder: "Competition entry review, bracket assignments, and registration oversight will appear here.",
  },
  calendar: {
    id: "calendar",
    tag: "Administration",
    title: "Calendar",
    description: "Create and publish Juego Todo events and competitions for all signed-in members.",
  },
  events: {
    id: "events",
    tag: "Administration",
    title: "Events",
    description: "Schedule sanctioned events, assign officials, and monitor event operations.",
    placeholder: "Event creation, sanctioning, and operational controls will appear here.",
  },
  officials: {
    id: "officials",
    tag: "Administration",
    title: "Officials",
    description: "Manage referees, judges, and assigned officials across JTGC events.",
    placeholder: "Official assignments, ratings, and credential visibility will appear here.",
  },
  "grand-council": {
    id: "grand-council",
    tag: "Administration",
    title: "Grand Council",
    description: "Council governance tools, regional oversight, and league administration.",
    placeholder: "Grand Council committees, regional approvals, and governance workflows will appear here.",
  },
  reports: {
    id: "reports",
    tag: "Administration",
    title: "Reports",
    description: "Platform analytics, license activity, and league operational reports.",
    placeholder: "Operational dashboards and exportable league reports will appear here.",
  },
  "store-orders": {
    id: "store-orders",
    tag: "Commerce",
    title: "Store Orders",
    description: "Review shop orders, approve payments, and update fulfillment status.",
  },
  announcements: {
    id: "announcements",
    tag: "Administration",
    title: "Announcements",
    description: "Publish league announcements and member notifications.",
    placeholder: "Broadcast announcements to members, fighters, and officials from this console.",
  },
  settings: {
    id: "settings",
    tag: "System",
    title: "System Settings",
    description: "Configure platform settings, admin permissions, and league defaults.",
    placeholder: "System configuration and admin controls will appear here.",
  },
};

export function resolveAdminPortalSection(section: string): AdminPortalSectionConfig | null {
  if (section in adminPortalSections) {
    return adminPortalSections[section as AdminPortalSectionId];
  }
  return null;
}
