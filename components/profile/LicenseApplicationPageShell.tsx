"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { UnifiedLicenseApplicationForm } from "@/components/profile/UnifiedLicenseApplicationForm";
import type { LicenseProgramPresetKey } from "@/data/license-program-presets";
import { LICENSE_PROGRAM_PRESETS } from "@/data/license-program-presets";
import { resolveLicenseApplicationHref, type LicenseApplication } from "@/data/license-applications";
import { useAuth } from "@/lib/auth/context";
import { useCommerce } from "@/lib/commerce/context";
import { fetchLicenseApplicationByUserId } from "@/lib/licenses/storage";

function normalizePath(path: string) {
  return path.split("?")[0];
}

export function LicenseApplicationPageShell({ presetKey }: { presetKey: LicenseProgramPresetKey }) {
  const preset = LICENSE_PROGRAM_PRESETS[presetKey];
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewSubmissionStatus = searchParams.get("status") === "pending";
  const { user, loading } = useAuth();
  const { userData } = useCommerce();
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const [application, setApplication] = useState<LicenseApplication | null>(null);
  const applicationLoaded = Boolean(user && loadedUserId === user.id);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(preset.href)}`);
      return;
    }

    let cancelled = false;
    let redirecting = false;

    void fetchLicenseApplicationByUserId(user.id)
      .then((existing) => {
        if (cancelled) {
          return;
        }

        if (existing && !preset.match(existing)) {
          const targetHref = resolveLicenseApplicationHref(existing);
          if (normalizePath(targetHref) !== normalizePath(preset.href)) {
            redirecting = true;
            router.replace(targetHref);
            return;
          }
        }

        setApplication(existing);
      })
      .catch(() => {
        if (!cancelled) {
          setApplication(null);
        }
      })
      .finally(() => {
        if (!cancelled && !redirecting) {
          setLoadedUserId(user.id);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [loading, user, router, preset]);

  if (loading || !user || !applicationLoaded) {
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
