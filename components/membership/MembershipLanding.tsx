"use client";

import Link from "next/link";
import { ArrowRight, FileSearch } from "lucide-react";
import { MotionSection } from "@/components/MotionSection";
import { membershipApplicationTypes } from "@/data/membership-applications";

function displayConfiguredValue(value: string | null | undefined) {
  if (value == null || value.trim() === "") {
    return "To be confirmed by Juego Todo";
  }
  return value;
}

export function MembershipLanding() {
  return (
    <main className="overflow-hidden px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
      <section className="relative mx-auto max-w-5xl py-8 sm:py-10">
        <MotionSection>
          <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#FF1010]">Membership & Licensing</p>
          <h1 className="font-display mt-2 text-4xl uppercase text-white sm:text-6xl">Membership Portal</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            Apply for official Juego Todo membership programs, submit required documents and payment proof, and track
            your application status online.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-5 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:border-[#FF1010]/40 hover:bg-white/5"
              href="/membership/applications"
            >
              <FileSearch className="mr-2" size={14} aria-hidden />
              Track Applications
            </Link>
          </div>

          <div className="mt-8 space-y-5">
            {membershipApplicationTypes.map((type) => (
              <article className="glass-panel rounded-[1.5rem] p-5 sm:p-7" key={type.id}>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-[#FF1010]">
                      {type.program.replace(/_/g, " ")}
                    </p>
                    <h2 className="font-display mt-2 text-3xl uppercase text-white sm:text-4xl">{type.title}</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">{type.shortDescription}</p>

                    <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                        <dt className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">Fee</dt>
                        <dd className="mt-2 text-sm text-white">{displayConfiguredValue(type.fee)}</dd>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                        <dt className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">Validity</dt>
                        <dd className="mt-2 text-sm text-white">{displayConfiguredValue(type.validity)}</dd>
                      </div>
                    </dl>

                    {type.eligibility ? (
                      <p className="mt-4 text-sm leading-6 text-zinc-400">
                        <span className="font-semibold text-zinc-300">Eligibility:</span> {type.eligibility}
                      </p>
                    ) : null}

                    <ul className="mt-5 space-y-2">
                      {type.requirements.map((requirement) => (
                        <li className="flex gap-2 text-sm leading-6 text-zinc-400" key={requirement}>
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF1010]" aria-hidden />
                          <span>{requirement}</span>
                        </li>
                      ))}
                    </ul>

                    {type.benefits?.length ? (
                      <ul className="mt-4 space-y-2">
                        {type.benefits.map((benefit) => (
                          <li className="text-sm leading-6 text-zinc-400" key={benefit}>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>

                  <Link
                    className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-[#FF1010] px-6 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#ff2828]"
                    href={type.applicationHref}
                  >
                    Apply Now
                    <ArrowRight className="ml-2" size={14} aria-hidden />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </MotionSection>
      </section>
    </main>
  );
}
