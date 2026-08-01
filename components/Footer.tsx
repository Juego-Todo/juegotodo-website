import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { footerLegalLinks, socialLinks } from "@/data/site";

/** High-value destinations only — avoids duplicating the full navbar sitemap. */
const primaryLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about-juego-todo" },
  { label: "Calendar", href: "/calendar" },
  { label: "Fighters", href: "/latayanology" },
  { label: "Media", href: "/media" },
  { label: "Shop", href: "/shop" },
  { label: "Rules", href: "/rules-regulations" },
  { label: "Partners", href: "/partners" },
] as const;

function SocialIcon({ icon }: { icon: (typeof socialLinks)[number]["icon"] }) {
  const className = "h-3.5 w-3.5";

  switch (icon) {
    case "instagram":
      return (
        <svg aria-hidden className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
        </svg>
      );
    case "facebook":
      return (
        <svg aria-hidden className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M22 12a10 10 0 1 0-11.6 9.9v-7h-2.3V12h2.3V9.8c0-2.3 1.3-3.5 3.4-3.5 1 0 2 .2 2 .2v2.2h-1.1c-1.1 0-1.4.7-1.4 1.4V12h2.4l-.4 2.9h-2v7A10 10 0 0 0 22 12" />
        </svg>
      );
    case "youtube":
      return (
        <svg aria-hidden className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1 31.5 31.5 0 0 0 .5-5.8 31.5 31.5 0 0 0-.5-5.8M9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg aria-hidden className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.75a8.18 8.18 0 0 0 4.77 1.52V6.87a4.85 4.85 0 0 1-1-.18z" />
        </svg>
      );
    default:
      return null;
  }
}

function SocialRow({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {socialLinks.map((social) => (
        <a
          aria-label={social.label}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-zinc-500 transition hover:bg-white/[0.06] hover:text-white"
          href={social.href}
          key={social.href}
          rel="noreferrer"
          target="_blank"
        >
          <SocialIcon icon={social.icon} />
        </a>
      ))}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="relative mt-auto border-t border-white/[0.08] bg-[#050505]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF1010]/70 to-transparent" aria-hidden />

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div className="flex items-center justify-between gap-4 lg:justify-start lg:gap-6">
            <div className="flex min-w-0 items-center gap-3">
              <BrandLogo variant="header" />
            </div>
            <SocialRow className="shrink-0 lg:hidden" />
          </div>

          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center gap-x-4 gap-y-2 lg:justify-center"
          >
            {primaryLinks.map((link) => (
              <Link
                className="inline-flex min-h-10 items-center text-[0.7rem] font-bold uppercase tracking-[0.14em] text-zinc-500 transition hover:text-white"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <SocialRow className="hidden shrink-0 lg:flex" />
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-white/[0.06] pt-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-zinc-600">
            © {new Date().getFullYear()} Juego Todo
          </p>
          <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-zinc-600">
            {footerLegalLinks.map((link, index) => (
              <span className="contents" key={link.href}>
                {index > 0 ? <span aria-hidden className="text-zinc-800">·</span> : null}
                <Link className="transition hover:text-zinc-300" href={link.href}>
                  {link.label}
                </Link>
              </span>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
