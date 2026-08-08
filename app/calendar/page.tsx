import type { Metadata } from "next";
import { Suspense } from "react";
import { CalendarPage } from "@/components/CalendarPage";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Official Fight Calendar",
  description:
    "View the official Juego Todo fight calendar with upcoming cards, countdowns, venues, and ticket links for Filipino combat sports events.",
  path: "/calendar",
  image: "/events/juego-todo-sta-lucia-barrio-brawls.png",
  keywords: ["Juego Todo calendar", "fight schedule Philippines", "upcoming events"],
});

export default function CalendarRoutePage() {
  return (
    <>
      <BreadcrumbJsonLd items={resolveBreadcrumbs("/calendar", "Official Calendar")} />
      <Suspense fallback={null}>
        <CalendarPage />
      </Suspense>
    </>
  );
}
