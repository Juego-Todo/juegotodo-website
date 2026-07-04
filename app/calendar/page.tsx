import type { Metadata } from "next";
import { CalendarPage } from "@/components/CalendarPage";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";

export const metadata: Metadata = {
  title: "Official Calendar",
  description: "View the official Juego Todo fight calendar with upcoming cards, countdowns, and event results.",
};

export default function CalendarRoutePage() {
  return (
    <>
      <BreadcrumbJsonLd items={resolveBreadcrumbs("/calendar", "Official Calendar")} />
      <CalendarPage />
    </>
  );
}
