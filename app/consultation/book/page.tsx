import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { ConsultationBookingPage } from "@/components/ConsultationPage";
import { PageNavigation } from "@/components/PageNavigation";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Book a Consultation",
  description:
    "Reserve a Feng Shui, BaZi, or destiny consultation slot and complete payment after choosing your appointment.",
  path: "/consultation/book",
  keywords: ["book consultation", "Feng Shui appointment"],
});

export default function ConsultationBookingRoute() {
  return (
    <>
      <BreadcrumbJsonLd items={resolveBreadcrumbs("/consultation/book", "Book Consultation")} />
      <main className="overflow-hidden px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
        <section className="relative mx-auto max-w-7xl py-10 sm:py-14">
          <PageNavigation currentLabel="Book Consultation" />
          <h1 className="font-display mt-3 text-5xl uppercase leading-none text-white sm:text-7xl">
            Book Consultation
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-300 sm:text-lg">
            Choose a consultation service, reserve an open calendar slot, and complete payment for your session.
          </p>
        </section>
        <ConsultationBookingPage />
      </main>
    </>
  );
}
