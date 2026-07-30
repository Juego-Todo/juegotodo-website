import type { Metadata } from "next";
import { Suspense } from "react";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { WelcomePathPage } from "@/components/WelcomePathPage";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Welcome — Choose Your Path",
  description:
    "Choose how you want to start with Juego Todo — member portal, fighter license, coach registration, or club ownership.",
  path: "/welcome",
  keywords: ["Juego Todo welcome", "fighter registration", "JTGC license"],
});

export default function WelcomePage() {
  return (
    <>
      <BreadcrumbJsonLd items={resolveBreadcrumbs("/welcome", "Welcome")} />
      <Suspense
        fallback={
          <main className="flex min-h-[60vh] items-center justify-center px-4 pt-24">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-zinc-400">Loading...</p>
          </main>
        }
      >
        <WelcomePathPage />
      </Suspense>
    </>
  );
}
