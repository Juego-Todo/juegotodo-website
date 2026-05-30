"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { navItems } from "@/data/site";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const desktopNavRef = useRef<HTMLDivElement>(null);
  const isActive = (item: (typeof navItems)[number]) =>
    pathname === item.href || item.children?.some((child) => child.href === pathname);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        desktopNavRef.current &&
        !desktopNavRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-2xl">
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8 lg:py-3"
      >
        <BrandLogo />
        <div className="hidden items-center gap-2 lg:flex" ref={desktopNavRef}>
          {navItems.map((item) => {
            const active = isActive(item);
            const hasChildren = Boolean(item.children?.length);
            const expanded = openMenu === item.href;

            if (item.cta) {
              return (
                <Link
                  className="inline-flex items-center rounded-full bg-red-600 px-5 py-2.5 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[0_0_28px_rgba(229,9,20,0.45)] transition hover:-translate-y-0.5 hover:bg-red-500"
                  href={item.href}
                  key={item.href}
                  onClick={() => setOpenMenu(null)}
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <div className="relative" key={item.href}>
                {hasChildren ? (
                  <button
                    aria-expanded={expanded}
                    aria-haspopup="menu"
                    className={`inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em] transition ${
                      active || expanded
                        ? "bg-red-600 text-white shadow-[0_0_22px_rgba(229,9,20,0.35)]"
                        : "text-zinc-300 hover:bg-white/10 hover:text-white"
                    }`}
                    onClick={() => setOpenMenu((current) => (current === item.href ? null : item.href))}
                    type="button"
                  >
                    {item.label}
                    <ChevronDown
                      aria-hidden
                      className={`transition ${expanded ? "rotate-180" : ""}`}
                      size={15}
                    />
                  </button>
                ) : (
                  <Link
                    className={`inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em] transition ${
                      active
                        ? "bg-red-600 text-white shadow-[0_0_22px_rgba(229,9,20,0.35)]"
                        : "text-zinc-300 hover:bg-white/10 hover:text-white"
                    }`}
                    href={item.href}
                    onClick={() => setOpenMenu(null)}
                  >
                    {item.label}
                  </Link>
                )}
                {hasChildren ? (
                  <div
                    className={`absolute left-0 top-full z-50 mt-3 min-w-72 rounded-3xl border border-white/10 bg-black/95 p-2 shadow-[0_24px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition ${
                      expanded
                        ? "visible translate-y-0 opacity-100"
                        : "invisible translate-y-2 opacity-0"
                    }`}
                    role="menu"
                  >
                    <Link
                      className={`block rounded-2xl px-4 py-3 text-sm font-bold uppercase tracking-[0.16em] transition ${
                        pathname === item.href
                          ? "bg-red-600 text-white"
                          : "text-zinc-300 hover:bg-white/10 hover:text-white"
                      }`}
                      href={item.href}
                      onClick={() => setOpenMenu(null)}
                      role="menuitem"
                    >
                      All {item.label}
                    </Link>
                    {item.children?.map((child) => (
                      <Link
                        className={`block rounded-2xl px-4 py-3 text-sm font-bold uppercase tracking-[0.16em] transition ${
                          pathname === child.href
                            ? "bg-red-600 text-white"
                            : "text-zinc-300 hover:bg-white/10 hover:text-white"
                        }`}
                        href={child.href}
                        key={child.href}
                        onClick={() => setOpenMenu(null)}
                        role="menuitem"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        <button
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
          className="inline-flex rounded-full border border-white/15 bg-white/10 p-3 text-white shadow-[0_0_24px_rgba(255,255,255,0.08)] lg:hidden"
          onClick={() => setIsOpen((value) => !value)}
          type="button"
        >
          {isOpen ? <X aria-hidden size={20} /> : <Menu aria-hidden size={20} />}
        </button>
      </nav>
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            animate={{ height: "auto", opacity: 1 }}
            className="max-h-[calc(100svh-4.5rem)] overflow-y-auto border-t border-white/10 bg-black/95 shadow-[0_24px_80px_rgba(0,0,0,0.55)] lg:hidden"
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
          >
            <div className="mx-auto grid max-w-7xl gap-3 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
              {navItems.map((item) =>
                item.cta ? (
                  <Link
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-red-600 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-white shadow-[0_0_28px_rgba(229,9,20,0.45)]"
                    href={item.href}
                    key={item.href}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <div
                    className="rounded-3xl border border-white/10 bg-white/[0.04] p-2"
                    key={item.href}
                  >
                    <Link
                      className={`block rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-[0.2em] ${
                        pathname === item.href ? "bg-red-600 text-white" : "text-zinc-100"
                      }`}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                    {item.children?.length ? (
                      <div className="grid gap-1 border-t border-white/10 px-2 py-2">
                        {item.children.map((child) => (
                          <Link
                            className={`rounded-2xl px-3 py-2.5 text-sm font-semibold transition hover:bg-white/10 hover:text-white ${
                              pathname === child.href ? "bg-white/10 text-white" : "text-zinc-400"
                            }`}
                            href={child.href}
                            key={child.href}
                            onClick={() => setIsOpen(false)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ),
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
