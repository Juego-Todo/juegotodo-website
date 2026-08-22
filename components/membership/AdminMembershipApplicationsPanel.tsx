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

export function AdminMembershipApplicationsPanel({ embedded = false }: { embedded?: boolean } = {}) {
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
      {embedded ? null : (
        <AdminPortalHeader
          description="Review membership applications, verify payment proof, process IDs, and manage delivery."
          tag="Membership"
          title="Membership Applications"
        />
      )}

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
        <div className="rounded-[1.25rem] border border-amber-500/20 bg-amber-500/[0.06] px-3 py-3 sm:px-4 sm:py-4">
          <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-amber-200/70">Payment</p>
          <p className="font-display mt-1 text-2xl text-white sm:text-3xl">{counts.paymentVerification}</p>
        </div>
        <div className="rounded-[1.25rem] border border-sky-500/20 bg-sky-500/[0.06] px-3 py-3 sm:px-4 sm:py-4">
          <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-sky-200/70">Documents</p>
          <p className="font-display mt-1 text-2xl text-white sm:text-3xl">{counts.documentReview}</p>
        </div>
        <div className="col-span-2 rounded-[1.25rem] border border-white/10 bg-white/[0.02] px-3 py-3 sm:col-span-1 sm:px-4 sm:py-4">
          <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">Action Required</p>
          <p className="font-display mt-1 text-2xl text-white sm:text-3xl">{counts.actionRequired}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-3">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((item) => {
            const count = item.countKey ? counts[item.countKey] : applications.length;
            return (
              <button
                className={`shrink-0 rounded-full px-3.5 py-2.5 text-[0.6rem] font-black uppercase tracking-[0.12em] transition sm:py-2 ${
                  filter === item.id
                    ? "bg-[#FF1010] text-white"
                    : "border border-white/10 text-zinc-400 hover:text-white"
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
        <label className="relative block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            size={14}
            aria-hidden
          />
          <input
            className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pl-9 pr-3 text-sm text-white outline-none ring-red-500/30 placeholder:text-zinc-500 focus:ring-2"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, email, or application number"
            value={query}
          />
        </label>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
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
        <div className="rounded-[1.75rem] border border-white/10 px-5 py-10 text-center text-sm text-zinc-400">
          Loading queue...
        </div>
      ) : null}

      {!loading && !error && filteredApplications.length === 0 ? (
        <div className="rounded-[1.75rem] border border-white/10 px-5 py-10 text-center text-sm text-zinc-400">
          No applications match this filter.
        </div>
      ) : null}

      {!loading && filteredApplications.length > 0 ? (
        <ul className="space-y-3">
          {filteredApplications.map((application) => (
            <li key={application.id}>
              <Link
                className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-4 transition hover:border-[#FF1010]/35 sm:p-5"
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
