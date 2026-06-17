"use client";

import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { broadcastPartners, footerStats, socialLinks } from "@/data/site";

const footerColumns = [
  {
    title: "League",
    links: [
      { label: "About JTGC", href: "/about-juego-todo" },
      { label: "Events", href: "/events" },
      { label: "Rankings", href: "/rankings" },
      { label: "Rules", href: "/rules-regulations" },
    ],
  },
  {
    title: "Rankings",
    links: [
      { label: "Official Rankings", href: "/rankings" },
      { label: "Fighter Database", href: "/fighters" },
      { label: "Rankings Methodology", href: "/ranking-methodology" },
      { label: "Registration", href: "/registration" },
    ],
  },
  {
    title: "Teams",
    links: [
      { label: "Team Rankings", href: "/teams" },
      { label: "Official Teams", href: "/teams" },
      { label: "Affiliated Gyms", href: "/teams" },
      { label: "Coaches Directory", href: "/teams" },
    ],
  },
  {
    title: "Partners",
    links: [
      { label: "Commercial Partners", href: "/partners" },
      { label: "Sponsorship Policy", href: "/sponsorships" },
      { label: "Broadcast Rights", href: "/broadcast-rights" },
      { label: "Media Accreditation", href: "/media-accreditation" },
    ],
  },
  {
    title: "Shop",
    links: [
      { label: "Official Store", href: "/shop" },
      { label: "Official Gear", href: "/shop?category=official-gear" },
      { label: "Championship Collection", href: "/shop?category=championship-collection" },
      { label: "Digital Products", href: "/shop?category=digital-products" },
    ],
  },
  {
    title: "Media",
    links: [
      { label: "News & Highlights", href: "/media" },
      { label: "Seminars", href: "/juego-todo-seminars" },
      { label: "LATAYANOLOGY", href: "/latayanology" },
      { label: "Contact Press", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Disclaimer", href: "/disclaimer" },
      { label: "Ranking Methodology", href: "/ranking-methodology" },
    ],
  },
];

function AnimatedStatNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 80, damping: 24 });
  const inView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, motionValue, value]);

  useEffect(() => {
    return spring.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${Math.round(latest)}${suffix}`;
      }
    });
  }, [spring, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

function SocialIcon({ label }: { label: string }) {
  const className = "h-5 w-5";

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
    case "Discord":
      return (
        <svg aria-hidden className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      );
    default:
      return null;
  }
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#050505]">
      <div className="footer-glow-line" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,16,16,0.08),transparent_45rem)]" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="border-b border-white/[0.08] py-12 sm:py-16">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {footerStats.map((stat, index) => (
              <motion.div
                className="text-center sm:text-left"
                initial={{ opacity: 0, y: 20 }}
                key={stat.label}
                transition={{ delay: index * 0.08, duration: 0.55 }}
                viewport={{ once: true, margin: "-40px" }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <div className="footer-stat-glow font-stats text-[clamp(2.75rem,7vw,4.5rem)] font-bold leading-none text-white">
                  <AnimatedStatNumber suffix={stat.suffix} value={stat.value} />
                </div>
                <p className="mt-3 text-xs font-black uppercase tracking-[0.24em] text-zinc-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="grid gap-10 border-b border-white/[0.08] py-14 lg:grid-cols-[1.35fr_0.85fr] lg:gap-14 lg:py-20">
          <div>
            <BrandLogo variant="footer" />
            <h2 className="font-display mt-8 max-w-2xl text-[clamp(2.5rem,8vw,4.5rem)] uppercase leading-[0.92] text-white">
              Filipino Martial Arts.
              <span className="block text-white/90">Professionalized.</span>
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
              The digital headquarters of a global combat sports organization — events, rankings, teams,
              partners, and the official JTGC ecosystem.
            </p>
          </div>

          <div className="glass-panel animated-border group rounded-[1.75rem] border-white/[0.08] bg-[#0D0D0D]/75 p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[#FF1010]">Join the League</p>
            <h3 className="font-display mt-3 text-4xl uppercase leading-none text-white">Stay In The Fight</h3>
            <p className="mt-4 text-sm leading-7 text-zinc-400 sm:text-base">
              Get event announcements, rankings updates, fighter signings and broadcast alerts.
            </p>
            <form className="mt-8 space-y-3">
              <input
                aria-label="Email address"
                className="min-h-14 w-full rounded-2xl border border-white/[0.08] bg-black/50 px-5 text-base text-white outline-none transition placeholder:text-zinc-600 focus:border-[#FF1010]/40 focus:shadow-[0_0_24px_rgba(255,16,16,0.15)]"
                placeholder="Email address"
                type="email"
              />
              <button
                className="group/button inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-[#FF1010] px-6 text-sm font-black uppercase tracking-[0.18em] text-white shadow-[0_0_32px_rgba(255,16,16,0.35)] transition hover:-translate-y-0.5 hover:bg-[#ff2828]"
                type="button"
              >
                Join Free
                <ArrowRight className="ml-2 transition group-hover/button:translate-x-1" size={18} aria-hidden />
              </button>
            </form>
          </div>
        </section>

        <section className="border-b border-white/[0.08] py-12 sm:py-16">
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white">{column.title}</h3>
                <div className="mt-5 grid gap-3.5">
                  {column.links.map((link) => (
                    <Link
                      className="text-sm font-medium text-zinc-500 transition hover:translate-x-0.5 hover:text-white"
                      href={link.href}
                      key={link.label}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-white/[0.08] py-10 sm:py-12">
          <p className="text-center text-xs font-black uppercase tracking-[0.3em] text-zinc-500">
            Official Broadcast Partners
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {broadcastPartners.map((partner) => (
              <div
                className="footer-partner-logo rounded-2xl border border-white/[0.08] bg-[#0D0D0D] px-5 py-3 text-[0.68rem] font-black uppercase tracking-[0.14em] text-zinc-300 sm:px-6 sm:text-xs"
                key={partner}
              >
                {partner}
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-white/[0.08] py-10 sm:py-12">
          <p className="text-center text-xs font-black uppercase tracking-[0.3em] text-zinc-500">
            Follow The League
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {socialLinks.map((social) => (
              <a
                className="footer-social-icon group/social flex min-w-[5.5rem] flex-col items-center gap-2 rounded-2xl border border-transparent px-3 py-3 transition hover:border-white/[0.08] hover:bg-white/[0.03]"
                href={social.href}
                key={social.label}
                rel="noreferrer"
                target="_blank"
              >
                <SocialIcon label={social.label} />
                <span className="text-[0.62rem] font-black uppercase tracking-[0.16em]">{social.label}</span>
                <span className="font-stats text-sm font-bold text-zinc-500 transition group-hover/social:text-white">
                  {social.followers}
                </span>
              </a>
            ))}
          </div>
        </section>

        <div className="py-12 text-center sm:py-16">
          <p className="footer-signature-glow font-display text-[clamp(1.5rem,5vw,2.5rem)] uppercase leading-tight tracking-wide text-white">
            Built For Fighters.
          </p>
          <p className="footer-signature-glow mt-2 font-display text-[clamp(1.25rem,4vw,2rem)] uppercase leading-tight tracking-wide text-[#FF1010]">
            Powered By Latayanology.
          </p>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/[0.08] py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-5 text-xs font-bold uppercase tracking-[0.16em] text-zinc-600">
            <Link className="transition hover:text-white" href="/privacy">Privacy Policy</Link>
            <Link className="transition hover:text-white" href="/terms">Terms</Link>
            <Link className="transition hover:text-white" href="/broadcast-rights">Broadcast Rights</Link>
            <Link className="transition hover:text-white" href="/ranking-methodology">Ranking Methodology</Link>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-600">
            © {new Date().getFullYear()} Juego Todo Combat Sports Platform
          </p>
        </div>
      </div>
    </footer>
  );
}
