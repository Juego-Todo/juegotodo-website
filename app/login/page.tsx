import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPage } from "@/components/AuthPage";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Sign In or Create Account",
  description:
    "Create your Juego Todo account or sign in to access your profile, tickets, orders, and JTGC membership.",
  path: "/login",
  keywords: ["Juego Todo login", "create account"],
});

export default function LoginPage() {
  return (
    <>
      <BreadcrumbJsonLd items={resolveBreadcrumbs("/login", "Register & Sign In")} />
      <Suspense
        fallback={
          <main className="flex min-h-[60vh] items-center justify-center px-4 pt-24">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-zinc-400">
              Loading...
            </p>
          </main>
        }
      >
        <AuthPage />
      </Suspense>
    </>
  );
}
