"use client";

import Link from "next/link";
import { footerLegalLinks, footerNavColumns, socialLinks } from "@/data/site";

const footerColumns = [
  ...footerNavColumns,
  {
    title: "Legal",
    links: [...footerLegalLinks],
  },
];

function SocialIcon({ label }: { label: string }) {
  const className = "h-3.5 w-3.5";

  switch (label) {
    case "Instagram":
      return (
        <svg aria-hidden className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
        </svg>
      );
    case "Facebook":
      return (
        <svg aria-hidden className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M22 12a10 10 0 1 0-11.6 9.9v-7h-2.3V12h2.3V9.8c0-2.3 1.3-3.5 3.4-3.5 1 0 2 .2 2 .2v2.2h-1.1c-1.1 0-1.4.7-1.4 1.4V12h2.4l-.4 2.9h-2v7A10 10 0 0 0 22 12" />
        </svg>
      );
    case "YouTube":
      return (
        <svg aria-hidden className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1 31.5 31.5 0 0 0 .5-5.8 31.5 31.5 0 0 0-.5-5.8M9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
        </svg>
      );
    case "TikTok":
      return (
        <svg aria-hidden className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.75a8.18 8.18 0 0 0 4.77 1.52V6.87a4.85 4.85 0 0 1-1-.18z" />
        </svg>
      );
    default:
      return null;
  }
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.08] bg-[#050505]">
      <div className="footer-glow-line" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,16,16,0.08),transparent_45rem)]" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="border-b border-white/[0.08] py-8 sm:py-10">
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="text-[0.65rem] font-black uppercase tracking-[0.22em] text-white">{column.title}</h3>
                <div className="mt-3 grid gap-2">
                  {column.links.map((link) => (
                    <Link
                      className="text-xs font-medium text-zinc-500 transition hover:translate-x-0.5 hover:text-white"
                      href={link.href}
                      key={`${column.title}-${link.href}`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <h3 className="text-[0.65rem] font-black uppercase tracking-[0.22em] text-white">Follow The League</h3>
              <div className="mt-3 grid gap-2">
                {socialLinks.map((social) => (
                  <a
                    className="group/social inline-flex items-center gap-2 text-xs font-medium text-zinc-500 transition hover:text-white"
                    href={social.href}
                    key={social.label}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <span className="text-zinc-400 transition group-hover/social:text-[#FF1010]">
                      <SocialIcon label={social.label} />
                    </span>
                    {social.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="py-4">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-zinc-600">
            © {new Date().getFullYear()} Juego Todo Combat Sports Platform
          </p>
        </div>
      </div>
    </footer>
  );
}
