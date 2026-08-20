"use client";

import { ArrowLeft, ChevronRight, FilePlus2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MotionSection } from "@/components/MotionSection";
import {
  membershipApplicationStatusLabels,
  membershipPaymentStatusLabels,
  type MembershipApplicationRecord,
} from "@/data/membership-applications";
import { membershipFetch } from "@/lib/membership/client";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

export function MembershipApplicationsList() {
  const [applications, setApplications] = useState<MembershipApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void membershipFetch("/api/membership/applications")
        .then(async (response) => {
          const payload = (await response.json()) as {
            applications?: MembershipApplicationRecord[];
            error?: string;
          };
          if (!response.ok) {
            throw new Error(payload.error || "Unable to load applications.");
          }
          if (!cancelled) {
            setApplications(payload.applications ?? []);
            setError(null);
          }
        })
        .catch((caught) => {
          if (!cancelled) {
            setError(caught instanceof Error ? caught.message : "Unable to load applications.");
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
  }, []);

  return (
    <main className="overflow-hidden px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
      <section className="relative mx-auto max-w-4xl py-8 sm:py-10">
        <MotionSection>
          <Link
            className="inline-flex items-center text-xs font-black uppercase tracking-[0.16em] text-zinc-400 transition hover:text-white"
            href="/membership"
          >
            <ArrowLeft className="mr-2" size={14} aria-hidden />
            Membership Portal
          </Link>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-[#FF1010]">Your Applications</p>
              <h1 className="font-display mt-2 text-3xl uppercase text-white sm:text-5xl">Track Membership</h1>
            </div>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#FF1010] px-5 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#ff2828]"
              href="/membership/apply/local-membership"
            >
              <FilePlus2 className="mr-2" size={14} aria-hidden />
              New Application
            </Link>
          </div>

          {loading ? (
            <div className="glass-panel mt-6 rounded-[1.5rem] p-8 text-center text-sm text-zinc-400">
              Loading applications...
            </div>
          ) : null}

          {error ? (
            <div className="glass-panel mt-6 rounded-[1.5rem] border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          {!loading && !error && applications.length === 0 ? (
            <div className="glass-panel mt-6 rounded-[1.5rem] p-8 text-center">
              <p className="text-sm text-zinc-400">You have not submitted any membership applications yet.</p>
              <Link
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[#FF1010] px-5 text-xs font-black uppercase tracking-[0.16em] text-white"
                href="/membership/apply/local-membership"
              >
                Apply for Local Membership
              </Link>
            </div>
          ) : null}

          {!loading && applications.length > 0 ? (
            <ul className="mt-6 space-y-3">
              {applications.map((application) => (
                <li key={application.id}>
                  <Link
                    className="glass-panel flex items-center justify-between gap-4 rounded-[1.35rem] p-4 transition hover:border-[#FF1010]/35 sm:p-5"
                    href={`/membership/application/${application.id}`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{application.applicationNumber}</p>
                      <p className="mt-1 truncate text-sm text-zinc-400">{application.fullName}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/10 px-2.5 py-1 text-[0.58rem] font-black uppercase tracking-[0.12em] text-zinc-300">
                          {membershipApplicationStatusLabels[application.applicationStatus]}
                        </span>
                        <span className="rounded-full border border-white/10 px-2.5 py-1 text-[0.58rem] font-black uppercase tracking-[0.12em] text-zinc-300">
                          {membershipPaymentStatusLabels[application.paymentStatus]}
                        </span>
                        <span className="rounded-full border border-white/10 px-2.5 py-1 text-[0.58rem] font-black uppercase tracking-[0.12em] text-zinc-500">
                          Updated {formatDate(application.updatedAt)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="shrink-0 text-zinc-500" size={18} aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </MotionSection>
      </section>
    </main>
  );
}
