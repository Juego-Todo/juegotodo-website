"use client";

import { useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { MotionSection } from "@/components/MotionSection";
import {
  audienceReach,
  currentPartnerLogos,
  partnerCategories,
  partnershipFaq,
  partnershipStats,
  whyPartnerPoints,
} from "@/data/partners-page";

export function PartnersHub() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      <MotionSection className="mx-auto max-w-7xl pb-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {partnershipStats.map((stat) => (
            <div className="glass-panel rounded-[1.5rem] p-5 text-center sm:text-left" key={stat.label}>
              <p className="font-display text-4xl text-white">
                {stat.value}
                {stat.suffix ?? ""}
              </p>
              <p className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </MotionSection>

      <MotionSection className="mx-auto max-w-7xl pb-12">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">Why Partner With Juego Todo</p>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {whyPartnerPoints.map((point) => (
            <div className="glass-panel rounded-[1.5rem] p-6" key={point.title}>
              <h2 className="font-display text-3xl uppercase text-white">{point.title}</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">{point.text}</p>
            </div>
          ))}
        </div>
      </MotionSection>

      <MotionSection className="mx-auto max-w-7xl pb-12">
        <p className="text-center text-xs font-black uppercase tracking-[0.24em] text-zinc-500">Current Partners</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {currentPartnerLogos.map((partner) => (
            <div
              className="rounded-2xl border border-white/10 bg-[#0D0D0D] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-zinc-300"
              key={partner}
            >
              {partner}
            </div>
          ))}
        </div>
      </MotionSection>

      <MotionSection className="mx-auto max-w-7xl pb-12">
        <h2 className="font-display text-4xl uppercase text-white sm:text-5xl">Partnership Categories</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {partnerCategories.map((category) => (
            <div className="glass-panel rounded-[1.5rem] p-6 transition hover:border-red-500/30" key={category.id}>
              <h3 className="font-display text-2xl uppercase text-white">{category.title}</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-400">{category.description}</p>
              <ul className="mt-4 space-y-1 text-xs text-zinc-500">
                {category.partners.map((partner) => (
                  <li key={partner}>• {partner}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </MotionSection>

      <MotionSection className="mx-auto max-w-7xl pb-12">
        <h2 className="font-display text-4xl uppercase text-white sm:text-5xl">Audience Reach</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {audienceReach.map((item) => (
            <div className="glass-panel rounded-[1.35rem] p-5" key={item.label}>
              <p className="font-display text-3xl text-white">{item.value}</p>
              <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">{item.label}</p>
            </div>
          ))}
        </div>
      </MotionSection>

      <MotionSection className="mx-auto max-w-7xl pb-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <form className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">Partnership Inquiry</p>
            <h2 className="font-display mt-3 text-4xl uppercase text-white">Start The Conversation</h2>
            <div className="mt-6 grid gap-4">
              {["Full Name", "Organization", "Email Address", "Partnership Category", "Tell us about your brand"].map((field) =>
                field.toLowerCase().includes("tell") ? (
                  <textarea
                    className="min-h-32 rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-red-500/40 focus:ring-4"
                    key={field}
                    placeholder={field}
                  />
                ) : (
                  <input
                    className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-red-500/40 focus:ring-4"
                    key={field}
                    placeholder={field}
                  />
                ),
              )}
            </div>
            <button
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-red-600 px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-white"
              type="button"
            >
              Submit Partnership Inquiry
              <ArrowRight className="ml-2" size={16} aria-hidden />
            </button>
          </form>

          <div>
            <h2 className="font-display text-4xl uppercase text-white">FAQ</h2>
            <div className="mt-6 space-y-3">
              {partnershipFaq.map((item, index) => {
                const open = openFaq === index;
                return (
                  <div className="glass-panel rounded-[1.25rem] p-4" key={item.question}>
                    <button
                      className="flex w-full items-center justify-between gap-4 text-left"
                      onClick={() => setOpenFaq(open ? null : index)}
                      type="button"
                    >
                      <span className="font-semibold text-white">{item.question}</span>
                      <ChevronDown className={`shrink-0 transition ${open ? "rotate-180" : ""}`} size={18} aria-hidden />
                    </button>
                    {open ? <p className="mt-3 text-sm leading-7 text-zinc-400">{item.answer}</p> : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </MotionSection>
    </>
  );
}
