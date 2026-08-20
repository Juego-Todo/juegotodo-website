import type { Metadata } from "next";
import { Suspense } from "react";
import { MembershipApplyLocalPage } from "@/components/membership/MembershipApplyLocalPage";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Apply for Local Membership",
  description:
    "Complete the Juego Todo local membership application, upload required documents, and submit payment proof for administrative review.",
  path: "/membership/apply/local-membership",
  noIndex: true,
});

export default function LocalMembershipApplyRoute() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[60vh] items-center justify-center px-4 pt-24">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-zinc-400">
            Loading membership application...
          </p>
        </main>
      }
    >
      <MembershipApplyLocalPage />
    </Suspense>
  );
}
