"use client";

import { ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminPortalHeader } from "@/components/admin/AdminPortalShell";
import {
  membershipApplicationStatusLabels,
  membershipPaymentStatusLabels,
  type MembershipApplicationRecord,
  type MembershipApplicationStatus,
} from "@/data/membership-applications";
import { adminFetch } from "@/lib/auth/admin-fetch";

type QueueFilter =
  | "all"
  | "payment_verification"
  | "document_review"
  | "action_required"
  | "id_processing"
  | "shipped";

type Counts = {
  paymentVerification: number;
  documentReview: number;
  actionRequired: number;
  idProcessing: number;
  shipping: number;
};

const FILTERS: { id: QueueFilter; label: string; countKey?: keyof Counts }[] = [
  { id: "payment_verification", label: "Payment Verification", countKey: "paymentVerification" },
  { id: "document_review", label: "Document Review", countKey: "documentReview" },
  { id: "action_required", label: "Action Required", countKey: "actionRequired" },
  { id: "id_processing", label: "ID Processing", countKey: "idProcessing" },
  { id: "shipped", label: "Shipped", countKey: "shipping" },
  { id: "all", label: "All" },
];

function matchesFilter(application: MembershipApplicationRecord, filter: QueueFilter) {
  if (filter === "all") return true;
  if (filter === "payment_verification") return application.applicationStatus === "PAYMENT_VERIFICATION";
  if (filter === "document_review") {
    return ["DOCUMENT_REVIEW", "SUBMITTED"].includes(application.applicationStatus);
  }
  if (filter === "action_required") return application.applicationStatus === "ACTION_REQUIRED";
  if (filter === "id_processing") {
    return ["APPROVED", "ID_PROCESSING", "ID_PRINTING", "READY_FOR_DELIVERY"].includes(
      application.applicationStatus,
    );
  }
  if (filter === "shipped") return application.applicationStatus === "SHIPPED";
  return true;
}

function applicationBadgeTone(status: MembershipApplicationStatus) {
  if (["APPROVED", "COMPLETED", "DELIVERED"].includes(status)) {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-100";
  }
  if (["REJECTED", "CANCELLED"].includes(status)) {
    return "border-red-500/30 bg-red-500/10 text-red-100";
  }
  if (status === "ACTION_REQUIRED") {
    return "border-amber-400/30 bg-amber-400/10 text-amber-100";
  }
  return "border-white/15 bg-white/5 text-zinc-200";
}

export function AdminMembershipApplicationsPanel() {
  const [applications, setApplications] = useState<MembershipApplicationRecord[]>([]);
  const [counts, setCounts] = useState<Counts>({
    paymentVerification: 0,
    documentReview: 0,
    actionRequired: 0,
    idProcessing: 0,
    shipping: 0,
  });
  const [filter, setFilter] = useState<QueueFilter>("payment_verification");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  const refresh = useCallback(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);

    setLoading(true);
    void adminFetch(`/api/admin/membership-applications?${params.toString()}`)
      .then(async (response) => {
        const payload = (await response.json()) as {
          applications?: MembershipApplicationRecord[];
          counts?: Counts;
          error?: string;
        };
        if (!response.ok) {
          throw new Error(payload.error || "Unable to load membership applications.");
        }
        setApplications(payload.applications ?? []);
        if (payload.counts) setCounts(payload.counts);
        setError("");
      })
      .catch((caught) => {
        setError(caught instanceof Error ? caught.message : "Unable to load membership applications.");
      })
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      refresh();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const filteredApplications = useMemo(
    () => applications.filter((application) => matchesFilter(application, filter)),
    [applications, filter],
  );

  return (
    <div className="space-y-6">
      <AdminPortalHeader
        description="Review membership applications, verify payment proof, process IDs, and manage delivery."
        tag="Membership"
        title="Membership Applications"
      />

      <div className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input
            className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pl-11 pr-4 text-sm text-white outline-none ring-red-500/40 focus:ring-4"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, email, or application number"
            value={query}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((item) => {
            const count = item.countKey ? counts[item.countKey] : applications.length;
            return (
              <button
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] ${
                  filter === item.id ? "bg-[#FF1010] text-white" : "border border-white/10 text-zinc-300"
                }`}
                key={item.id}
                onClick={() => setFilter(item.id)}
                type="button"
              >
                {item.label}
                {typeof count === "number" ? ` (${count})` : ""}
              </button>
            );
          })}
        </div>
      </div>

      {error ? (
        <div className="glass-panel rounded-[1.75rem] border border-red-500/30 bg-red-500/10 p-6 text-red-100">
          <p className="font-bold">Membership applications failed to load.</p>
          <p className="mt-2 text-sm text-red-100/80">{error}</p>
          <button
            className="mt-4 rounded-full border border-red-300/30 px-4 py-2 text-xs font-black uppercase tracking-[0.14em]"
            onClick={refresh}
            type="button"
          >
            Retry
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="glass-panel rounded-[1.75rem] p-8 text-center text-sm text-zinc-400">Loading queue...</div>
      ) : null}

      {!loading && !error && filteredApplications.length === 0 ? (
        <div className="glass-panel rounded-[1.75rem] p-8 text-center text-sm text-zinc-400">
          No applications match this filter.
        </div>
      ) : null}

      {!loading && filteredApplications.length > 0 ? (
        <ul className="space-y-3">
          {filteredApplications.map((application) => (
            <li key={application.id}>
              <Link
                className="glass-panel flex items-center justify-between gap-4 rounded-[1.35rem] p-4 transition hover:border-[#FF1010]/35 sm:p-5"
                href={`/admin/membership-applications/${application.id}`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {application.applicationNumber} · {application.fullName}
                  </p>
                  <p className="mt-1 truncate text-sm text-zinc-400">{application.userEmail}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[0.58rem] font-black uppercase tracking-[0.12em] ${applicationBadgeTone(application.applicationStatus)}`}
                    >
                      {membershipApplicationStatusLabels[application.applicationStatus]}
                    </span>
                    <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[0.58rem] font-black uppercase tracking-[0.12em] text-zinc-200">
                      {membershipPaymentStatusLabels[application.paymentStatus]}
                    </span>
                    {application.fightTeam ? (
                      <span className="rounded-full border border-white/10 px-2.5 py-1 text-[0.58rem] font-black uppercase tracking-[0.12em] text-zinc-500">
                        {application.fightTeam}
                      </span>
                    ) : null}
                  </div>
                </div>
                <ChevronRight className="shrink-0 text-zinc-500" size={18} aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
