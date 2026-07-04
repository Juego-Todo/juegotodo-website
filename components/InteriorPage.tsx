"use client";

import { Suspense } from "react";
import { ArrowRight, Download, Mail, MapPin, Play, ShieldCheck, Trophy, Users } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import { ConsultationPage } from "@/components/ConsultationPage";
import { ShopPageClient } from "@/components/commerce/ShopPageClient";
import { FighterDatabase } from "@/components/FighterDatabase";
import { PartnersHub } from "@/components/PartnersHub";
import { TeamsHub } from "@/components/TeamsHub";
import { CountdownTimer } from "@/components/CountdownTimer";
import { EventCardBackdrop } from "@/components/EventCardBackdrop";
import { FmaLineageSection } from "@/components/FmaLineageSection";
import { LegalPageContent } from "@/components/LegalPageContent";
import { OrganizationalStructureSection } from "@/components/OrganizationalStructureSection";
import { PageNavigation } from "@/components/PageNavigation";
import { MotionSection } from "@/components/MotionSection";
import { SeminarsHub } from "@/components/SeminarsHub";
import {
  events,
  mediaReels,
  pageContent,
  partners,
  type PageSlug,
} from "@/data/site";
import { rulebooks } from "@/data/rules";
import { getLegalPage, isLegalPageSlug } from "@/data/legal-pages";

export function InteriorPage({ slug }: { slug: PageSlug }) {
  const content = pageContent[slug];
  const isRulesPage = slug === "rules-regulations";
  const isLegalPage = isLegalPageSlug(slug);
  const isShopPage = slug === "shop";
  const isPartnersPage = slug === "partners" || slug === "partnerships";
  const isLatayanologyPage = slug === "latayanology";
  const legalPage = isLegalPage && !isLatayanologyPage ? getLegalPage(slug) : undefined;

  return (
      <main className={`overflow-hidden ${isPartnersPage || isLatayanologyPage || isShopPage ? "" : "px-4 pb-14 sm:px-6 sm:pb-20 lg:px-8"} ${isShopPage || isPartnersPage || isLatayanologyPage ? "pt-20 sm:pt-24" : "pt-24 sm:pt-28 lg:pt-32"} ${isLatayanologyPage || isShopPage ? "pb-14 sm:pb-20" : ""}`}>
      {!isShopPage && !isPartnersPage && !isLatayanologyPage ? (
      <section className={`relative mx-auto max-w-7xl ${isRulesPage || isLegalPage ? "py-6 sm:py-8 lg:py-10" : "py-10 sm:py-14 lg:py-16"}`}>
        <div className="cinematic-grid absolute inset-0 opacity-30" aria-hidden />
        <div className={`relative ${isRulesPage || isLegalPage ? "max-w-4xl" : "max-w-5xl"}`}>
          <PageNavigation />
          <h1 className={`font-display mt-3 uppercase leading-[0.9] text-white sm:mt-4 ${
            isRulesPage || isLegalPage
              ? "text-[clamp(2.75rem,12vw,4.5rem)] sm:text-6xl lg:text-7xl"
              : "text-[clamp(3.25rem,15vw,5.35rem)] sm:text-7xl lg:text-8xl"
          }`}>
            {content.title}
          </h1>
          <p className={`max-w-3xl text-base leading-7 text-zinc-300 ${
            isRulesPage || isLegalPage ? "mt-4 sm:mt-5 sm:text-lg" : "mt-5 sm:mt-7 sm:text-xl sm:leading-8"
          }`}>{content.intro}</p>
          {legalPage ? (
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Last updated: {legalPage.lastUpdated}
            </p>
          ) : null}
        </div>
      </section>
      ) : null}

      {legalPage ? <LegalPageContent page={legalPage} /> : null}

      {slug === "events" ? <EventsSection /> : null}
      {slug === "latayanology" ? <FighterDatabase /> : null}
      {slug === "media" ? <MediaSection /> : null}
      {slug === "shop" ? (
        <Suspense>
          <ShopPageClient />
        </Suspense>
      ) : null}
      {slug === "registration" ? <RegistrationSection /> : null}
      {slug === "teams" ? <TeamsHub /> : null}
      {slug === "partners" || slug === "partnerships" ? <PartnersHub /> : null}
      {slug === "juego-todo-seminars" ? <SeminarsHub /> : null}
      {slug === "consultation" ? <ConsultationPage /> : null}
      {slug === "rules-regulations" ? <RulesSection /> : null}
      {slug === "about-juego-todo" ? <AboutSection /> : null}
      {slug === "grand-council" ? <OrganizationalStructureSection /> : null}
      {slug === "fma-lineage" ? <FmaLineageSection /> : null}
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
          <EventCardBackdrop className="min-h-56 p-5 sm:min-h-72 sm:p-6">
            <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1 text-xs font-black uppercase tracking-[0.22em]">
              {event.status}
            </span>
            <h2 className="font-display mt-16 text-4xl uppercase leading-none text-white sm:mt-24 sm:text-5xl">{event.title}</h2>
          </EventCardBackdrop>
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

function MediaSection() {
  return (
    <MotionSection className="mx-auto max-w-7xl space-y-10 pb-14 sm:pb-20">
      <section id="clips">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#FF1010]">Media Clips</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {mediaReels.map((reel) => (
            <article className="group relative min-h-64 overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-950 p-5 sm:min-h-80 sm:p-6" key={reel}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(229,9,20,0.46),transparent_35%),linear-gradient(145deg,transparent,rgba(0,0,0,0.8))]" />
              <Play className="relative z-10 rounded-full bg-red-600 p-4 text-white" size={64} aria-hidden />
              <h2 className="font-display relative z-10 mt-24 text-4xl uppercase leading-none text-white sm:mt-32 sm:text-6xl">{reel}</h2>
            </article>
          ))}
        </div>
      </section>

      <section className="glass-panel rounded-[1.75rem] p-6 sm:p-8" id="podcast">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#FF1010]">Podcast</p>
        <h2 className="font-display mt-3 text-4xl uppercase text-white sm:text-5xl">JTGC Audio</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
          League interviews, fight-week breakdowns, and coach roundtables — podcast episodes publish here as the
          broadcast library expands.
        </p>
      </section>
    </MotionSection>
  );
}

function RegistrationSection() {
  return <InquiryForm title="Official Registration" button="Submit Registration Interest" fields={["Full name", "Email address", "Gym / affiliation", "Fighter, official, gym, or media applicant"]} />;
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
    <>
      <OrganizationalStructureSection />

      <MotionSection className="mx-auto max-w-7xl pb-14 sm:pb-20">
        <Link
          className="glass-panel group block overflow-hidden rounded-[1.75rem] border-[#FF1010]/20 transition hover:-translate-y-1 hover:border-[#FF1010]/40"
          href="/fma-lineage"
        >
          <div className="bg-[radial-gradient(circle_at_20%_10%,rgba(255,16,16,0.28),transparent_24rem),linear-gradient(135deg,#120305,#050505)] p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#FF1010]">Heritage</p>
            <h2 className="font-display mt-3 text-4xl uppercase leading-none text-white sm:text-5xl">
              FMA Lineage
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-300 sm:text-base">
              Discover the Filipino martial arts styles and lineages that support Juego Todo
              competition, seminars, and rules.
            </p>
            <span className="mt-5 inline-flex items-center text-sm font-black uppercase tracking-[0.18em] text-white">
              Explore Lineages
              <ArrowRight className="ml-2 transition group-hover:translate-x-1" size={16} aria-hidden />
            </span>
          </div>
        </Link>
      </MotionSection>
    </>
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
