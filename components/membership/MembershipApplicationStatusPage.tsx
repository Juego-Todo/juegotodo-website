"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthGateFallback } from "@/components/auth/AuthGateFallback";
import { MembershipApplicationStatusView } from "@/components/membership/MembershipApplicationStatusView";
import { useAuth } from "@/lib/auth/context";

export function MembershipApplicationStatusPage({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const nextHref = `/membership/application/${applicationId}`;

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(nextHref)}`);
    }
  }, [loading, user, router, nextHref]);

  if (!user) {
    return (
      <AuthGateFallback
        loading={loading}
        loadingLabel="Loading application status..."
        redirectHref={`/login?next=${encodeURIComponent(nextHref)}`}
        user={user}
      />
    );
  }

  return <MembershipApplicationStatusView applicationId={applicationId} />;
}
