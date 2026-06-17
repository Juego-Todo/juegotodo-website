import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  RotateCcw,
  Scale,
  ShieldCheck,
  Swords,
  Trophy,
  UserCheck,
  XCircle,
} from "lucide-react";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { PageNavigation } from "@/components/PageNavigation";
import { PrevNextNav } from "@/components/PrevNextNav";
import { getRulebook, rulebooks } from "@/data/rules";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { getRulebookNeighbors } from "@/lib/navigation/prev-next";

type PageProps = {
  params: Promise<{ ruleSlug: string }>;
};

export function generateStaticParams() {
  return rulebooks.map((rulebook) => ({ ruleSlug: rulebook.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ruleSlug } = await params;
  const rulebook = getRulebook(ruleSlug);

  if (!rulebook) {
    return {};
  }

  return {
    title: rulebook.title,
    description: rulebook.summary,
  };
}

export default async function RulebookPage({ params }: PageProps) {
  const { ruleSlug } = await params;
  const rulebook = getRulebook(ruleSlug);

  if (!rulebook) {
    notFound();
  }

  const breadcrumbs = resolveBreadcrumbs(`/rules-regulations/${ruleSlug}`, rulebook.division);
  const neighbors = getRulebookNeighbors(ruleSlug);

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <main className="px-4 pb-0 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        <div className="mx-auto max-w-7xl pb-4">
          <PageNavigation
            currentLabel={rulebook.division}
          />
        </div>
      <section className="mx-auto max-w-7xl pb-8">
        <div className="grid gap-3 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <div className={`relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br ${rulebook.accent} p-5 shadow-[0_24px_80px_rgba(0,0,0,0.46)] sm:rounded-[1.75rem] lg:p-4`}>
            <div className="cinematic-grid absolute inset-0 opacity-25" aria-hidden />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.18),transparent_18rem),linear-gradient(120deg,rgba(0,0,0,0.08),rgba(0,0,0,0.7))]" aria-hidden />
            <div className="absolute -right-12 bottom-8 h-40 w-40 rounded-3xl border-4 border-red-500/80 bg-black/50 rotate-12" aria-hidden />
            <div className="relative z-10 flex min-h-[18rem] flex-col justify-between sm:min-h-[20rem]">
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.24em] text-white sm:text-xs">
                  {rulebook.eyebrow}
                </span>
                <ShieldCheck className="text-red-200" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.26em] text-red-100">
                  {rulebook.title}
                </p>
                <h1 className="font-display mt-3 max-w-2xl text-6xl uppercase leading-[0.88] text-white sm:text-7xl lg:text-6xl">
                  {rulebook.division}
                </h1>
                <p className="mt-3 max-w-xl text-xs font-bold uppercase tracking-[0.2em] text-zinc-300">
                  {rulebook.ageRange} {"//"} 2026 Season
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row lg:mt-4">
                  <a
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-red-500"
                    href={rulebook.pdfHref}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Download Official PDF
                    <Download className="ml-2" size={16} aria-hidden />
                  </a>
                  <span className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-zinc-300">
                    Version 1.0
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-[1.5rem] p-4 sm:rounded-[1.75rem] lg:p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-4xl uppercase leading-none text-white sm:text-5xl lg:text-4xl">
                  Rules Snapshot
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-300 sm:text-base sm:leading-7">{rulebook.summary}</p>
              </div>
              <span className="hidden rounded-full bg-red-600/20 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-red-200 sm:inline-flex">
                Live Rules
              </span>
            </div>
            <div className="grid gap-2.5">
              <RoundCard number="01" icon={<Swords aria-hidden />} title="Doble Baston" detail="2 sticks" text="Full weapon engagement with two official Arnis sticks." />
              <RoundCard number="02" icon={<Swords aria-hidden />} title="Solo Baston" detail="1 stick" text="One-stick format with limited empty-hand body strikes." />
              <RoundCard number="03" icon={<UserCheck aria-hidden />} title="Mano Y Mano" detail="Empty hand" text="FMA striking, takedowns, grappling, and no weapons." />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <MiniStat icon={<CalendarDays aria-hidden />} label="Rounds" value="3" />
              <MiniStat icon={<RotateCcw aria-hidden />} label="Transitions" value="2" />
              <MiniStat icon={<ShieldCheck aria-hidden />} label="Equipment" value="Checked" />
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          <VisualPanel
            title="Weapon Progression"
            items={[
              ["Round 1", "Doble Baston", "2 sticks"],
              ["Round 2", "Solo Baston", "1 stick"],
              ["Round 3", "Mano Y Mano", "Empty hand"],
            ]}
          />
          <TargetAreasPanel />
          <PrinciplesPanel />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <RuleList icon="gear" title="Weapon Progress Gear" items={rulebook.gear.weaponRounds} />
          <RuleList icon="hand" title="Mano Y Mano Gear" items={rulebook.gear.manoYMano} />
          <RuleList icon="allowed" title="Allowed Actions" items={rulebook.allowed} />
          <RuleList icon="prohibited" title="Prohibited Actions" items={rulebook.prohibited} />
          <RuleList icon="safety" title="Safety Parameters" items={rulebook.safety} />
          <RuleList icon="compliance" title="Compliance & Penalties" items={rulebook.compliance} />
        </div>

        <div className="glass-panel mt-3 overflow-hidden rounded-[1.5rem] border-red-500/20 lg:hidden">
          <div className="grid gap-4 bg-[radial-gradient(circle_at_70%_10%,rgba(229,9,20,0.34),transparent_22rem),linear-gradient(135deg,#180305,#050506)] p-5 sm:grid-cols-[0.9fr_1.1fr] sm:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300">
                Ready To Compete?
              </p>
              <h2 className="font-display mt-2 text-5xl uppercase leading-none text-white">
                Know The Rules. Train Hard.
              </h2>
              <p className="mt-2 text-sm text-zinc-300">
                Review the rulebook, register your gym, and confirm athlete requirements before event week.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <ActionLink href={rulebook.pdfHref} label="Download Rulebook" />
              <ActionLink href="/registration" label="Register Your Gym" />
              <ActionLink href="/rules-regulations" label="All Rulebooks" />
              <ActionLink href="/contact" label="Fighter Requirements" />
            </div>
          </div>
        </div>
      </section>
      </main>
      <PrevNextNav neighbors={neighbors} />
    </>
  );
}

function RoundCard({
  number,
  icon,
  title,
  detail,
  text,
}: {
  number: string;
  icon: ReactNode;
  title: string;
  detail: string;
  text: string;
}) {
  return (
    <div className="grid grid-cols-[4.5rem_auto_1fr] items-start gap-3 rounded-2xl border border-white/10 bg-black/35 p-3.5">
      <div>
        <p className="text-[0.58rem] font-black uppercase tracking-[0.2em] text-red-300">Round</p>
        <p className="font-display text-4xl leading-none text-white">{number}</p>
      </div>
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-red-500/25 bg-red-500/10 text-red-200">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-white">{title}</p>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-300">{detail}</p>
        <p className="mt-1 text-xs leading-5 text-zinc-400">{text}</p>
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <div className="mb-2 text-red-300">{icon}</div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-white">{value}</p>
      <p className="mt-1 text-[0.62rem] uppercase tracking-[0.16em] text-zinc-500">{label}</p>
    </div>
  );
}

function VisualPanel({ title, items }: { title: string; items: string[][] }) {
  return (
    <section className="glass-panel rounded-[1.5rem] p-4 lg:p-5">
      <h2 className="font-display text-3xl uppercase text-white">{title}</h2>
      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {items.map(([round, label, detail]) => (
          <div className="rounded-2xl border border-white/10 bg-black/35 p-3 text-center" key={round}>
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-200">
              {detail === "Empty hand" ? <UserCheck aria-hidden /> : <Swords aria-hidden />}
            </div>
            <p className="mt-3 text-[0.58rem] font-black uppercase tracking-[0.18em] text-red-300">{round}</p>
            <p className="mt-1 text-xs font-black uppercase leading-4 text-white">{label}</p>
            <p className="text-[0.62rem] uppercase tracking-[0.12em] text-zinc-500">{detail}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm leading-6 text-zinc-400">
        The fight evolves from weapon-to-weapon, to single-stick control, to empty-hand combat.
      </p>
    </section>
  );
}

function TargetAreasPanel() {
  return (
    <section className="glass-panel rounded-[1.5rem] p-4 lg:p-5">
      <h2 className="font-display text-3xl uppercase text-white">Allowed Target Areas</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,0.9fr)_1.1fr] sm:items-center">
        <div className="flex min-h-[11rem] items-center justify-center rounded-2xl border border-white/10 bg-black/35 px-4 py-5">
          <FighterSilhouette />
        </div>
        <div className="space-y-3 text-sm leading-6 text-zinc-300">
          <p><span className="font-bold text-white">Legal:</span> Head, body, arms, and legs where allowed by round.</p>
          <p><span className="font-bold text-white">Protected:</span> Back of head, spine, groin, throat, and eyes.</p>
          <p><span className="font-bold text-white">Round-based:</span> Youth and weapon rounds apply stricter head-target rules.</p>
        </div>
      </div>
    </section>
  );
}

function FighterSilhouette() {
  return (
    <svg
      aria-hidden
      className="h-[9.5rem] w-auto max-w-full"
      fill="none"
      viewBox="0 0 80 120"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="40" cy="12" r="8" fill="rgba(229,9,20,0.3)" stroke="rgba(248,113,113,0.85)" strokeWidth="1.2" />
      <ellipse cx="40" cy="38" rx="14" ry="18" fill="rgba(229,9,20,0.2)" stroke="rgba(248,113,113,0.85)" strokeWidth="1.2" />
      <rect fill="rgba(229,9,20,0.5)" height="28" rx="2" width="4" x="22" y="28" />
      <rect fill="rgba(229,9,20,0.5)" height="28" rx="2" width="4" x="54" y="28" />
      <rect fill="rgba(229,9,20,0.5)" height="34" rx="2" width="4" x="32" y="52" />
      <rect fill="rgba(229,9,20,0.5)" height="34" rx="2" width="4" x="44" y="52" />
    </svg>
  );
}

function PrinciplesPanel() {
  const principles = [
    ["Safety First", "Protect athletes and keep the competition environment controlled."],
    ["Fair Competition", "Skill, strategy, and control decide the outcome."],
    ["Respect", "Respect opponents, officials, and the rules."],
  ];

  return (
    <section className="glass-panel rounded-[1.5rem] p-4 lg:p-5">
      <h2 className="font-display text-3xl uppercase text-white">Competition Principles</h2>
      <div className="mt-4 space-y-3.5">
        {principles.map(([title, text], index) => (
          <div className="grid grid-cols-[auto_1fr] gap-3" key={title}>
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-red-300">
              {index === 0 ? <ShieldCheck aria-hidden /> : index === 1 ? <Scale aria-hidden /> : <Trophy aria-hidden />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-white">{title}</p>
              <p className="text-xs leading-5 text-zinc-400 sm:text-sm sm:leading-6">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function RuleList({
  title,
  items,
  icon,
}: {
  title: string;
  items: string[];
  icon: "gear" | "hand" | "allowed" | "prohibited" | "safety" | "compliance";
}) {
  const Icon =
    icon === "allowed"
      ? CheckCircle2
      : icon === "prohibited"
        ? XCircle
        : icon === "safety"
          ? ShieldCheck
          : icon === "compliance"
            ? AlertTriangle
            : icon === "hand"
              ? UserCheck
              : FileText;

  return (
    <section className="glass-panel rounded-[1.35rem] p-4 sm:rounded-[1.5rem] lg:p-5">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-300">
          <Icon size={18} aria-hidden />
        </span>
        <h2 className="font-display text-2xl uppercase text-white">{title}</h2>
      </div>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li className="flex gap-2.5 text-sm leading-6 text-zinc-300" key={item}>
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500 shadow-[0_0_16px_rgba(229,9,20,0.75)]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ActionLink({ href, label }: { href: string; label: string }) {
  const external = href.endsWith(".pdf");

  if (external) {
    return (
      <a
        className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-zinc-200 transition hover:border-red-500/40 hover:text-white"
        href={href}
        rel="noreferrer"
        target="_blank"
      >
        {label}
      </a>
    );
  }

  return (
    <Link
      className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-zinc-200 transition hover:border-red-500/40 hover:text-white"
      href={href}
    >
      {label}
    </Link>
  );
}
