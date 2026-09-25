"use client";

import { useEffect, useMemo, useState } from "react";
import { Lock, RefreshCw } from "lucide-react";
import Link from "next/link";
import { AuthGateFallback } from "@/components/auth/AuthGateFallback";
import { ProBadge } from "@/components/pro/ProBadge";
import {
  LICENSE_CENTER_CATALOG,
  LICENSE_CENTER_CATEGORIES,
  type LicenseCenterCatalogItem,
} from "@/data/license-center-catalog";
import {
  LICENSE_PROGRAM_PRESETS,
  type LicenseProgramPresetKey,
} from "@/data/license-program-presets";
import {
  licenseApplicationStatusLabels,
  type LicenseApplication,
  type LicenseApplicationProgram,
} from "@/data/license-applications";
import { PRO_PAGE_PATH } from "@/data/pro-membership";
import { useAuth } from "@/lib/auth/context";
import { fetchLicenseApplicationsByUserId } from "@/lib/licenses/storage";
import { getLicenseProcessMeta } from "@/lib/profile/license-process";
import { useProMembership } from "@/lib/pro/use-pro-membership";
import { formatProExpiryDate } from "@/lib/pro/timer";

function programToPresetKey(program: LicenseApplicationProgram): LicenseProgramPresetKey | null {
  const entry = Object.entries(LICENSE_PROGRAM_PRESETS).find(([, preset]) => preset.program === program);
  return (entry?.[0] as LicenseProgramPresetKey | undefined) ?? null;
}

function applicationCtaLabel(status: LicenseApplication["status"]) {
  if (status === "approved") return "View license";
  if (status === "pending") return "Pending review";
  if (status === "needs_info") return "Action required";
  if (status === "rejected") return "View application";
  return "View application";
}

function ProMembershipPanel({
  loading,
  resolved,
  entitled,
  plan,
  displayStatus,
  expiresAt,
  error,
  onRetry,
}: {
  loading: boolean;
  resolved: boolean;
  entitled: boolean;
  plan: "unlimited" | "pro" | "free";
  displayStatus: string;
  expiresAt: string | null;
  error: string | null;
  onRetry: () => void;
}) {
  if (loading) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-6 sm:px-6">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-zinc-500">
          JuegoTodo Pro
        </p>
        <p className="mt-3 text-sm text-zinc-400">Checking membership…</p>
      </section>
    );
  }

  if (!resolved) {
    return (
      <section className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] px-5 py-6 sm:px-6">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-amber-200">
          Membership status unavailable
        </p>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">
          {error ?? "We couldn't verify your Pro Membership. License applications stay locked until status is confirmed."}
        </p>
        <button
          className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg border border-amber-300/30 px-4 text-xs font-semibold uppercase tracking-[0.12em] text-amber-50 transition hover:bg-amber-500/10"
          onClick={onRetry}
          type="button"
        >
          <RefreshCw size={14} aria-hidden />
          Retry
        </button>
      </section>
    );
  }

  if (plan === "unlimited" || entitled) {
    const cancelledUntilExpiry = displayStatus === "cancelled";
    return (
      <section className="rounded-2xl border border-[#FFCF6A]/25 bg-gradient-to-br from-[#FFCF6A]/10 via-transparent to-transparent px-5 py-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <ProBadge label={plan === "unlimited" ? "UNLIMITED" : "PRO ACTIVE"} variant="active" />
          {cancelledUntilExpiry ? (
            <span className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-zinc-400">
              Ends {expiresAt ?? "—"}
            </span>
          ) : expiresAt && plan !== "unlimited" ? (
            <span className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-zinc-400">
              Expires {expiresAt}
            </span>
          ) : null}
        </div>
        <h2 className="font-display mt-4 text-2xl uppercase text-white sm:text-3xl">JuegoTodo Pro</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
          {plan === "unlimited"
            ? "Unlimited team access keeps License Center applications unlocked."
            : cancelledUntilExpiry
              ? `Your membership is scheduled to end on ${expiresAt ?? "the expiry date"}. License applications remain available until then.`
              : "Your Pro Membership unlocks access to JuegoTodo license applications."}
        </p>
        <p className="mt-4 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#FFCF6A]">
          License applications unlocked
        </p>
        <Link
          className="mt-5 inline-flex min-h-10 items-center rounded-lg border border-white/15 px-4 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-200 transition hover:border-white/30 hover:text-white"
          href="/profile?tab=membership"
        >
          View membership
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[#FFCF6A]/25 bg-gradient-to-br from-[#FFCF6A]/10 via-transparent to-transparent px-5 py-6 sm:px-6">
      <ProBadge label="PRO REQUIRED" variant="locked" />
      <h2 className="font-display mt-4 text-2xl uppercase text-white sm:text-3xl">JuegoTodo Pro</h2>
      <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#FFCF6A]">
        One-year membership
      </p>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">
        Upgrade to the one-year JuegoTodo Pro Membership to apply for role licenses and manage credentials in the
        License Center.
      </p>
      <ul className="mt-4 space-y-1.5 text-sm text-zinc-400">
        <li className="flex gap-2">
          <span className="text-[#FFCF6A]" aria-hidden>
            ✓
          </span>
          License applications
        </li>
        <li className="flex gap-2">
          <span className="text-[#FFCF6A]" aria-hidden>
            ✓
          </span>
          Credential management
        </li>
        <li className="flex gap-2">
          <span className="text-[#FFCF6A]" aria-hidden>
            ✓
          </span>
          Pro member License Center access
        </li>
      </ul>
      <Link
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#FF1010] px-5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#ff2a2a]"
        href={PRO_PAGE_PATH}
      >
        Upgrade to Pro
      </Link>
    </section>
  );
}

function LicenseCard({
  item,
  entitled,
  membershipResolved,
  membershipLoading,
  application,
}: {
  item: LicenseCenterCatalogItem;
  entitled: boolean;
  membershipResolved: boolean;
  membershipLoading: boolean;
  application: LicenseApplication | null;
}) {
  const Icon = item.icon;
  const preset = LICENSE_PROGRAM_PRESETS[item.key];
  const meta = getLicenseProcessMeta(item.key);
  const locked = item.requiresPro && !entitled;
  const statusUnknown = item.requiresPro && !membershipLoading && !membershipResolved;

  let ctaHref = preset.href;
  let ctaLabel = item.requiresPro ? "Apply" : "Open membership portal";
  let ctaLocked = false;

  if (application) {
    ctaHref = `${preset.href}?status=pending`;
    ctaLabel = applicationCtaLabel(application.status);
  } else if (statusUnknown) {
    ctaLocked = true;
    ctaLabel = "Unavailable";
  } else if (locked) {
    ctaLocked = true;
    ctaLabel = "Upgrade to Pro";
    ctaHref = PRO_PAGE_PATH;
  }

  const cardInner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-flex h-12 w-12 items-center justify-center rounded-xl border ${
            locked || statusUnknown
              ? "border-white/10 bg-black/40 text-zinc-500"
              : "border-white/10 bg-black/40 text-zinc-200"
          }`}
        >
          {locked || statusUnknown ? <Lock size={18} aria-hidden /> : <Icon size={18} aria-hidden />}
        </span>
        {application ? (
          <span className="rounded-md border border-white/10 px-2 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-zinc-300">
            {licenseApplicationStatusLabels[application.status]}
          </span>
        ) : locked ? (
          <ProBadge label="PRO REQUIRED" variant="locked" />
        ) : statusUnknown ? (
          <span className="rounded-md border border-amber-500/25 px-2 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-amber-200">
            Status unknown
          </span>
        ) : entitled && item.requiresPro ? (
          <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-emerald-300">
            Available
          </span>
        ) : null}
      </div>

      <h3 className="mt-5 text-sm font-bold uppercase tracking-[0.12em] text-white">{item.label}</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-500">{item.shortDescription || meta.detail}</p>

      <p className="mt-4 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-zinc-600">
        {locked
          ? "Pro membership required"
          : statusUnknown
            ? "Membership verification required"
            : application
              ? "Application on file"
              : "Requirements available"}
      </p>

      <span
        className={`mt-6 inline-flex min-h-10 items-center text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${
          locked || statusUnknown
            ? "text-[#FFCF6A]"
            : application
              ? "text-zinc-300"
              : "text-[#FF1010]"
        }`}
      >
        {ctaLabel} →
      </span>
    </>
  );

  if (statusUnknown) {
    return (
      <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-5 opacity-80 sm:p-6">
        {cardInner}
      </div>
    );
  }

  return (
    <Link
      className={`flex h-full flex-col rounded-2xl border p-5 transition sm:p-6 ${
        locked
          ? "border-white/10 bg-white/[0.02] hover:border-[#FFCF6A]/35 hover:bg-[#FFCF6A]/5"
          : "border-white/10 bg-white/[0.03] hover:border-[#FF1010]/40 hover:bg-[#FF1010]/5"
      }`}
      href={ctaHref}
    >
      {cardInner}
    </Link>
  );
}

/** Member License Center — Pro-gated credential catalog. */
export function RegisterForLicensePage() {
  const { user, loading } = useAuth();
  const {
    entitled,
    loading: proLoading,
    resolved,
    error: proError,
    plan,
    displayStatus,
    membership,
    refresh,
  } = useProMembership();
  const [applications, setApplications] = useState<LicenseApplication[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [appsError, setAppsError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setApplications([]);
      setAppsLoading(false);
      return;
    }
    let cancelled = false;
    setAppsLoading(true);
    setAppsError(null);
    void fetchLicenseApplicationsByUserId(user.id)
      .then((rows) => {
        if (!cancelled) {
          setApplications(rows.filter((row) => row.applicationProgram !== "jt1_member" && row.applicationProgram !== "legacy"));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setApplications([]);
          setAppsError("Unable to load your license applications.");
        }
      })
      .finally(() => {
        if (!cancelled) setAppsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const appsByProgram = useMemo(() => {
    const map = new Map<LicenseApplicationProgram, LicenseApplication>();
    for (const app of applications) {
      if (!map.has(app.applicationProgram)) map.set(app.applicationProgram, app);
    }
    return map;
  }, [applications]);

  const expiresAt = membership?.expires_at ? formatProExpiryDate(membership.expires_at) : null;

  if (!user) {
    return (
      <AuthGateFallback
        loading={loading}
        loadingLabel="Loading License Center..."
        redirectHref="/login?next=%2Fregister-for-license"
        user={user}
      />
    );
  }

  return (
    <main className="px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-[0.65rem] font-black uppercase tracking-[0.28em] text-[#FF1010]">Credentials</p>
        <h1 className="font-display mt-3 text-4xl uppercase text-white sm:text-5xl">License Center</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
          Credentials for the JuegoTodo community. Browse licenses, apply with Pro, and track your applications.
        </p>

        <div className="mt-8">
          <ProMembershipPanel
            displayStatus={displayStatus}
            entitled={entitled}
            error={proError}
            expiresAt={expiresAt}
            loading={proLoading}
            onRetry={() => void refresh()}
            plan={plan}
            resolved={resolved}
          />
        </div>

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-zinc-500">My licenses</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Your applications</h2>
            </div>
          </div>

          {appsLoading ? (
            <p className="mt-4 text-sm text-zinc-500">Loading applications…</p>
          ) : appsError ? (
            <div className="mt-4 rounded-xl border border-red-500/25 bg-red-500/[0.06] px-4 py-4 text-sm text-red-100">
              <p>{appsError}</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-8">
              <p className="text-sm font-semibold text-white">No license applications</p>
              <p className="mt-2 text-sm text-zinc-500">You haven&apos;t applied for a JuegoTodo license yet.</p>
              <a
                className="mt-4 inline-flex text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#FF1010] hover:text-[#ff3a3a]"
                href="#available-licenses"
              >
                Explore licenses →
              </a>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {applications.map((app) => {
                const key = programToPresetKey(app.applicationProgram);
                const preset = key ? LICENSE_PROGRAM_PRESETS[key] : null;
                return (
                  <li key={app.id}>
                    <Link
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 transition hover:border-white/20"
                      href={preset ? `${preset.href}?status=pending` : "/register-for-license"}
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {preset?.label ?? app.positionTitle ?? "License application"}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-zinc-500">
                          {licenseApplicationStatusLabels[app.status]}
                          {app.submittedAt
                            ? ` · Submitted ${new Date(app.submittedAt).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}`
                            : null}
                        </p>
                      </div>
                      <span className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#FF1010]">
                        {applicationCtaLabel(app.status)} →
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="mt-14" id="available-licenses">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Available licenses
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">Choose a credential</h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-500">
            Browse every JuegoTodo license. Free members can explore requirements; Pro members can apply.
          </p>

          <div className="mt-8 space-y-10">
            {LICENSE_CENTER_CATEGORIES.map((category) => {
              const items = LICENSE_CENTER_CATALOG.filter((item) => item.category === category.id);
              if (items.length === 0) return null;
              return (
                <div key={category.id}>
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-zinc-600">
                    {category.label}
                  </p>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    {items.map((item) => {
                      const app = appsByProgram.get(LICENSE_PROGRAM_PRESETS[item.key].program) ?? null;
                      return (
                        <LicenseCard
                          application={app}
                          entitled={entitled}
                          item={item}
                          key={item.key}
                          membershipLoading={proLoading}
                          membershipResolved={resolved}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
