"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MotionSection } from "@/components/MotionSection";
import type { LegalPage } from "@/data/legal-pages";

export function LegalPageContent({ page }: { page: LegalPage }) {
  const [query, setQuery] = useState("");

  const filteredSections = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return page.sections;

    return page.sections.filter((section) => {
      const haystack = [
        section.title,
        ...(section.paragraphs ?? []),
        ...(section.bullets ?? []),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalized);
    });
  }, [page.sections, query]);

  return (
    <MotionSection className="mx-auto max-w-7xl pb-14 sm:pb-20">
      <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="glass-panel rounded-[1.5rem] border-white/[0.08] bg-[#0D0D0D]/75 p-5">
            <p className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-[#FF1010]">
              Compliance Document
            </p>
            <p className="mt-3 text-sm text-zinc-400">
              Last updated: <span className="font-semibold text-white">{page.lastUpdated}</span>
            </p>

            <label className="relative mt-5 block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} aria-hidden />
              <input
                className="w-full rounded-xl border border-white/[0.08] bg-black/40 py-3 pl-10 pr-3 text-sm text-white outline-none transition focus:border-[#FF1010]/40"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search this page..."
                type="search"
                value={query}
              />
            </label>

            <nav aria-label="Page sections" className="mt-5 space-y-2">
              {filteredSections.map((section) => (
                <a
                  className="block rounded-xl px-3 py-2 text-sm font-medium text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
                  href={`#${section.id}`}
                  key={section.id}
                >
                  {section.title}
                </a>
              ))}
            </nav>

            <div className="mt-6 border-t border-white/[0.08] pt-5">
              <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-zinc-500">
                Related Policies
              </p>
              <div className="mt-3 grid gap-2">
                {page.relatedLinks.map((link) => (
                  <Link
                    className="text-sm font-medium text-zinc-400 transition hover:text-[#FF1010]"
                    href={link.href}
                    key={link.href}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="space-y-5">
          {filteredSections.length === 0 ? (
            <div className="glass-panel rounded-[1.5rem] p-6 text-zinc-400">
              No sections match your search. Try a different keyword.
            </div>
          ) : (
            filteredSections.map((section) => (
              <section
                className="glass-panel scroll-mt-36 rounded-[1.5rem] border-white/[0.08] bg-[#0D0D0D]/70 p-5 sm:p-6"
                id={section.id}
                key={section.id}
              >
                <h2 className="font-display text-3xl uppercase leading-none text-white sm:text-4xl">
                  {section.title}
                </h2>
                {section.paragraphs?.map((paragraph) => (
                  <p className="mt-4 text-base leading-8 text-zinc-300" key={paragraph}>
                    {paragraph}
                  </p>
                ))}
                {section.bullets?.length ? (
                  <ul className="mt-4 space-y-3">
                    {section.bullets.map((bullet) => (
                      <li className="flex gap-3 text-base leading-7 text-zinc-300" key={bullet}>
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF1010] shadow-[0_0_12px_rgba(255,16,16,0.8)]" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))
          )}

          <div className="rounded-[1.5rem] border border-[#FF1010]/20 bg-[#FF1010]/10 p-5 sm:p-6">
            <p className="text-sm leading-7 text-red-100">
              This document is a CMS-ready template and may be updated as Juego Todo expands
              operations, partnerships, and regulatory requirements. For legal inquiries contact{" "}
              <Link className="font-bold text-white underline-offset-4 hover:underline" href="/contact">
                operations@juegotodo.com
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </MotionSection>
  );
}
