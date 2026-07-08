"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AdminLicenseAnalyticsPanel,
  AdminMembershipAnalyticsPanel,
  AdminShopAnalyticsPanel,
} from "@/components/profile/AdminAnalyticsPanels";
import { fetchAdminMemberRecords } from "@/lib/admin/member-directory";
import { getAllOrders } from "@/lib/commerce/storage";
import { fetchAllLicenseApplications } from "@/lib/licenses/storage";
import {
  buildAdminLicenseAnalytics,
  buildAdminMembershipAnalytics,
  buildAdminShopAnalytics,
  computeLicenseAnalytics,
  computeMembershipAnalytics,
  type LicenseAnalyticsSnapshot,
  type MembershipAnalyticsSnapshot,
} from "@/lib/profile/admin-analytics";

const emptyMembershipSnapshot: MembershipAnalyticsSnapshot = {
  totalMembers: 0,
  officials: 0,
  activeEvents: 0,
  newSignups: 0,
  verifiedMembers: 0,
};

const emptyLicenseSnapshot: LicenseAnalyticsSnapshot = {
  pendingCount: 0,
  pendingCards: 0,
  needsInfoCount: 0,
  approvedCount: 0,
  approvalRate: null,
};

export function AdminMembershipAnalyticsContent() {
  const [snapshot, setSnapshot] = useState<MembershipAnalyticsSnapshot>(emptyMembershipSnapshot);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void getAllOrders().then((orders) => {
      void fetchAdminMemberRecords(orders).then((records) => {
        setSnapshot(computeMembershipAnalytics(records));
        setLoaded(true);
      });
    });
  }, []);

  const statistics = useMemo(
    () => buildAdminMembershipAnalytics(loaded ? snapshot : emptyMembershipSnapshot),
    [loaded, snapshot],
  );

  return <AdminMembershipAnalyticsPanel statistics={statistics} />;
}

export function AdminLicenseAnalyticsContent() {
  const [snapshot, setSnapshot] = useState<LicenseAnalyticsSnapshot>(emptyLicenseSnapshot);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void fetchAllLicenseApplications().then((applications) => {
      setSnapshot(computeLicenseAnalytics(applications));
      setLoaded(true);
    });
  }, []);

  const statistics = useMemo(
    () => buildAdminLicenseAnalytics(loaded ? snapshot : emptyLicenseSnapshot),
    [loaded, snapshot],
  );

  return <AdminLicenseAnalyticsPanel statistics={statistics} />;
}

export function AdminMembershipLicenseAnalyticsContent() {
  return (
    <div className="space-y-10">
      <AdminMembershipAnalyticsContent />
      <AdminLicenseAnalyticsContent />
    </div>
  );
}

export function AdminShopAnalyticsContent() {
  const [statistics, setStatistics] = useState(() =>
    buildAdminShopAnalytics({
      totalOrders: 0,
      pendingPayment: 0,
      processing: 0,
      delivered: 0,
      revenue: 0,
    }),
  );

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
