"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthGateFallback } from "@/components/auth/AuthGateFallback";
import { MembershipApplicationsList } from "@/components/membership/MembershipApplicationsList";
import { useAuth } from "@/lib/auth/context";

export function MembershipApplicationsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent("/membership/applications")}`);
    }
  }, [loading, user, router]);

  if (!user) {
    return (
      <AuthGateFallback
        loading={loading}
        loadingLabel="Loading applications..."
        redirectHref={`/login?next=${encodeURIComponent("/membership/applications")}`}
        user={user}
      />
    );
  }

  return <MembershipApplicationsList />;
}
