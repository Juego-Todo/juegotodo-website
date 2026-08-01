"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  ClipboardList,
  CreditCard,
  FileBadge2,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchAdminMemberRecords } from "@/lib/admin/member-directory";
import { getAllOrders } from "@/lib/commerce/storage";
import { fetchAllLicenseApplications } from "@/lib/licenses/storage";
import { computeLicenseAnalytics, computeMembershipAnalytics } from "@/lib/profile/admin-analytics";

type PendingTask = {
  id: string;
  label: string;
  count: number;
  detail: string;
  href: string;
  actionLabel: string;
  icon: LucideIcon;
  urgent: boolean;
};

type PendingSnapshot = {
  pendingLicenses: number;
  needsInfoLicenses: number;
  pendingPayments: number;
  awaitingVerification: number;
  newMembers: number;
  unverifiedMembers: number;
  totalMembers: number;
};

const emptySnapshot: PendingSnapshot = {
  pendingLicenses: 0,
  needsInfoLicenses: 0,
  pendingPayments: 0,
  awaitingVerification: 0,
  newMembers: 0,
  unverifiedMembers: 0,
  totalMembers: 0,
};

function buildTasks(snapshot: PendingSnapshot): PendingTask[] {
  return [
    {
      id: "licenses",
      label: "Pending Licenses",
      count: snapshot.pendingLicenses,
      detail:
        snapshot.pendingLicenses === 0
          ? "Queue is clear"
          : `${snapshot.pendingLicenses} application${snapshot.pendingLicenses === 1 ? "" : "s"} waiting for review`,
      href: "/profile?tab=licenses",
      actionLabel: "Open Approvals",
      icon: FileBadge2,
      urgent: snapshot.pendingLicenses > 0,
    },
    {
      id: "needs-info",
      label: "Awaiting Applicant",
      count: snapshot.needsInfoLicenses,
      detail:
        snapshot.needsInfoLicenses === 0
          ? "No follow-ups needed"
          : `${snapshot.needsInfoLicenses} sent back for more information`,
      href: "/profile?tab=licenses",
      actionLabel: "Review Queue",
      icon: ClipboardList,
      urgent: snapshot.needsInfoLicenses > 0,
    },
    {
      id: "orders",
      label: "Orders Needing Action",
      count: snapshot.pendingPayments + snapshot.awaitingVerification,
      detail:
        snapshot.pendingPayments + snapshot.awaitingVerification === 0
          ? "No payments waiting"
          : `${snapshot.pendingPayments} pending · ${snapshot.awaitingVerification} awaiting verification`,
      href: "/profile?tab=shop&view=orders",
      actionLabel: "Open Orders",
      icon: CreditCard,
      urgent: snapshot.pendingPayments + snapshot.awaitingVerification > 0,
    },
    {
      id: "members",
      label: "Members To Review",
      count: snapshot.newMembers,
      detail:
        snapshot.totalMembers === 0
          ? "Directory loading…"
          : `${snapshot.newMembers} new in 30 days · ${snapshot.unverifiedMembers} without approved license`,
      href: "/profile?tab=members",
      actionLabel: "Open Directory",
      icon: Users,
      urgent: snapshot.newMembers > 0,
    },
  ];
}

export function AdminPendingTasksPanel() {
  const [snapshot, setSnapshot] = useState<PendingSnapshot>(emptySnapshot);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [applications, orders] = await Promise.all([
          fetchAllLicenseApplications(),
          getAllOrders(),
        ]);
        const members = await fetchAdminMemberRecords(orders);
        const license = computeLicenseAnalytics(applications);
        const membership = computeMembershipAnalytics(members);

        if (cancelled) {
          return;
        }

        setSnapshot({
          pendingLicenses: license.pendingCount,
          needsInfoLicenses: license.needsInfoCount,
          pendingPayments: orders.filter((order) => order.payment.status === "pending").length,
          awaitingVerification: orders.filter((order) => order.payment.status === "awaiting_verification")
            .length,
          newMembers: membership.newSignups,
          unverifiedMembers: Math.max(membership.totalMembers - membership.verifiedMembers, 0),
          totalMembers: membership.totalMembers,
        });
        setError("");
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Unable to load pending tasks.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const tasks = buildTasks(snapshot);
  const totalUrgent = tasks.reduce((sum, task) => sum + (task.urgent ? task.count : 0), 0);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl uppercase text-white sm:text-4xl">Pending Tasks</h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            What needs admin attention right now across licenses, orders, and members.
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-[0.68rem] font-black uppercase tracking-[0.14em] text-zinc-300">
          {loading ? "Loading…" : totalUrgent > 0 ? `${totalUrgent} open` : "All clear"}
        </div>
      </div>

      {error ? (
        <div className="rounded-[1.5rem] border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tasks.map((task, index) => {
          const Icon = task.icon;
          return (
            <motion.article
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col rounded-[1.5rem] border px-5 py-5 transition ${
                task.urgent
                  ? "border-[#FF1010]/40 bg-[#FF1010]/[0.07]"
                  : "border-white/10 bg-white/[0.02]"
              }`}
              initial={{ opacity: 0, y: 12 }}
              key={task.id}
              transition={{ delay: index * 0.05, duration: 0.35 }}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl border ${
                    task.urgent
                      ? "border-[#FF1010]/35 bg-[#FF1010]/15 text-[#FF1010]"
                      : "border-white/10 bg-black/40 text-zinc-400"
                  }`}
                >
                  <Icon size={18} aria-hidden />
                </span>
                <p className="font-display text-4xl leading-none text-white">
                  {loading ? "—" : task.count}
                </p>
              </div>
              <p className="mt-4 text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">
                {task.label}
              </p>
              <p className="mt-2 flex-1 text-sm leading-6 text-zinc-400">{task.detail}</p>
              <Link
                className="mt-5 inline-flex items-center gap-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-red-200 transition hover:text-white"
                href={task.href}
              >
                {task.actionLabel}
                <ArrowRight size={14} aria-hidden />
              </Link>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
