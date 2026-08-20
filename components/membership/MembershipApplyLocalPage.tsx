"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthGateFallback } from "@/components/auth/AuthGateFallback";
import { MembershipApplicationWizard } from "@/components/membership/MembershipApplicationWizard";
import { useAuth } from "@/lib/auth/context";
import { useCommerce } from "@/lib/commerce/context";

const APPLY_HREF = "/membership/apply/local-membership";

export function MembershipApplyLocalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const { userData } = useCommerce();
  const applicationId = searchParams.get("applicationId");
  const nextHref = applicationId ? `${APPLY_HREF}?applicationId=${encodeURIComponent(applicationId)}` : APPLY_HREF;

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(nextHref)}`);
    }
  }, [loading, user, router, nextHref]);

  if (!user) {
    return (
      <AuthGateFallback
        loading={loading}
        loadingLabel="Loading membership application..."
        redirectHref={`/login?next=${encodeURIComponent(nextHref)}`}
        user={user}
      />
    );
  }

  return <MembershipApplicationWizard phone={userData.phone} user={user} />;
}
