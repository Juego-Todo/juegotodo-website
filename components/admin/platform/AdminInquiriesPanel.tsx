"use client";

import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminPortalHeader } from "@/components/admin/AdminPortalShell";
import { formatAdminDate, readAdminJson } from "@/components/admin/platform/admin-platform-utils";
import { adminFetch } from "@/lib/auth/admin-fetch";
import type { InquiryRecord } from "@/lib/platform/inquiries";

type InquiryFilter = "all" | "partnership" | "contact" | "seminar";

function statusTone(status: InquiryRecord["status"]) {
  if (status === "new") return "text-amber-200";
  if (status === "reviewed") return "text-sky-300";
  return "text-zinc-400";
}

export function AdminInquiriesPanel({ embedded = false }: { embedded?: boolean } = {}) {
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<InquiryFilter>("all");
  const [query, setQuery] = useState("");

  const refresh = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const params = filter === "all" ? "" : `?type=${filter}`;
      const response = await adminFetch(`/api/admin/inquiries${params}`);
      const payload = await readAdminJson<{ inquiries?: InquiryRecord[] }>(
        response,
        "Unable to load inquiries.",
      );
      setInquiries(
        (payload.inquiries ?? []).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load inquiries.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const filteredInquiries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return inquiries;
    return inquiries.filter((item) =>
      [
        item.fullName,
        item.email,
        item.phone ?? "",
        item.organization ?? "",
        item.subject ?? "",
        item.message,
        item.inquiryType,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [inquiries, query]);

  const counts = useMemo(
    () => ({
      new: inquiries.filter((item) => item.status === "new").length,
      all: inquiries.length,
    }),
    [inquiries],
  );

  const filters: { id: InquiryFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "partnership", label: "Partnership" },
    { id: "contact", label: "Contact" },
    { id: "seminar", label: "Seminar" },
  ];

  return (
    <div className="space-y-6">
      {embedded ? null : (
        <AdminPortalHeader
          description="Review partnership, contact, and seminar inquiries from the public site."
          tag="Administration"
          title="Inquiries"
        />
      )}

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        <div className="rounded-[1.25rem] border border-amber-500/20 bg-amber-500/[0.06] px-3 py-3 sm:px-4 sm:py-4">
          <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-amber-200/70">New</p>
          <p className="font-display mt-1 text-2xl text-white sm:text-3xl">{counts.new}</p>
        </div>
        <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.02] px-3 py-3 sm:px-4 sm:py-4">
          <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">In Queue</p>
          <p className="font-display mt-1 text-2xl text-white sm:text-3xl">{counts.all}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-3">
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              className={`rounded-full px-3.5 py-2 text-[0.6rem] font-black uppercase tracking-[0.12em] transition ${
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
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            size={14}
            aria-hidden
          />
          <input
            className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pl-9 pr-3 text-sm text-white outline-none ring-red-500/30 placeholder:text-zinc-500 focus:ring-2"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email, subject…"
            value={query}
          />
        </label>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-[1.75rem] border border-white/10 px-5 py-10 text-center text-sm text-zinc-400">
          Loading inquiries…
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="rounded-[1.75rem] border border-white/10 px-5 py-10 text-center text-sm text-zinc-400">
          {inquiries.length === 0 ? "No inquiries yet." : "No inquiries match this filter."}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInquiries.map((item) => (
            <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-5 sm:p-6" key={item.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">{item.inquiryType}</p>
                    <span className={`text-[0.55rem] font-black uppercase tracking-[0.12em] capitalize ${statusTone(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-2 font-semibold text-white">{item.fullName}</p>
                  <p className="text-sm text-zinc-400">{item.email}</p>
                  {item.phone ? <p className="text-sm text-zinc-500">{item.phone}</p> : null}
                  {item.organization ? <p className="mt-1 text-sm text-zinc-400">{item.organization}</p> : null}
                  {item.subject ? (
                    <p className="mt-2 text-sm font-medium text-zinc-300">{item.subject}</p>
                  ) : null}
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-400">{item.message}</p>
                </div>
                <p className="shrink-0 text-xs text-zinc-500">{formatAdminDate(item.createdAt)}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
