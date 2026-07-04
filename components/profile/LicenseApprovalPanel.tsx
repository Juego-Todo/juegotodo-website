"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Paperclip } from "lucide-react";
import Link from "next/link";
import { formatLicenseDate, getRestrictionLabel, listLicenseUploadAttachments, type LicenseApplication } from "@/data/license-applications";
import { fetchAllLicenseApplications } from "@/lib/licenses/storage";
import {
  licenseApprovalStatusTone,
  resolveLicenseProgramTitle,
  resolveLicenseStatusLabel,
} from "@/lib/profile/license-approval-ui";

type ReviewFilter = "pending" | "needs_info" | "all";

export function LicenseApprovalPanel() {
  const [applications, setApplications] = useState<LicenseApplication[]>([]);
  const [filter, setFilter] = useState<ReviewFilter>("pending");

  function refreshApplications() {
    void fetchAllLicenseApplications().then(setApplications);
  }

  useEffect(() => {
    void fetchAllLicenseApplications().then(setApplications);
  }, []);

  const filteredApplications = useMemo(() => {
    if (filter === "all") {
      return applications;
    }
    return applications.filter((application) => application.status === filter);
  }, [applications, filter]);

  const pendingCount = applications.filter((application) => application.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-[1.75rem] p-5 sm:p-8">
        <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#FF1010]">Licensing</p>
        <h2 className="font-display mt-2 text-4xl uppercase text-white sm:text-5xl">License Approvals</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
          Review membership and license applications submitted through Register For License. Select an applicant to
          inspect their submission, attachments, and review actions.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {(
            [
              ["pending", `Pending (${pendingCount})`],
              ["needs_info", "Awaiting Applicant"],
              ["all", "All Applications"],
            ] as const
          ).map(([value, label]) => (
            <button
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] ${
                filter === value ? "bg-[#FF1010] text-white" : "border border-white/10 text-zinc-300"
              }`}
              key={value}
              onClick={() => setFilter(value)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="glass-panel rounded-[1.75rem] p-8 text-center text-zinc-400">
          No license applications in this queue.
        </div>
      ) : (
        <div className="glass-panel overflow-hidden rounded-[1.75rem]">
          <div className="border-b border-white/10 px-5 py-4 sm:px-8">
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-zinc-500">
              Applications ({filteredApplications.length})
            </p>
          </div>
          <ul className="divide-y divide-white/10">
            {filteredApplications.map((application) => {
              const uploads = listLicenseUploadAttachments(application.uploads);
              const attachedCount = uploads.filter((upload) => upload.attached).length;

              return (
                <li key={application.id}>
                  <Link
                    className="group flex items-center gap-4 px-5 py-5 transition hover:bg-white/[0.04] sm:px-8"
                    href={`/admin/license-approvals/${application.id}`}
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
                      className="shrink-0 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-[#FF1010]"
                      size={20}
                      aria-hidden
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
