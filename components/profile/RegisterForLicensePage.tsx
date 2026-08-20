"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** JT1 local membership now lives in the Membership Portal. */
export function RegisterForLicensePage() {
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
