import type { Metadata } from "next";
import { Suspense } from "react";
import { ProMembershipLanding } from "@/components/pro/ProMembershipLanding";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "JuegoTodo Pro",
  description:
    "Annual JuegoTodo Pro membership unlocking the License Center and role credential applications.",
  path: "/pro",
  keywords: ["JuegoTodo Pro", "Pro membership", "license center", "credentials"],
});

export default function ProPage() {
  return (
    <Suspense
      fallback={
        <main className="px-4 pb-20 pt-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl text-sm text-zinc-500">Loading Pro membership…</div>
        </main>
      }
    >
      <ProMembershipLanding />
    </Suspense>
  );
}
