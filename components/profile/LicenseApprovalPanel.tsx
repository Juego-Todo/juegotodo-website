"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronRight, Paperclip, Search } from "lucide-react";
import Link from "next/link";
import {
  formatLicenseDate,
  getRestrictionLabel,
  listLicenseUploadAttachments,
  type LicenseApplication,
} from "@/data/license-applications";
import { fetchAllLicenseApplications } from "@/lib/licenses/storage";
import {
  licenseApprovalStatusTone,
  resolveLicenseProgramTitle,
  resolveLicenseStatusLabel,
} from "@/lib/profile/license-approval-ui";

type ReviewFilter = "pending" | "needs_info" | "all";

export function LicenseApprovalPanel({ embedded = false }: { embedded?: boolean } = {}) {
  const [applications, setApplications] = useState<LicenseApplication[]>([]);
  const [filter, setFilter] = useState<ReviewFilter>("pending");
  const [query, setQuery] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  const refreshApplications = useCallback(() => {
    void fetchAllLicenseApplications()
      .then((records) => {
        setApplications(records);
        setError("");
        setLoaded(true);
      })
      .catch((caught) => {
        setError(caught instanceof Error ? caught.message : "Unable to load license applications.");
        setLoaded(true);
      });
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      refreshApplications();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refreshApplications]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        refreshApplications();
      }
    }

    window.addEventListener("focus", refreshApplications);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", refreshApplications);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshApplications]);

  const counts = useMemo(
    () => ({
      pending: applications.filter((application) => application.status === "pending").length,
      needs_info: applications.filter((application) => application.status === "needs_info").length,
      all: applications.length,
    }),
    [applications],
  );

  const filteredApplications = useMemo(() => {
    const statusFiltered =
      filter === "all" ? applications : applications.filter((application) => application.status === filter);
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return statusFiltered;
    }
    return statusFiltered.filter((application) => {
      const haystack = [
        application.fullName,
        application.userEmail,
        application.idNumber,
        resolveLicenseProgramTitle(application),
        getRestrictionLabel(application.restrictionCode),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [applications, filter, query]);

  const filters: { id: ReviewFilter; label: string }[] = [
    { id: "pending", label: `Pending (${counts.pending})` },
    { id: "needs_info", label: `Awaiting Applicant (${counts.needs_info})` },
    { id: "all", label: `All (${counts.all})` },
  ];

  return (
    <div className="space-y-6">
      {!embedded ? (
        <div>
          <p className="text-[0.62rem] font-black uppercase tracking-[0.28em] text-red-300">Licensing</p>
          <h2 className="font-display mt-2 text-3xl uppercase text-white sm:text-4xl">License Approvals</h2>
          <p className="mt-2 max-w-3xl text-sm text-zinc-400">
            Review membership and license applications submitted through Register For License.
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
        <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.02] px-3 py-3 sm:px-4 sm:py-4">
          <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">Total</p>
          <p className="font-display mt-1 text-2xl text-white sm:text-3xl">{counts.all}</p>
        </div>
        <div className="rounded-[1.25rem] border border-amber-500/20 bg-amber-500/[0.06] px-3 py-3 sm:px-4 sm:py-4">
          <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-amber-200/70">Pending</p>
          <p className="font-display mt-1 text-2xl text-white sm:text-3xl">{counts.pending}</p>
        </div>
        <div className="col-span-2 rounded-[1.25rem] border border-sky-500/20 bg-sky-500/[0.06] px-3 py-3 sm:col-span-1 sm:px-4 sm:py-4">
          <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-sky-200/70">Needs Info</p>
          <p className="font-display mt-1 text-2xl text-white sm:text-3xl">{counts.needs_info}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-3">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden">
          {filters.map((item) => (
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
            </button>
          ))}
        </div>
        <label className="relative block">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            size={14}
          />
          <input
            className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pl-9 pr-3 text-sm text-white outline-none ring-red-500/30 placeholder:text-zinc-500 focus:ring-2"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email, ID, program…"
            value={query}
          />
        </label>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          <p className="font-bold">License applications failed to load.</p>
          <p className="mt-2 text-red-100/80">{error}</p>
          <button
            className="mt-4 rounded-full border border-red-300/30 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-red-50"
            onClick={refreshApplications}
            type="button"
          >
            Retry
          </button>
        </div>
      ) : !loaded ? (
        <div className="rounded-[1.75rem] border border-white/10 px-5 py-10 text-center text-sm text-zinc-400">
          Loading license applications…
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="rounded-[1.75rem] border border-white/10 px-5 py-10 text-center text-sm text-zinc-400">
          No license applications in this queue.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApplications.map((application) => {
            const uploads = listLicenseUploadAttachments(application.uploads);
            const attachedCount = uploads.filter((upload) => upload.attached).length;

            return (
              <Link
                className="group flex items-center gap-4 rounded-[1.35rem] border border-white/10 bg-white/[0.02] px-4 py-4 transition hover:border-[#FF1010]/35 sm:px-5"
                href={`/admin/license-approvals/${application.id}`}
                key={application.id}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-xl uppercase text-white sm:text-2xl">{application.fullName}</p>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-[0.08em] ${licenseApprovalStatusTone[application.status]}`}
                    >
                      {resolveLicenseStatusLabel(application.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-400">{application.userEmail}</p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                    <span>{resolveLicenseProgramTitle(application)}</span>
                    <span>{getRestrictionLabel(application.restrictionCode)}</span>
                    <span>{application.idNumber}</span>
                    <span>Submitted {formatLicenseDate(application.submittedAt)}</span>
                    <span className="inline-flex items-center gap-1">
                      <Paperclip size={12} aria-hidden />
                      {attachedCount} files attached
                    </span>
                  </div>
                </div>
                <ChevronRight
                  aria-hidden
                  className="shrink-0 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-[#FF1010]"
                  size={20}
                />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
