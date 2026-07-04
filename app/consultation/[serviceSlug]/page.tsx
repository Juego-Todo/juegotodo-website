import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock3, Sparkles } from "lucide-react";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { PageNavigation } from "@/components/PageNavigation";
import { consultationServices, getConsultationService } from "@/data/consultations";
import { formatCurrency } from "@/lib/commerce/pricing";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";

type PageProps = {
  params: Promise<{ serviceSlug: string }>;
};

export function generateStaticParams() {
  return consultationServices.map((service) => ({ serviceSlug: service.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { serviceSlug } = await params;
  const service = getConsultationService(serviceSlug);

  if (!service) {
    return {};
  }

  return {
    title: service.name,
    description: service.description,
  };
}

export default async function ConsultationServicePage({ params }: PageProps) {
  const { serviceSlug } = await params;
  const service = getConsultationService(serviceSlug);

  if (!service) {
    notFound();
  }

  return (
    <>
      <BreadcrumbJsonLd items={resolveBreadcrumbs(`/consultation/${service.slug}`, service.name)} />
      <main className="overflow-hidden px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
        <section className="relative mx-auto max-w-7xl py-10 sm:py-14">
          <PageNavigation currentLabel={service.name} />

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300">
                Consultation Atelier
              </p>
              <h1 className="font-display mt-3 max-w-4xl text-5xl uppercase leading-[0.9] text-white sm:text-7xl">
                {service.name}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-300 sm:text-lg">
                {service.longDescription}
              </p>
            </div>

            <aside className="rounded-[1.75rem] border border-red-500/20 bg-[radial-gradient(circle_at_40%_0%,rgba(255,16,16,0.18),transparent_18rem),linear-gradient(145deg,#171717,#050505)] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-[#FF1010] px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white">
                  {service.audience}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-300">
                  <Clock3 size={12} aria-hidden />
                  {service.duration}
                </span>
              </div>
              <p className="font-display mt-6 text-5xl uppercase text-red-100">
                {formatCurrency(service.price)}
              </p>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Reserve your preferred time on the booking page and submit payment after selecting
                a calendar slot.
              </p>
              <Link
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-red-600 px-6 py-3.5 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-red-500"
                href="/consultation/book"
              >
                Book This Consultation
                <ArrowRight className="ml-2" size={18} aria-hidden />
              </Link>
            </aside>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-5 pb-14 sm:pb-20 lg:grid-cols-3">
          <InfoPanel title="Ideal For" items={service.idealFor} />
          <InfoPanel title="What Is Included" items={service.includes} />
          <InfoPanel title="Expected Outcomes" items={service.outcomes} />
        </section>

        <section className="mx-auto max-w-7xl pb-14 sm:pb-20">
          <div className="grid gap-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-red-300">
                <Sparkles size={15} aria-hidden />
                How It Works
              </p>
              <h2 className="font-display mt-3 text-4xl uppercase leading-none text-white sm:text-5xl">
                A Calm, Private Process
              </h2>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                Each consultation is structured so you know what to prepare, what happens during
                the session, and what you can act on afterward.
              </p>
            </div>

            <div className="grid gap-3">
              {service.process.map((step, index) => (
                <div className="grid gap-4 rounded-[1.25rem] border border-white/10 bg-black/20 p-4 sm:grid-cols-[3rem_1fr] sm:items-center" key={step}>
                  <span className="font-display grid h-12 w-12 place-items-center rounded-full bg-[#FF1010] text-2xl uppercase text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-200">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function InfoPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="glass-panel rounded-[1.5rem] p-5 sm:p-6">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-red-300">{title}</p>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li className="flex gap-3 text-sm leading-6 text-zinc-300" key={item}>
            <CheckCircle2 className="mt-0.5 shrink-0 text-red-300" size={16} aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
