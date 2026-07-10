"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { AdminPortalShell } from "@/components/admin/AdminPortalShell";
import { AuthGateFallback } from "@/components/auth/AuthGateFallback";
import { LicenseApplicationReviewCard } from "@/components/profile/LicenseApplicationReviewCard";
import type { LicenseApplication } from "@/data/license-applications";
import { fetchLicenseApplicationById } from "@/lib/licenses/storage";
import { useAuth } from "@/lib/auth/context";
import { isAdminProfile } from "@/lib/commerce/storage";

export function LicenseApplicationReviewPage({ applicationId }: { applicationId: string }) {
  const { user, loading } = useAuth();
  const isAdmin = user ? isAdminProfile(user) : false;
  const [application, setApplication] = useState<LicenseApplication | null | undefined>(undefined);

  useEffect(() => {
    if (!user || !isAdmin) {
      return;
    }

    void fetchLicenseApplicationById(applicationId).then(setApplication);
  }, [applicationId, user, isAdmin]);

  function refreshApplication() {
    void fetchLicenseApplicationById(applicationId).then(setApplication);
  }

  if (!user || !isAdmin) {
    return (
      <AuthGateFallback
        loading={loading}
        loadingLabel="Loading application..."
        redirectHref={`/login?next=${encodeURIComponent(`/admin/license-approvals/${applicationId}`)}`}
        user={user && isAdmin ? user : null}
      />
    );
  }

  if (application === undefined) {
    return (
      <AdminPortalShell
        backHref="/profile?tab=membership&view=approvals"
        backLabel="Back to Applications"
        loadingLabel="Loading application..."
        loginNext={`/admin/license-approvals/${applicationId}`}
      >
        <div className="glass-panel rounded-[1.75rem] p-8 text-center text-zinc-400">Loading application...</div>
      </AdminPortalShell>
    );
  }

  if (!application) {
    notFound();
  }

  return (
    <AdminPortalShell
      backHref="/profile?tab=membership&view=approvals"
      backLabel="Back to Applications"
      loginNext={`/admin/license-approvals/${applicationId}`}
    >
      <LicenseApplicationReviewCard application={application} onReviewComplete={refreshApplication} />
    </AdminPortalShell>
  );
}
