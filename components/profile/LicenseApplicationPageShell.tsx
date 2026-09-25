"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { UnifiedLicenseApplicationForm } from "@/components/profile/UnifiedLicenseApplicationForm";
import { AuthGateFallback } from "@/components/auth/AuthGateFallback";
import { ProBadge } from "@/components/pro/ProBadge";
import type { LicenseProgramPresetKey } from "@/data/license-program-presets";
import { LICENSE_PROGRAM_PRESETS } from "@/data/license-program-presets";
import type { LicenseApplication } from "@/data/license-applications";
import { PRO_PAGE_PATH } from "@/data/pro-membership";
import { useAuth } from "@/lib/auth/context";
import { useCommerce } from "@/lib/commerce/context";
import { fetchLicenseApplicationByUserAndProgram } from "@/lib/licenses/storage";
import { getLicenseProcessMeta } from "@/lib/profile/license-process";
import { useProMembership } from "@/lib/pro/use-pro-membership";

export function LicenseApplicationPageShell({ presetKey }: { presetKey: LicenseProgramPresetKey }) {
  const preset = LICENSE_PROGRAM_PRESETS[presetKey];
  const meta = getLicenseProcessMeta(presetKey);
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewSubmissionStatus = searchParams.get("status") === "pending";
  const { user, loading } = useAuth();
  const { userData } = useCommerce();
  const { entitled, loading: proLoading, resolved, error: proError, refresh } = useProMembership();
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const [application, setApplication] = useState<LicenseApplication | null>(null);
  const applicationLoaded = Boolean(user && loadedUserId === user.id);

  useEffect(() => {
    if (presetKey === "jt1_member") {
      router.replace("/membership/apply/local-membership");
    }
  }, [presetKey, router]);

  useEffect(() => {
    if (loading || presetKey === "jt1_member") {
      return;
    }

    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(preset.href)}`);
      return;
    }

    let cancelled = false;

    void fetchLicenseApplicationByUserAndProgram(user.id, preset.program)
      .then((existing) => {
        if (!cancelled) {
          setApplication(existing);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setApplication(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadedUserId(user.id);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [loading, user, router, preset.href, preset.program, presetKey]);

  if (presetKey === "jt1_member") {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4 pt-24">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-zinc-400">
          Redirecting to membership application...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <AuthGateFallback
        loading={loading}
        loadingLabel={preset.loadingLabel}
        redirectHref={`/login?next=${encodeURIComponent(preset.href)}`}
        user={user}
      />
    );
  }

  if (proLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4 pt-24">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-zinc-400">
          Checking Pro membership...
        </p>
      </main>
    );
  }

  if (!resolved) {
    return (
      <main className="px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <Link
            className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-zinc-500 hover:text-zinc-300"
            href="/register-for-license"
          >
            ← Back to License Center
          </Link>
          <div className="mt-6 rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] px-5 py-8">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-amber-200">
              Membership status unavailable
            </p>
            <h1 className="font-display mt-3 text-3xl uppercase text-white">{preset.label}</h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              {proError ?? "We couldn't verify your Pro Membership. Applications stay locked until status is confirmed."}
            </p>
            <button
              className="mt-6 inline-flex min-h-10 items-center rounded-lg border border-amber-300/30 px-4 text-xs font-semibold uppercase tracking-[0.12em] text-amber-50"
              onClick={() => void refresh()}
              type="button"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!entitled) {
    return (
      <main className="px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <Link
            className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-zinc-500 hover:text-zinc-300"
            href="/register-for-license"
          >
            ← Back to License Center
          </Link>

          <p className="mt-8 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#FF1010]">License</p>
          <h1 className="font-display mt-2 text-4xl uppercase text-white">{preset.label}</h1>
          <p className="mt-2 text-sm text-zinc-500">{meta.detail}</p>

          <section className="mt-8 border-t border-white/10 pt-6">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-zinc-500">About this license</p>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">{meta.description}</p>
          </section>

          <section className="mt-8 border-t border-white/10 pt-6">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Application process
            </p>
            <ol className="mt-4 space-y-3">
              {meta.steps.slice(0, 4).map((step, index) => (
                <li className="flex gap-3 text-sm text-zinc-300" key={step}>
                  <span className="font-mono text-xs text-zinc-600">{String(index + 1).padStart(2, "0")}</span>
                  {step}
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-8 rounded-2xl border border-[#FFCF6A]/25 bg-[#FFCF6A]/[0.06] px-5 py-6">
            <ProBadge label="PRO REQUIRED" variant="locked" />
            <h2 className="mt-3 text-lg font-semibold text-white">Pro membership required</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              License applications are available to JuegoTodo Pro Members. JT1 Local Membership does not unlock role
              licenses.
            </p>
            <Link
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#FF1010] px-5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#ff2a2a]"
              href={PRO_PAGE_PATH}
            >
              Upgrade to Pro
            </Link>
          </section>
        </div>
      </main>
    );
  }

  if (!applicationLoaded) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4 pt-24">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-zinc-400">{preset.loadingLabel}</p>
      </main>
    );
  }

  return (
    <UnifiedLicenseApplicationForm
      initialApplication={application}
      presetKey={presetKey}
      showConfirmationInitially={application?.status === "pending" && viewSubmissionStatus}
      user={user}
      userPhone={userData.phone}
    />
  );
}
