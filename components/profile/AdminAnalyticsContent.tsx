"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AdminLicenseAnalyticsPanel,
  AdminMembershipAnalyticsPanel,
  AdminShopAnalyticsPanel,
} from "@/components/profile/AdminAnalyticsPanels";
import {
  buildAdminLicenseAnalytics,
  buildAdminMembershipAnalytics,
  buildAdminShopAnalytics,
} from "@/lib/profile/admin-analytics";
import { fetchAdminMemberRecords } from "@/lib/admin/member-directory";
import { getAllOrders } from "@/lib/commerce/storage";
import { fetchAllLicenseApplications } from "@/lib/licenses/storage";

export function AdminMembershipAnalyticsContent() {
  const [memberCount, setMemberCount] = useState<number | undefined>();

  useEffect(() => {
    void getAllOrders().then((orders) => {
      void fetchAdminMemberRecords(orders).then((records) => {
        setMemberCount(records.length);
      });
    });
  }, []);

  const statistics = useMemo(() => buildAdminMembershipAnalytics(memberCount), [memberCount]);

  return <AdminMembershipAnalyticsPanel statistics={statistics} />;
}

export function AdminLicenseAnalyticsContent({ pendingLicenseCount }: { pendingLicenseCount: number }) {
  const [needsInfoCount, setNeedsInfoCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);

  useEffect(() => {
    void fetchAllLicenseApplications().then((applications) => {
      setNeedsInfoCount(applications.filter((application) => application.status === "needs_info").length);
      setApprovedCount(applications.filter((application) => application.status === "approved").length);
    });
  }, []);

  const statistics = useMemo(
    () =>
      buildAdminLicenseAnalytics({
        pendingCount: pendingLicenseCount,
        needsInfoCount,
        approvedCount,
      }),
    [pendingLicenseCount, needsInfoCount, approvedCount],
  );

  return <AdminLicenseAnalyticsPanel statistics={statistics} />;
}

export function AdminMembershipLicenseAnalyticsContent({
  pendingLicenseCount,
}: {
  pendingLicenseCount: number;
}) {
  return (
    <div className="space-y-10">
      <AdminMembershipAnalyticsContent />
      <AdminLicenseAnalyticsContent pendingLicenseCount={pendingLicenseCount} />
    </div>
  );
}

export function AdminShopAnalyticsContent() {
  const [statistics, setStatistics] = useState(() => buildAdminShopAnalytics({
    totalOrders: 0,
    pendingPayment: 0,
    processing: 0,
    delivered: 0,
    revenue: 0,
  }));

  useEffect(() => {
    void getAllOrders().then((orders) => {
      const pendingPayment = orders.filter((order) => order.payment.status === "pending").length;
      const processing = orders.filter((order) =>
        ["payment_received", "processing", "packed", "shipped"].includes(order.status),
      ).length;
      const delivered = orders.filter((order) => order.status === "delivered").length;
      const revenue = orders.reduce((sum, order) => sum + order.total, 0);

      setStatistics(
        buildAdminShopAnalytics({
          totalOrders: orders.length,
          pendingPayment,
          processing,
          delivered,
          revenue,
        }),
      );
    });
  }, []);

  return <AdminShopAnalyticsPanel statistics={statistics} />;
}
