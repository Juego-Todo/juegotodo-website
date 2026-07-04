"use client";

import { MemberStatisticsRow } from "@/components/profile/MemberPortalPanels";
import type { MemberStatistic } from "@/lib/profile/member-record";

function AnalyticsShell({
  description,
  eyebrow,
  statistics,
  title,
}: {
  description: string;
  eyebrow: string;
  statistics: MemberStatistic[];
  title: string;
}) {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-[0.62rem] font-black uppercase tracking-[0.28em] text-red-200">{eyebrow}</p>
        <h2 className="font-display mt-2 text-3xl uppercase text-white sm:text-4xl">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm text-zinc-400">{description}</p>
      </div>
      <MemberStatisticsRow statistics={statistics} />
    </section>
  );
}

export function AdminMembershipAnalyticsPanel({ statistics }: { statistics: MemberStatistic[] }) {
  return (
    <AnalyticsShell
      description="Platform membership growth, verified accounts, officials, and active event participation."
      eyebrow="Analytics"
      statistics={statistics}
      title="Membership"
    />
  );
}

export function AdminLicenseAnalyticsPanel({ statistics }: { statistics: MemberStatistic[] }) {
  return (
    <AnalyticsShell
      description="License pipeline volume, pending reviews, card issuance, and approval performance."
      eyebrow="Analytics"
      statistics={statistics}
      title="Licenses"
    />
  );
}

export function AdminShopAnalyticsPanel({ statistics }: { statistics: MemberStatistic[] }) {
  return (
    <AnalyticsShell
      description="Commerce activity across the official shop including orders, payments, and fulfillment."
      eyebrow="Analytics"
      statistics={statistics}
      title="Shop Orders"
    />
  );
}
