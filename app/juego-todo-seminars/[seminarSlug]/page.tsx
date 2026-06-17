import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { PageNavigation } from "@/components/PageNavigation";
import { PrevNextNav } from "@/components/PrevNextNav";
import { SeminarRegistrationPanel } from "@/components/SeminarRegistrationPanel";
import {
  formatSeminarDate,
  getScheduledSeminar,
  scheduledSeminars,
  seminarTopics,
} from "@/data/seminars";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { getSeminarNeighbors } from "@/lib/navigation/prev-next";

type PageProps = {
  params: Promise<{ seminarSlug: string }>;
};

export function generateStaticParams() {
  return scheduledSeminars.map((seminar) => ({ seminarSlug: seminar.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { seminarSlug } = await params;
  const seminar = getScheduledSeminar(seminarSlug);

  if (!seminar) {
    return {};
  }

  return {
    title: seminar.title,
    description: seminar.summary,
  };
}

export default async function SeminarDetailPage({ params }: PageProps) {
  const { seminarSlug } = await params;
  const seminar = getScheduledSeminar(seminarSlug);

  if (!seminar) {
    notFound();
  }

  const topics = seminar.topicSlugs
    .map((slug) => seminarTopics.find((topic) => topic.slug === slug))
    .filter(Boolean);

  const breadcrumbs = resolveBreadcrumbs(`/juego-todo-seminars/${seminarSlug}`, seminar.title);
  const neighbors = getSeminarNeighbors(seminarSlug);

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <main className="px-4 pb-0 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        <div className="mx-auto max-w-7xl pb-4">
          <PageNavigation currentLabel={seminar.title} />
        </div>
      <section className="mx-auto max-w-7xl pb-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
          <div className={`glass-panel overflow-hidden rounded-[1.75rem] bg-gradient-to-br ${seminar.tone} p-6 sm:p-8`}>
            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] ${
                  seminar.pricing.type === "free"
                    ? "bg-emerald-500/20 text-emerald-100"
                    : "bg-red-600 text-white"
                }`}
              >
                {seminar.pricing.type === "free" ? "Free Seminar" : seminar.pricing.amount}
              </span>
              <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-white">
                {seminar.format}
              </span>
            </div>
            <h1 className="font-display mt-8 text-5xl uppercase leading-[0.92] text-white sm:text-7xl">
              {seminar.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-200">{seminar.summary}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <InfoChip icon={<CalendarDays size={16} aria-hidden />} label="Date" value={formatSeminarDate(seminar.date)} />
              <InfoChip icon={<Clock3 size={16} aria-hidden />} label="Time" value={seminar.time} />
              <InfoChip icon={<MapPin size={16} aria-hidden />} label="Venue" value={`${seminar.venue}, ${seminar.city}`} />
              <InfoChip icon={<Users size={16} aria-hidden />} label="Availability" value={`${seminar.spotsLeft} spots left`} />
            </div>
          </div>

          <SeminarRegistrationPanel seminar={seminar} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="glass-panel rounded-[1.5rem] p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-red-400" size={18} aria-hidden />
              <h2 className="font-display text-3xl uppercase text-white">Juego Todo Rules Focus</h2>
            </div>
            <p className="mt-4 text-sm leading-7 text-zinc-300 sm:text-base">{seminar.rulesFocus}</p>
            <p className="mt-4 text-sm leading-7 text-zinc-400">{seminar.pricing.note}</p>
          </section>

          <section className="glass-panel rounded-[1.5rem] p-5 sm:p-6">
            <h2 className="font-display text-3xl uppercase text-white">What You Will Cover</h2>
            <ul className="mt-5 space-y-3">
              {seminar.highlights.map((item) => (
                <li className="flex gap-3 text-sm leading-6 text-zinc-300 sm:text-base" key={item}>
                  <CheckCircle2 className="mt-0.5 shrink-0 text-red-400" size={18} aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-8">
          <h2 className="font-display text-4xl uppercase text-white">Seminar Topics</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic) =>
              topic ? (
                <article className="glass-panel rounded-[1.5rem] p-5" key={topic.slug}>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-red-300">{topic.audience}</p>
                  <h3 className="font-display mt-2 text-3xl uppercase text-white">{topic.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{topic.description}</p>
                </article>
              ) : null,
            )}
          </div>
        </section>
      </section>
      </main>
      <PrevNextNav neighbors={neighbors} />
    </>
  );
}

function InfoChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
      <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-red-300">
        {icon}
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold leading-6 text-white">{value}</p>
    </div>
  );
}
