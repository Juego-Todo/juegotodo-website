import type { LicenseApplication } from "@/data/license-applications";
import { events } from "@/data/site";
import type { UserTypeTagId } from "@/data/user-type-tags";
import type { AdminMemberRecord } from "@/lib/admin/member-directory";
import { getAllCalendarEntries } from "@/lib/calendar/storage";
import type { MemberStatistic } from "@/lib/profile/member-record";

export type AdminAnalyticsCategory = "membership" | "license" | "shop";

const OFFICIAL_TAG_IDS = new Set<UserTypeTagId>([
  "referee",
  "judge",
  "coach",
  "staff",
  "adviser",
  "grand_council_member",
  "grandmaster",
]);

const SIGNUP_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export type MembershipAnalyticsSnapshot = {
  totalMembers: number;
  officials: number;
  activeEvents: number;
  newSignups: number;
  verifiedMembers: number;
};

export type LicenseAnalyticsSnapshot = {
  pendingCount: number;
  pendingCards: number;
  needsInfoCount: number;
  approvedCount: number;
  approvalRate: number | null;
};

function formatCount(value: number) {
  return value.toLocaleString();
}

function formatPercent(value: number | null) {
  if (value === null) {
    return "—";
  }

  return `${value}%`;
}

export function computeMembershipAnalytics(members: AdminMemberRecord[]): MembershipAnalyticsSnapshot {
  const now = Date.now();

  const newSignups = members.filter((member) => {
    const createdAt = new Date(member.createdAt).getTime();
    return !Number.isNaN(createdAt) && now - createdAt <= SIGNUP_WINDOW_MS;
  }).length;

  const officials = members.filter((member) =>
    member.tags.some((tag) => OFFICIAL_TAG_IDS.has(tag)),
  ).length;

  const verifiedMembers = members.filter((member) => member.licenseStatus === "Approved").length;

  const calendarUpcoming = getAllCalendarEntries(false).filter((entry) => entry.status === "Upcoming").length;
  const siteUpcoming = events.filter((event) => event.status === "Upcoming").length;
  const activeEvents = Math.max(calendarUpcoming, siteUpcoming);

  return {
    totalMembers: members.length,
    officials,
    activeEvents,
    newSignups,
    verifiedMembers,
  };
}

export function computeLicenseAnalytics(applications: LicenseApplication[]): LicenseAnalyticsSnapshot {
  const pending = applications.filter((application) => application.status === "pending");
  const needsInfo = applications.filter((application) => application.status === "needs_info");
  const approved = applications.filter((application) => application.status === "approved");
  const rejected = applications.filter((application) => application.status === "rejected");

  const pendingCards = pending.filter((application) => Boolean(application.uploads.profilePhoto?.trim())).length;
  const reviewed = approved.length + rejected.length;
  const approvalRate = reviewed > 0 ? Math.round((approved.length / reviewed) * 100) : null;

  return {
    pendingCount: pending.length,
    pendingCards,
    needsInfoCount: needsInfo.length,
    approvedCount: approved.length,
    approvalRate,
  };
}

export function buildAdminMembershipAnalytics(snapshot: MembershipAnalyticsSnapshot): MemberStatistic[] {
  return [
    { label: "Total Members", value: formatCount(snapshot.totalMembers) },
    { label: "Officials", value: formatCount(snapshot.officials) },
    { label: "Active Events", value: formatCount(snapshot.activeEvents) },
    { label: "New Signups", value: formatCount(snapshot.newSignups) },
    { label: "Verified Members", value: formatCount(snapshot.verifiedMembers) },
  ];
}

export function buildAdminLicenseAnalytics(snapshot: LicenseAnalyticsSnapshot): MemberStatistic[] {
  return [
    { label: "Pending Licenses", value: formatCount(snapshot.pendingCount) },
    { label: "Pending Cards", value: formatCount(snapshot.pendingCards) },
    { label: "Awaiting Applicant", value: formatCount(snapshot.needsInfoCount) },
    { label: "Approved", value: formatCount(snapshot.approvedCount) },
    { label: "Approval Rate", value: formatPercent(snapshot.approvalRate) },
  ];
}

export function buildAdminShopAnalytics(input: {
  totalOrders: number;
  pendingPayment: number;
  processing: number;
  delivered: number;
  revenue: number;
}): MemberStatistic[] {
  const formatter = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  });

  const avgOrder = input.totalOrders > 0 ? input.revenue / input.totalOrders : 0;

  return [
    { label: "Total Orders", value: formatCount(input.totalOrders) },
    { label: "Pending Payment", value: formatCount(input.pendingPayment) },
    { label: "Processing", value: formatCount(input.processing) },
    { label: "Delivered", value: formatCount(input.delivered) },
    { label: "Revenue", value: formatter.format(input.revenue) },
    { label: "Avg Order Value", value: formatter.format(avgOrder) },
  ];
}
