"use client";

import { ArrowLeft, Package, Pencil, Truck } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MotionSection } from "@/components/MotionSection";
import {
  membershipApplicantTimelineSteps,
  membershipApplicationStatusLabels,
  membershipPaymentStatusLabels,
  type MembershipApplicationRecord,
  type MembershipApplicationStatus,
} from "@/data/membership-applications";
import { membershipFetch } from "@/lib/membership/client";

function statusTone(status: MembershipApplicationStatus) {
  if (status === "COMPLETED" || status === "DELIVERED" || status === "APPROVED") {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
  }
  if (status === "REJECTED" || status === "CANCELLED") {
    return "border-red-500/30 bg-red-500/10 text-red-100";
  }
  if (status === "ACTION_REQUIRED" || status === "PAYMENT_PENDING") {
    return "border-amber-400/30 bg-amber-400/10 text-amber-100";
  }
  return "border-white/15 bg-white/5 text-zinc-200";
}

function timelineIndex(status: MembershipApplicationStatus) {
  const exact = membershipApplicantTimelineSteps.findIndex((step) => step.status === status);
  if (exact >= 0) return exact;

  const order: MembershipApplicationStatus[] = [
    "DRAFT",
    "SUBMITTED",
    "PAYMENT_PENDING",
    "PAYMENT_VERIFICATION",
    "DOCUMENT_REVIEW",
    "ACTION_REQUIRED",
    "APPROVED",
    "ID_PROCESSING",
    "ID_PRINTING",
    "READY_FOR_DELIVERY",
    "SHIPPED",
    "DELIVERED",
    "COMPLETED",
  ];

  const current = order.indexOf(status);
  if (current < 0) return -1;

  let best = -1;
  membershipApplicantTimelineSteps.forEach((step, index) => {
    if (order.indexOf(step.status) <= current) {
      best = index;
    }
  });
  return best;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function MembershipApplicationStatusView({ applicationId }: { applicationId: string }) {
  const [application, setApplication] = useState<MembershipApplicationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void membershipFetch(`/api/membership/applications/${applicationId}`)
        .then(async (response) => {
          const payload = (await response.json()) as {
            application?: MembershipApplicationRecord;
            error?: string;
          };
          if (!response.ok || !payload.application) {
            throw new Error(payload.error || "Unable to load application.");
          }
          if (!cancelled) {
            setApplication(payload.application);
            setError(null);
          }
        })
        .catch((caught) => {
          if (!cancelled) {
            setError(caught instanceof Error ? caught.message : "Unable to load application.");
            setApplication(null);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [applicationId]);

  const activeTimelineIndex = useMemo(
    () => (application ? timelineIndex(application.applicationStatus) : -1),
    [application],
  );

  const canContinueEditing =
    application &&
    (application.applicationStatus === "DRAFT" || application.applicationStatus === "ACTION_REQUIRED");

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4 pt-24">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-zinc-400">Loading application...</p>
      </main>
    );
  }

  if (error || !application) {
    return (
      <main className="overflow-hidden px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
        <section className="relative mx-auto max-w-2xl py-8">
          <div className="glass-panel rounded-[1.5rem] border border-red-500/20 bg-red-500/10 p-8 text-red-100">
            <p className="font-bold">Unable to load application</p>
            <p className="mt-2 text-sm text-red-100/80">{error || "Application not found."}</p>
            <Link
              className="mt-5 inline-flex text-xs font-black uppercase tracking-[0.16em] text-white"
              href="/membership/applications"
            >
              Back to applications
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="overflow-hidden px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
      <section className="relative mx-auto max-w-3xl py-8 sm:py-10">
        <MotionSection>
          <Link
            className="inline-flex items-center text-xs font-black uppercase tracking-[0.16em] text-zinc-400 transition hover:text-white"
            href="/membership/applications"
          >
            <ArrowLeft className="mr-2" size={14} aria-hidden />
            All Applications
          </Link>

          <div className="glass-panel mt-6 rounded-[1.5rem] p-5 sm:p-7">
            <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-[#FF1010]">Application Status</p>
            <h1 className="font-display mt-2 text-3xl uppercase text-white sm:text-4xl">
              {application.applicationNumber}
            </h1>
            <p className="mt-2 text-sm text-zinc-400">{application.fullName}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span
                className={`rounded-full border px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.14em] ${statusTone(application.applicationStatus)}`}
              >
                {membershipApplicationStatusLabels[application.applicationStatus]}
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-200">
                Payment: {membershipPaymentStatusLabels[application.paymentStatus]}
              </span>
            </div>

            {canContinueEditing ? (
              <Link
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[#FF1010] px-5 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#ff2828]"
                href={`/membership/apply/local-membership?applicationId=${application.id}`}
              >
                <Pencil className="mr-2" size={14} aria-hidden />
                Continue Editing
              </Link>
            ) : null}
          </div>

          {application.applicantVisibleNotes ? (
            <div className="glass-panel mt-5 rounded-[1.5rem] border border-amber-400/25 bg-amber-400/10 p-5 text-sm leading-7 text-amber-50">
              <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-amber-200">
                Notes / Corrections
              </p>
              <p className="mt-2 whitespace-pre-wrap">{application.applicantVisibleNotes}</p>
            </div>
          ) : null}

          <div className="glass-panel mt-5 rounded-[1.5rem] p-5 sm:p-7">
            <h2 className="font-display text-2xl uppercase text-white">Progress</h2>
            <ol className="mt-5 space-y-3">
              {membershipApplicantTimelineSteps.map((step, index) => {
                const reached = activeTimelineIndex >= index;
                const current = activeTimelineIndex === index;
                return (
                  <li className="flex items-start gap-3" key={step.status}>
                    <span
                      className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                        current ? "bg-[#FF1010]" : reached ? "bg-emerald-400" : "bg-white/15"
                      }`}
                      aria-hidden
                    />
                    <div>
                      <p className={`text-sm ${reached ? "text-white" : "text-zinc-500"}`}>{step.label}</p>
                      {current ? (
                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#FF1010]">Current stage</p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {(application.courier || application.trackingNumber) && (
            <div className="glass-panel mt-5 rounded-[1.5rem] p-5 sm:p-7">
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-[#FF1010]" aria-hidden />
                <h2 className="font-display text-2xl uppercase text-white">Shipment</h2>
              </div>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <dt className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-500">Courier</dt>
                  <dd className="mt-2 text-sm text-white">{application.courier || "—"}</dd>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <dt className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-500">Tracking</dt>
                  <dd className="mt-2 text-sm text-white">{application.trackingNumber || "—"}</dd>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <dt className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-500">Shipped</dt>
                  <dd className="mt-2 text-sm text-white">{formatDate(application.shippingDate)}</dd>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <dt className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-500">Delivered</dt>
                  <dd className="mt-2 text-sm text-white">{formatDate(application.deliveryDate)}</dd>
                </div>
              </dl>
            </div>
          )}

          <div className="glass-panel mt-5 rounded-[1.5rem] p-5 sm:p-7">
            <div className="flex items-center gap-2">
              <Package size={16} className="text-[#FF1010]" aria-hidden />
              <h2 className="font-display text-2xl uppercase text-white">History</h2>
            </div>
            {(application.history?.length ?? 0) === 0 ? (
              <p className="mt-4 text-sm text-zinc-500">No visible history yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {application.history?.map((entry) => (
                  <li className="rounded-2xl border border-white/8 bg-black/20 p-4" key={entry.id}>
                    <p className="text-sm font-semibold text-white">{entry.action.replace(/_/g, " ")}</p>
                    {entry.notes ? <p className="mt-1 text-sm leading-6 text-zinc-400">{entry.notes}</p> : null}
                    <p className="mt-2 text-[0.62rem] uppercase tracking-[0.14em] text-zinc-500">
                      {formatDate(entry.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </MotionSection>
      </section>
    </main>
  );
}
