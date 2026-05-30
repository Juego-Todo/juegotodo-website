import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { navItems } from "@/data/site";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <div>
          <BrandLogo />
          <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-400">
            Juego Todo is a modern Filipino combat sports platform built for
            elite athletes, partner gyms, sponsors, media, and global fight
            fans.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
          {navItems
            .filter((item) => !item.cta)
            .map((item) => (
            <div key={item.href}>
              <Link
                className="text-sm font-bold uppercase tracking-[0.18em] text-zinc-200 transition hover:text-white"
                href={item.href}
              >
                {item.label}
              </Link>
              {item.children?.length ? (
                <div className="mt-3 grid gap-2">
                  {item.children.map((child) => (
                    <Link
                      className="text-sm font-semibold text-zinc-500 transition hover:text-white"
                      href={child.href}
                      key={child.href}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
          <div>
            <Link
              className="text-sm font-bold uppercase tracking-[0.18em] text-zinc-200 transition hover:text-white"
              href="/login"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs uppercase tracking-[0.28em] text-zinc-500">
        Juego Todo Combat Sports Platform
      </div>
    </footer>
  );
}
