"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isSupabaseUnavailableResponse, platformFetch } from "@/lib/platform/client";

export function MemberPanelShell({
  eyebrow = "Member Portal",
  title,
  description,
  children,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#FF1010]">{eyebrow}</p>
          <h2 className="font-display mt-2 text-4xl uppercase text-white sm:text-5xl">{title}</h2>
          {description ? (
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}

export function SupabaseUnavailableNotice() {
  return (
    <div className="rounded-[1.25rem] border border-dashed border-white/10 bg-black/25 px-5 py-6 text-center">
      <p className="text-sm text-zinc-400">
        Cloud records are not connected in this environment. Your profile still works locally, but live membership
        documents and assignments will appear once Supabase is configured.
      </p>
    </div>
  );
}

export function PanelLoadingState() {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-black/25 px-5 py-6 text-center text-sm text-zinc-500">
      Loading...
    </div>
  );
}

export function PanelErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-[1.25rem] border border-red-500/20 bg-red-500/10 px-5 py-6 text-sm text-red-100">
      {message}
    </div>
  );
}

export function PanelEmptyState({
  message,
  href,
  linkLabel,
}: {
  message: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="rounded-[1.25rem] border border-dashed border-white/10 px-5 py-6 text-center">
      <p className="text-sm text-zinc-400">{message}</p>
      {href && linkLabel ? (
        <Link
          className="mt-4 inline-flex min-h-10 items-center rounded-full bg-red-600 px-5 text-xs font-black uppercase tracking-[0.16em] text-white"
          href={href}
        >
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: "success" | "warning" | "neutral" | "danger" }) {
  const className =
    tone === "success"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
      : tone === "warning"
        ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
        : tone === "danger"
          ? "border-red-500/40 bg-red-500/10 text-red-200"
          : "border-white/10 bg-white/5 text-zinc-300";

  return (
    <span className={`rounded-full border px-2.5 py-1 text-[0.58rem] font-black uppercase tracking-[0.12em] ${className}`}>
      {label}
    </span>
  );
}

export function documentStatusTone(status: string): "success" | "warning" | "neutral" | "danger" {
  if (status === "approved") return "success";
  if (status === "pending") return "warning";
  if (status === "rejected" || status === "expired") return "danger";
  return "neutral";
}

export function usePlatformResource<T>(url: string, resultKey: string, fallback: T) {
  const supabaseReady = isSupabaseConfigured();
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(supabaseReady);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(!supabaseReady);

  useEffect(() => {
    if (!supabaseReady) return;

    let cancelled = false;

    void platformFetch(url)
      .then(async (response) => {
        const payload = (await response.json()) as Record<string, unknown> & { error?: string };
        if (cancelled) return;

        if (isSupabaseUnavailableResponse(response.status)) {
          setUnavailable(true);
          setError(null);
          return;
        }

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load data.");
        }

        setData((payload[resultKey] as T) ?? fallback);
        setError(null);
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Unable to load data.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [url, resultKey, supabaseReady, fallback]);

  return { data, loading, error, unavailable, setData };
}

export function formatPanelDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}
