"use client";

import { CheckCircle2, Search, XCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminPortalHeader } from "@/components/admin/AdminPortalShell";
import { adminFetch } from "@/lib/auth/admin-fetch";
import type { MemberDocumentRecord } from "@/lib/platform/documents-server";
import { formatAdminDate, readAdminJson } from "@/components/admin/platform/admin-platform-utils";

type DocumentFilter = "pending" | "all";

function statusTone(status: MemberDocumentRecord["status"]) {
  if (status === "approved") return "text-emerald-300";
  if (status === "rejected" || status === "expired") return "text-red-300";
  return "text-amber-200";
}

export function AdminDocumentsPanel() {
  const [documents, setDocuments] = useState<MemberDocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<DocumentFilter>("pending");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError("");
    try {
      const response = await adminFetch("/api/admin/documents");
      const payload = await readAdminJson<{ documents?: MemberDocumentRecord[] }>(
        response,
        "Unable to load documents.",
      );
      setDocuments(
        (payload.documents ?? []).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  async function setStatus(id: string, status: "approved" | "rejected") {
    setBusyId(id);
    setError("");
    try {
      const response = await adminFetch("/api/admin/documents", {
        method: "PATCH",
        body: JSON.stringify({ id, status }),
      });
      await readAdminJson(response, "Unable to update document.");
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update document.");
    } finally {
      setBusyId(null);
    }
  }

  const counts = useMemo(
    () => ({
      pending: documents.filter((doc) => doc.status === "pending").length,
      all: documents.length,
    }),
    [documents],
  );

  const filteredDocuments = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return documents.filter((doc) => {
      if (filter === "pending" && doc.status !== "pending") return false;
      if (!normalized) return true;
      const haystack = [doc.title, doc.documentType, doc.userId, doc.notes].join(" ").toLowerCase();
      return haystack.includes(normalized);
    });
  }, [documents, filter, query]);

  const filters: { id: DocumentFilter; label: string }[] = [
    { id: "pending", label: `Pending (${counts.pending})` },
    { id: "all", label: `All (${counts.all})` },
  ];

  return (
    <div className="space-y-6">
      <AdminPortalHeader
        description="Review credential pipelines, issued licenses, and league document submissions."
        tag="Administration"
        title="Documents"
      />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        <div className="rounded-[1.25rem] border border-amber-500/20 bg-amber-500/[0.06] px-3 py-3 sm:px-4 sm:py-4">
          <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-amber-200/70">Pending Review</p>
          <p className="font-display mt-1 text-2xl text-white sm:text-3xl">{counts.pending}</p>
        </div>
        <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.02] px-3 py-3 sm:px-4 sm:py-4">
          <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">Total Documents</p>
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
            placeholder="Search title, type, member id…"
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
          Loading documents…
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="rounded-[1.75rem] border border-white/10 px-5 py-10 text-center text-sm text-zinc-400">
          {documents.length === 0 ? "No member documents submitted yet." : "No documents match this filter."}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDocuments.map((doc) => {
            const busy = busyId === doc.id;
            return (
              <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-5 sm:p-6" key={doc.id}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">{doc.documentType}</p>
                      <span className="rounded-full border border-white/10 px-2 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.12em] text-zinc-500">
                        {doc.id.slice(0, 8)}
                      </span>
                    </div>
                    <p className="mt-2 font-semibold text-white">{doc.title}</p>
                    <p className="mt-1 text-sm text-zinc-400">Member: {doc.userId}</p>
                    <p className="mt-2 text-sm text-zinc-500">{formatAdminDate(doc.createdAt)}</p>
                    {doc.notes ? <p className="mt-2 text-sm text-zinc-400">{doc.notes}</p> : null}
                    {doc.expiresAt ? (
                      <p className="mt-1 text-xs text-zinc-500">Expires {formatAdminDate(doc.expiresAt)}</p>
                    ) : null}
                  </div>
                  <div className="shrink-0 text-left lg:text-right">
                    <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">Status</p>
                    <p className={`mt-1 text-lg font-semibold capitalize ${statusTone(doc.status)}`}>{doc.status}</p>
                  </div>
                </div>

                {doc.status === "pending" ? (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                    <button
                      className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white transition hover:bg-emerald-500 disabled:opacity-60"
                      disabled={busy}
                      onClick={() => void setStatus(doc.id, "approved")}
                      type="button"
                    >
                      <CheckCircle2 size={14} aria-hidden />
                      Approve
                    </button>
                    <button
                      className="inline-flex items-center gap-2 rounded-full border border-red-500/30 px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-red-300 transition hover:bg-red-500/10 disabled:opacity-60"
                      disabled={busy}
                      onClick={() => void setStatus(doc.id, "rejected")}
                      type="button"
                    >
                      <XCircle size={14} aria-hidden />
                      Reject
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
