"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { UnifiedLicenseApplicationForm } from "@/components/profile/UnifiedLicenseApplicationForm";
import { AuthGateFallback } from "@/components/auth/AuthGateFallback";
import { ProGate } from "@/components/pro/ProGate";
import type { LicenseProgramPresetKey } from "@/data/license-program-presets";
import { LICENSE_PROGRAM_PRESETS } from "@/data/license-program-presets";
import type { LicenseApplication } from "@/data/license-applications";
import { useAuth } from "@/lib/auth/context";
import { useCommerce } from "@/lib/commerce/context";
import { fetchLicenseApplicationByUserAndProgram } from "@/lib/licenses/storage";
import { useProMembership } from "@/lib/pro/use-pro-membership";

export function LicenseApplicationPageShell({ presetKey }: { presetKey: LicenseProgramPresetKey }) {
  const preset = LICENSE_PROGRAM_PRESETS[presetKey];
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewSubmissionStatus = searchParams.get("status") === "pending";
  const { user, loading } = useAuth();
  const { userData } = useCommerce();
  const { entitled, loading: proLoading } = useProMembership();
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

  if (!entitled) {
    return (
      <main className="px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <ProGate
            entitled={false}
            title="JuegoTodo Pro required"
            description={`Apply for ${preset.title} after activating an annual Pro membership. JT1 Local Membership does not unlock role licenses.`}
          >
            {null}
          </ProGate>
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
