"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { LicenseApplication } from "@/data/license-applications";
import type { UserProfile } from "@/lib/auth/types";

type Jt1MemberLicenseFormProps = {
  user: UserProfile;
  userPhone: string;
  initialApplication: LicenseApplication | null;
  showConfirmationInitially: boolean;
};

/** JT1 local membership is owned by the Membership Portal lifecycle. */
export function Jt1MemberLicenseForm(_props: Jt1MemberLicenseFormProps) {
  const router = useRouter();

  useEffect(() => {
    router.replace("/membership/apply/local-membership");
  }, [router]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 pt-24">
      <p className="text-sm font-black uppercase tracking-[0.24em] text-zinc-400">
        Redirecting to membership application...
      </p>
    </main>
  );
}
