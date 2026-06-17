"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Check,
  Download,
  Handshake,
  Megaphone,
  Radio,
  Shield,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { MotionSection } from "@/components/MotionSection";
import {
  currentPartnerLogos,
  partnerCategoryCards,
  partnershipCallMailto,
  partnershipDeckMailto,
  partnershipMetrics,
  partnershipTypes,
  sponsorshipOpportunities,
  whyPartnerBenefits,
} from "@/data/partners-page";

const categoryIcons = {
  broadcast: Radio,
  equipment: Wrench,
  commercial: Megaphone,
  gyms: Building2,
  media: Shield,
} as const;

function PartnerLogo({ name }: { name: string }) {
  return (
    <span className="partnership-logo-wall inline-flex shrink-0 items-center px-8 sm:px-12">
      <span className="font-display text-lg uppercase tracking-[0.16em] text-white sm:text-xl sm:tracking-[0.2em]">
        {name}
      </span>
    </span>
  );
}

export function PartnersHub() {
  const marqueeLogos = [...currentPartnerLogos, ...currentPartnerLogos];

  return (
    <>
      <section className="relative min-h-[28rem] overflow-hidden border-b border-white/[0.08] sm:min-h-[32rem] lg:min-h-[36rem]">
        <Image
          alt="Juego Todo FMA athletes competing in a professional cage"
          className="object-cover object-[center_35%]"
          fill
          priority
          sizes="100vw"
          src="/partners-hero-background.png"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/78 to-black/45" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/35 to-black/55" aria-hidden />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,16,16,0.1),transparent_32rem)]" aria-hidden />
        <div className="cinematic-grid absolute inset-0 opacity-[0.06]" aria-hidden />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-[#FF1010]">Partnerships</p>
          <h1 className="font-display mt-4 max-w-5xl text-[clamp(2.8rem,9vw,5.5rem)] uppercase leading-[0.9] text-white drop-shadow-[0_8px_32px_rgba(0,0,0,0.9)]">
            Partner With The Future Of Filipino Combat Sports
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-200 drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)] sm:text-lg sm:leading-8">
            Access athletes, gyms, livestream audiences, events, seminars, and national competition circuits
            through the world&apos;s first professional FMA hybrid sport platform.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#FF1010] px-7 py-3.5 text-xs font-black uppercase tracking-[0.18em] text-white shadow-[0_0_32px_rgba(255,16,16,0.35)] transition hover:bg-[#ff2828] sm:text-sm"
              href="#partnership-inquiry"
            >
              Become A Partner
              <ArrowRight className="ml-2" size={16} aria-hidden />
            </Link>
            <a
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 bg-black/45 px-7 py-3.5 text-xs font-black uppercase tracking-[0.18em] text-white backdrop-blur-md transition hover:bg-white/10 sm:text-sm"
              href={partnershipDeckMailto}
            >
              <Download className="mr-2" size={16} aria-hidden />
              Download Partnership Deck
            </a>
          </div>
        </div>
      </section>

      <MotionSection className="mx-auto max-w-7xl border-b border-white/[0.08] px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5 lg:gap-6">
          {partnershipMetrics.map((stat) => (
            <div className="text-center lg:text-left" key={stat.label}>
              <p className="font-display text-3xl text-white sm:text-4xl">{stat.value}</p>
              <p className="mt-2 text-[0.58rem] font-medium uppercase tracking-[0.18em] text-zinc-500 sm:text-[0.62rem]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </MotionSection>

      <MotionSection className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-zinc-500">Partnership Categories</p>
          <h2 className="font-display mt-3 text-4xl uppercase leading-none text-white sm:text-5xl lg:text-6xl">
            Built For Brands That Move Combat Sports Forward
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {partnerCategoryCards.map((category, index) => {
            const Icon = categoryIcons[category.id as keyof typeof categoryIcons] ?? Handshake;
            return (
              <motion.article
                className="group overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-[#0D0D0D]/80 transition hover:border-[#FF1010]/25"
                initial={{ opacity: 0, y: 24 }}
                key={category.id}
                transition={{ delay: index * 0.06, duration: 0.6 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <div className="border-b border-white/[0.06] bg-[linear-gradient(135deg,rgba(255,16,16,0.12),transparent_55%)] px-5 py-5 sm:px-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#FF1010]/20 bg-[#FF1010]/10">
                    <Icon className="text-[#FF1010]" size={20} aria-hidden />
                  </div>
                  <h3 className="font-display mt-4 text-2xl uppercase leading-none text-white sm:text-3xl">
                    {category.title}
                  </h3>
                </div>
                <div className="px-5 py-5 sm:px-6 sm:py-6">
                  <p className="text-sm leading-7 text-zinc-400">{category.description}</p>
                  <ul className="mt-5 space-y-2">
                    {category.highlights.map((item) => (
                      <li className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-300" key={item}>
                        <span className="h-1 w-1 rounded-full bg-[#FF1010]" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            );
          })}
        </div>
      </MotionSection>

      <section className="border-y border-white/[0.08] bg-[#050505] py-12 sm:py-16">
        <p className="text-center text-[0.62rem] font-medium uppercase tracking-[0.32em] text-zinc-500">
          Trusted By
        </p>
        <div className="relative mt-6 w-full overflow-hidden sm:mt-8">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#050505] to-transparent sm:w-24" aria-hidden />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#050505] to-transparent sm:w-24" aria-hidden />
          <div className="media-marquee-track flex w-max items-center py-2">
            {marqueeLogos.map((partner, index) => (
              <PartnerLogo key={`${partner}-${index}`} name={partner} />
            ))}
          </div>
        </div>
      </section>

      <MotionSection className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-zinc-500">Partnership Opportunities</p>
          <h2 className="font-display mt-3 text-4xl uppercase leading-none text-white sm:text-5xl">
            Own Your Category
          </h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {sponsorshipOpportunities.map((item) => (
            <article
              className="rounded-[1.5rem] border border-white/[0.08] bg-[#0D0D0D]/70 p-6 transition hover:border-white/[0.14]"
              key={item.title}
            >
              <h3 className="font-display text-3xl uppercase leading-none text-white">{item.title}</h3>
              <p className="mt-4 text-sm leading-7 text-zinc-400">{item.description}</p>
            </article>
          ))}
        </div>
      </MotionSection>

      <MotionSection className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-16">
        <div className="rounded-[1.75rem] border border-white/[0.08] bg-[linear-gradient(135deg,rgba(255,16,16,0.08),rgba(5,5,5,0.95)_45%)] p-6 sm:p-8 lg:p-10">
          <h2 className="font-display text-4xl uppercase leading-none text-white sm:text-5xl">Why Partner With JTGC</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {whyPartnerBenefits.map((benefit) => (
              <li className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.12em] text-zinc-200" key={benefit}>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#FF1010]/30 bg-[#FF1010]/10">
                  <Check className="text-[#FF1010]" size={14} aria-hidden />
                </span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </MotionSection>

      <MotionSection className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8" id="partnership-inquiry">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#FF1010]">Partnership Inquiry</p>
            <h2 className="font-display mt-4 text-4xl uppercase leading-[0.95] text-white sm:text-5xl lg:text-6xl">
              Let&apos;s Build The Future Of Filipino Combat Sports
            </h2>
            <p className="mt-5 text-base leading-8 text-zinc-400">
              Whether you&apos;re a sponsor, media network, equipment manufacturer, gym, or investor,
              our team is ready to discuss partnership opportunities.
            </p>
            <p className="mt-6 text-sm font-semibold text-zinc-500">
              Direct line:{" "}
              <a className="text-white transition hover:text-[#FF1010]" href="mailto:partners@juegotodo.com">
                partners@juegotodo.com
              </a>
            </p>
          </div>

          <form className="glass-panel rounded-[1.75rem] border-white/[0.08] p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                aria-label="Name"
                className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-[#FF1010]/40 transition placeholder:text-zinc-500 focus:ring-4 sm:col-span-2"
                name="name"
                placeholder="Name"
                type="text"
              />
              <input
                aria-label="Company"
                className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-[#FF1010]/40 transition placeholder:text-zinc-500 focus:ring-4"
                name="company"
                placeholder="Company"
                type="text"
              />
              <input
                aria-label="Position"
                className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-[#FF1010]/40 transition placeholder:text-zinc-500 focus:ring-4"
                name="position"
                placeholder="Position"
                type="text"
              />
              <input
                aria-label="Email"
                className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-[#FF1010]/40 transition placeholder:text-zinc-500 focus:ring-4"
                name="email"
                placeholder="Email"
                type="email"
              />
              <input
                aria-label="Phone"
                className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-[#FF1010]/40 transition placeholder:text-zinc-500 focus:ring-4"
                name="phone"
                placeholder="Phone"
                type="tel"
              />
              <select
                aria-label="Partnership Type"
                className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-[#FF1010]/40 transition focus:ring-4 sm:col-span-2"
                defaultValue=""
                name="partnershipType"
              >
                <option disabled value="">
                  Partnership Type
                </option>
                {partnershipTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <textarea
                aria-label="Message"
                className="min-h-32 rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-[#FF1010]/40 transition placeholder:text-zinc-500 focus:ring-4 sm:col-span-2"
                name="message"
                placeholder="Message"
              />
            </div>
            <button
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#FF1010] px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#ff2828]"
              type="button"
            >
              Become A Partner
              <ArrowRight className="ml-2" size={18} aria-hidden />
            </button>
          </form>
        </div>
      </MotionSection>

      <section className="border-t border-white/[0.08] bg-[#050505]">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-14 text-center sm:px-6 sm:py-16 lg:px-8">
          <h2 className="font-display text-4xl uppercase leading-none text-white sm:text-5xl lg:text-6xl">
            Ready To Partner With JTGC?
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            <a
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#FF1010] px-7 py-3.5 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#ff2828] sm:text-sm"
              href={partnershipCallMailto}
            >
              Schedule A Call
            </a>
            <a
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 px-7 py-3.5 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-white/10 sm:text-sm"
              href={partnershipDeckMailto}
            >
              <Download className="mr-2" size={16} aria-hidden />
              Download Partnership Deck
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
