"use client";

import { ArrowRight, Download, Mail, MapPin, Play, ShieldCheck, ShoppingBag, Trophy, Users } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import { CountdownTimer } from "@/components/CountdownTimer";
import { MotionSection } from "@/components/MotionSection";
import { RankingsFull } from "@/components/RankingsSystem";
import { SeminarsHub } from "@/components/SeminarsHub";
import {
  events,
  fighters,
  mediaReels,
  pageContent,
  partners,
  shopProducts,
  systems,
  type PageSlug,
} from "@/data/site";
import { rulebooks } from "@/data/rules";

export function InteriorPage({ slug }: { slug: PageSlug }) {
  const content = pageContent[slug];
  const isRulesPage = slug === "rules-regulations";

  return (
    <main className="overflow-hidden px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
      <section className={`relative mx-auto max-w-7xl ${isRulesPage ? "py-6 sm:py-8 lg:py-10" : "py-10 sm:py-14 lg:py-16"}`}>
        <div className="cinematic-grid absolute inset-0 opacity-30" aria-hidden />
        <div className={`relative ${isRulesPage ? "max-w-4xl" : "max-w-5xl"}`}>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300 sm:text-sm sm:tracking-[0.34em]">{content.eyebrow}</p>
          <h1 className={`font-display mt-4 uppercase leading-[0.9] text-white ${
            isRulesPage
              ? "text-[clamp(2.75rem,12vw,4.5rem)] sm:text-6xl lg:text-7xl"
              : "text-[clamp(3.25rem,15vw,5.35rem)] sm:text-7xl lg:text-8xl"
          }`}>
            {content.title}
          </h1>
          <p className={`max-w-3xl text-base leading-7 text-zinc-300 ${
            isRulesPage ? "mt-4 sm:text-lg" : "mt-5 sm:mt-7 sm:text-xl sm:leading-8"
          }`}>{content.intro}</p>
        </div>
      </section>

      {slug === "events" ? <EventsSection /> : null}
      {slug === "fighters" ? <FightersSection /> : null}
      {slug === "rankings" ? <RankingsSection /> : null}
      {slug === "media" ? <MediaSection /> : null}
      {slug === "shop" ? <ShopSection /> : null}
      {slug === "registration" ? <RegistrationSection /> : null}
      {slug === "partnerships" ? <PartnershipSection /> : null}
      {slug === "juego-todo-seminars" ? <SeminarsHub /> : null}
      {slug === "rules-regulations" ? <RulesSection /> : null}
      {slug === "about-juego-todo" ? <AboutSection /> : null}
      {slug === "contact" ? <ContactSection /> : null}
    </main>
  );
}

function EventsSection() {
  return (
    <MotionSection className="mx-auto max-w-7xl space-y-6 pb-14 sm:pb-20">
      <Link
        className="glass-panel group block overflow-hidden rounded-[1.75rem] border-red-500/20 transition hover:-translate-y-1 hover:border-red-500/40"
        href="/juego-todo-seminars"
      >
        <div className="grid gap-6 bg-[radial-gradient(circle_at_80%_10%,rgba(229,9,20,0.28),transparent_24rem),linear-gradient(135deg,#120305,#050506)] p-6 sm:grid-cols-[1.1fr_0.9fr] sm:items-center sm:p-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300">
              Juego Todo Seminars
            </p>
            <h2 className="font-display mt-3 text-4xl uppercase leading-none text-white sm:text-5xl">
              Calendar, Topics, And Registration
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">
              First-time joiners can start with Disarming, Striking, Legs, Grappling, and free Rules
              Briefings — with paid and unpaid sessions mapped to official JT competition rules.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-emerald-200">
              Free & Paid Sessions
            </span>
            <span className="inline-flex items-center text-sm font-black uppercase tracking-[0.18em] text-white">
              View Seminar Calendar
              <ArrowRight className="ml-2 transition group-hover:translate-x-1" size={16} aria-hidden />
            </span>
          </div>
        </div>
      </Link>

      <div className="grid gap-5 lg:grid-cols-3">
      {events.map((event) => (
        <Link className="glass-panel group overflow-hidden rounded-[1.75rem] transition hover:-translate-y-2 hover:border-red-500/40" href={`/events/${event.slug}`} key={event.slug}>
          <div className={`min-h-56 bg-gradient-to-br ${event.posterTone} p-5 sm:min-h-72 sm:p-6`}>
            <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1 text-xs font-black uppercase tracking-[0.22em]">
              {event.status}
            </span>
            <h2 className="font-display mt-16 text-4xl uppercase leading-none text-white sm:mt-24 sm:text-5xl">{event.title}</h2>
          </div>
          <div className="space-y-5 p-6">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-red-300">{event.city}</p>
              <p className="mt-2 text-zinc-300">{event.mainEvent}</p>
            </div>
            {event.status === "Upcoming" ? <CountdownTimer target={event.date} /> : null}
          </div>
        </Link>
      ))}
      </div>
    </MotionSection>
  );
}

function FightersSection() {
  return (
    <MotionSection className="mx-auto grid max-w-7xl gap-5 pb-14 sm:grid-cols-2 sm:pb-20 lg:grid-cols-4">
      {fighters.map((fighter) => (
        <Link className="glass-panel rounded-[1.75rem] p-5 transition hover:-translate-y-2 hover:border-red-500/40" href={`/fighters/${fighter.slug}`} key={fighter.slug}>
          <div className="rounded-[1.25rem] bg-[radial-gradient(circle_at_25%_10%,rgba(229,9,20,0.34),transparent_32%),linear-gradient(145deg,#151518,#050506)] p-5">
            <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-black uppercase tracking-[0.22em]">{fighter.rank}</span>
            <h2 className="font-display mt-16 text-4xl uppercase leading-none text-white sm:mt-24 sm:text-5xl">{fighter.name}</h2>
            <p className="mt-2 text-sm font-bold uppercase tracking-[0.22em] text-red-200">{fighter.nickname}</p>
          </div>
          <div className="mt-5 space-y-2 text-sm text-zinc-400">
            <p><span className="text-zinc-200">Style:</span> {fighter.style}</p>
            <p><span className="text-zinc-200">Gym:</span> {fighter.gym}</p>
            <p><span className="text-zinc-200">Record:</span> {fighter.record}</p>
          </div>
        </Link>
      ))}
    </MotionSection>
  );
}

function RankingsSection() {
  return (
    <MotionSection className="mx-auto max-w-7xl pb-14 sm:pb-20">
      <RankingsFull />
    </MotionSection>
  );
}

function MediaSection() {
  return (
    <MotionSection className="mx-auto grid max-w-7xl gap-5 pb-14 sm:grid-cols-2 sm:pb-20">
      {mediaReels.map((reel) => (
        <article className="group relative min-h-64 overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-950 p-5 sm:min-h-80 sm:p-6" key={reel}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(229,9,20,0.46),transparent_35%),linear-gradient(145deg,transparent,rgba(0,0,0,0.8))]" />
          <Play className="relative z-10 rounded-full bg-red-600 p-4 text-white" size={64} aria-hidden />
          <h2 className="font-display relative z-10 mt-24 text-4xl uppercase leading-none text-white sm:mt-32 sm:text-6xl">{reel}</h2>
        </article>
      ))}
    </MotionSection>
  );
}

function RegistrationSection() {
  return <InquiryForm title="Official Registration" button="Submit Registration Interest" fields={["Full name", "Email address", "Gym / affiliation", "Fighter, official, gym, or media applicant"]} />;
}

function ShopSection() {
  const categories = ["All", "Sticks", "Protective Gear", "Apparel", "Accessories"] as const;
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>("All");

  const filteredProducts =
    activeCategory === "All"
      ? shopProducts
      : shopProducts.filter((product) => product.category === activeCategory);

  return (
    <MotionSection className="mx-auto max-w-7xl pb-14 sm:pb-20">
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition ${
              activeCategory === category
                ? "bg-red-600 text-white shadow-[0_0_22px_rgba(229,9,20,0.35)]"
                : "border border-white/10 bg-white/[0.04] text-zinc-300 hover:border-red-500/40 hover:text-white"
            }`}
            key={category}
            onClick={() => setActiveCategory(category)}
            type="button"
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => (
          <Link
            className="glass-panel group overflow-hidden rounded-[1.75rem] transition hover:-translate-y-2 hover:border-red-500/40"
            href={`/shop/${product.slug}`}
            key={product.slug}
          >
            <div className={`relative min-h-48 bg-gradient-to-br ${product.tone} p-5 sm:min-h-56`}>
              {product.badge ? (
                <span className="rounded-full bg-red-600 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.18em] text-white">
                  {product.badge}
                </span>
              ) : (
                <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.18em] text-zinc-200">
                  {product.category}
                </span>
              )}
              <ShoppingBag className="absolute bottom-5 right-5 text-red-200/80 transition group-hover:scale-110" size={28} aria-hidden />
              <h2 className="font-display mt-16 text-3xl uppercase leading-none text-white sm:mt-20 sm:text-4xl">
                {product.name}
              </h2>
            </div>
            <div className="space-y-4 p-5">
              <p className="text-sm leading-6 text-zinc-400">{product.description}</p>
              <div className="flex items-center justify-between gap-3">
                <p className="font-display text-3xl text-white">{product.price}</p>
                <span className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-200 transition group-hover:border-red-500/40 group-hover:text-white">
                  View Details
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="glass-panel mt-8 rounded-[1.75rem] p-6 sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300 sm:text-sm">
          Store Preview
        </p>
        <h2 className="font-display mt-3 text-4xl uppercase leading-none text-white sm:text-5xl">
          Checkout Opens Soon
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
          This shop section uses placeholder products for now. Official Juego Todo sticks, protective
          gear, and apparel will connect to payments and inventory in a future update.
        </p>
      </div>
    </MotionSection>
  );
}

function PartnershipSection() {
  return (
    <MotionSection className="mx-auto grid max-w-7xl gap-6 pb-14 sm:pb-20 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="grid gap-3 sm:grid-cols-2">
        {partners.map((partner) => (
          <div className="glass-panel rounded-3xl p-6" key={partner}>
            <Trophy className="mb-8 text-red-400" aria-hidden />
            <h2 className="font-display text-4xl uppercase text-white">{partner}</h2>
          </div>
        ))}
      </div>
      <InquiryForm title="Partnership Inquiry" button="Start Partnership Conversation" fields={["Name", "Organization", "Email address", "Sponsor, gym, media, or venue inquiry"]} compact />
    </MotionSection>
  );
}

function RulesSection() {
  return (
    <MotionSection className="mx-auto max-w-7xl pb-14 sm:pb-20">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {rulebooks.map((rulebook) => (
          <Link
            className="glass-panel group overflow-hidden rounded-[1.35rem] transition hover:-translate-y-1 hover:border-red-500/50"
            href={`/rules-regulations/${rulebook.slug}`}
            key={rulebook.slug}
          >
            <div className={`relative min-h-36 bg-gradient-to-br ${rulebook.accent} p-4`}>
              <div className="absolute -right-10 top-8 h-28 w-28 rounded-full border border-white/15 transition group-hover:scale-110" />
              <ShieldCheck className="relative z-10 mb-8 text-red-200" size={20} aria-hidden />
              <p className="relative z-10 text-[0.62rem] font-black uppercase tracking-[0.22em] text-red-100">
                {rulebook.eyebrow}
              </p>
              <h2 className="font-display relative z-10 mt-2 text-3xl uppercase leading-none text-white">
                {rulebook.division}
              </h2>
            </div>
            <div className="p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-300">
                {rulebook.ageRange}
              </p>
              <span className="mt-4 inline-flex items-center text-xs font-black uppercase tracking-[0.18em] text-white">
                View Rules
                <ArrowRight className="ml-2 transition group-hover:translate-x-1" size={16} aria-hidden />
              </span>
            </div>
          </Link>
        ))}
      </div>
      <div className="glass-panel mt-5 rounded-[1.5rem] p-5 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.32em] text-red-300">Rules Library</p>
            <h2 className="font-display mt-3 text-4xl uppercase leading-none text-white sm:text-5xl">
              Official PDFs Preserved
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {rulebooks.map((rulebook) => (
              <a
                className="inline-flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-zinc-200 transition hover:border-red-500/50 hover:text-white"
                href={rulebook.pdfHref}
                key={rulebook.slug}
                target="_blank"
                rel="noreferrer"
              >
                {rulebook.eyebrow}
                <Download size={16} aria-hidden />
              </a>
            ))}
          </div>
        </div>
      </div>
    </MotionSection>
  );
}

function AboutSection() {
  return (
    <MotionSection className="mx-auto grid max-w-7xl gap-5 pb-14 sm:grid-cols-2 sm:pb-20 lg:grid-cols-4">
      {systems.map((system) => (
        <article className="broadcast-line glass-panel rounded-3xl p-6 pt-8" key={system.name}>
          <h2 className="font-display text-4xl uppercase text-white">{system.name}</h2>
          <p className="mt-4 text-sm leading-7 text-zinc-400">{system.text}</p>
        </article>
      ))}
    </MotionSection>
  );
}

function ContactSection() {
  return (
    <MotionSection className="mx-auto grid max-w-7xl gap-6 pb-14 sm:pb-20 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="space-y-4">
        <ContactCard icon={<Mail aria-hidden />} title="Fight Operations" text="operations@juegotodo.com" />
        <ContactCard icon={<Mail aria-hidden />} title="Sponsorship & Media" text="partners@juegotodo.com" />
        <ContactCard icon={<MapPin aria-hidden />} title="Headquarters" text="Metro Manila, Philippines" />
      </div>
      <InquiryForm title="Contact Juego Todo" button="Send Message" fields={["Name", "Email address", "Topic", "Message"]} compact />
    </MotionSection>
  );
}

function ContactCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="glass-panel flex gap-4 rounded-3xl p-6">
      <div className="text-red-400">{icon}</div>
      <div>
        <h2 className="font-bold text-white">{title}</h2>
        <p className="mt-1 text-zinc-400">{text}</p>
      </div>
    </div>
  );
}

function InquiryForm({
  title,
  button,
  fields,
  compact = false,
}: {
  title: string;
  button: string;
  fields: string[];
  compact?: boolean;
}) {
  return (
    <MotionSection className={compact ? "" : "mx-auto max-w-3xl pb-20"}>
      <form className="glass-panel rounded-[1.5rem] p-5 sm:rounded-[2rem] sm:p-8">
        <h2 className="font-display text-4xl uppercase text-white sm:text-5xl">{title}</h2>
        <div className="mt-6 grid gap-4 sm:mt-8">
          {fields.map((field, index) => {
            const isLong = field.toLowerCase().includes("message") || index === fields.length - 1;
            return isLong ? (
              <textarea aria-label={field} className="min-h-32 rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-red-500/40 transition placeholder:text-zinc-500 focus:ring-4" key={field} placeholder={field} />
            ) : (
              <input aria-label={field} className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-red-500/40 transition placeholder:text-zinc-500 focus:ring-4" key={field} placeholder={field} />
            );
          })}
        </div>
        <button className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-red-600 px-6 py-4 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-red-500" type="button">
          {button}
          <ArrowRight className="ml-2" size={18} aria-hidden />
        </button>
      </form>
    </MotionSection>
  );
}
