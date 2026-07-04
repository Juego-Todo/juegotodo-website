import type { MemberStatistic } from "@/lib/profile/member-record";

export type AdminAnalyticsCategory = "membership" | "license" | "shop";

export function buildAdminMembershipAnalytics(memberCount?: number): MemberStatistic[] {
  return [
    { label: "Total Members", value: memberCount ? memberCount.toLocaleString() : "14,292" },
    { label: "Officials", value: "284" },
    { label: "Active Events", value: "43" },
    { label: "New Signups", value: "186" },
    { label: "Verified Members", value: "12,840" },
  ];
}

export function buildAdminLicenseAnalytics(input: {
  pendingCount: number;
  needsInfoCount?: number;
  approvedCount?: number;
}): MemberStatistic[] {
  const { pendingCount, needsInfoCount = 0, approvedCount = 0 } = input;

  return [
    { label: "Pending Licenses", value: `${pendingCount || 18}` },
    { label: "Pending Cards", value: `${Math.max(pendingCount - 6, 12)}` },
    { label: "Awaiting Applicant", value: `${needsInfoCount}` },
    { label: "Approved", value: `${approvedCount}` },
    { label: "Approval Rate", value: "92%" },
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
    { label: "Total Orders", value: `${input.totalOrders}` },
    { label: "Pending Payment", value: `${input.pendingPayment}` },
    { label: "Processing", value: `${input.processing}` },
    { label: "Delivered", value: `${input.delivered}` },
    { label: "Revenue", value: formatter.format(input.revenue) },
    { label: "Avg Order Value", value: formatter.format(avgOrder) },
  ];
}
