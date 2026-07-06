"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { NavbarCartLink } from "@/components/commerce/NavbarCartLink";
import { NavbarProfileLink } from "@/components/NavbarProfileLink";
import { useAuth } from "@/lib/auth/context";
import { useCommerce } from "@/lib/commerce/context";
import { navItems } from "@/data/site";

const aboutUsPaths = [
  "/about-juego-todo",
  "/calendar",
  "/events",
  "/juego-todo-seminars",
  "/rules-regulations",
  "/partners",
  "/partnerships",
  "/grand-council",
];

const latayanologyPaths = ["/latayanology", "/fighters", "/fma-lineage", "/calendar"];

function isNavActive(pathname: string, href: string, label: string) {
  if (label === "Home") {
    return pathname === "/";
  }

  if (label === "About Us") {
    return (
      aboutUsPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`)) ||
      pathname.startsWith("/juego-todo-seminars/") ||
      pathname.startsWith("/rules-regulations/")
    );
  }

  if (label === "Latayanology") {
    return latayanologyPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  }

  if (label === "Media") {
    return pathname === "/media" || pathname.startsWith("/media/");
  }

  if (label === "Shop") {
    return pathname.startsWith("/shop");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { cartCount, openCartDrawer } = useCommerce();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [navPathname, setNavPathname] = useState(pathname);

  if (pathname !== navPathname) {
    setNavPathname(pathname);
    setIsOpen(false);
    setOpenDropdown(null);
    setMobileExpanded(null);
  }

  const centerLinks = navItems.filter((item) => !item.cta && item.label !== "Login" && item.label !== "Register");
  const loginItem = navItems.find((item) => item.label === "Login");
  const registerItem = navItems.find((item) => item.cta);

  const loginHref = user ? "/profile" : loginItem?.href ?? "/login";
  const registerHref = registerItem?.href ?? "/login?mode=register";

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 24);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`glass-nav fixed inset-x-0 top-0 z-50 ${scrolled ? "glass-nav-scrolled" : ""}`}>
      <nav
        aria-label="Primary navigation"
        className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8 lg:py-3"
      >
        <BrandLogo />

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 lg:flex">
          {centerLinks.map((item) => {
            const active = isNavActive(pathname, item.href, item.label);

            if (item.children?.length) {
              const isOpenDropdown = openDropdown === item.label;

              return (
                <div
                  className="relative"
                  key={item.href}
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    className={`nav-link-underline inline-flex items-center gap-1 px-3.5 py-2 text-[0.78rem] font-bold uppercase tracking-[0.16em] transition sm:text-[0.82rem] ${
                      active ? "text-white" : "text-zinc-400 hover:text-white"
                    }`}
                    href={item.href}
                  >
                    {item.label}
                    <ChevronDown className={`transition ${isOpenDropdown ? "rotate-180" : ""}`} size={14} aria-hidden />
                  </Link>
                  <AnimatePresence>
                    {isOpenDropdown ? (
                      <motion.div
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-2xl border border-white/10 bg-[#050505]/98 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
                        exit={{ opacity: 0, y: 8 }}
                        initial={{ opacity: 0, y: 8 }}
                      >
                        {item.children.map((child) => (
                          <Link
                            className="block rounded-xl px-3 py-2.5 text-[0.68rem] font-black uppercase tracking-[0.16em] text-zinc-300 transition hover:bg-white/5 hover:text-white"
                            href={child.href}
                            key={child.href}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <Link
                className={`nav-link-underline px-3.5 py-2 text-[0.78rem] font-bold uppercase tracking-[0.16em] transition sm:text-[0.82rem] ${
                  active ? "text-white" : "text-zinc-400 hover:text-white"
                }`}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <NavbarCartLink />

          <div className="hidden items-center gap-2 lg:flex">
            <NavbarProfileLink
              className="nav-link-underline px-3 py-2 transition hover:text-white"
              href={loginHref}
              loading={loading}
              user={user}
            />
            {!user ? (
              <Link
                className="inline-flex items-center rounded-full bg-[#FF1010] px-5 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-white shadow-[0_0_28px_rgba(255,16,16,0.4)] transition hover:-translate-y-0.5 hover:bg-[#ff2828]"
                href={registerHref}
              >
                Register
              </Link>
            ) : null}
          </div>

          <button
            aria-expanded={isOpen}
            aria-label="Toggle navigation"
            className="inline-flex rounded-full border border-white/15 bg-white/10 p-3 text-white lg:hidden"
            onClick={() => setIsOpen((value) => !value)}
            type="button"
          >
            {isOpen ? <X aria-hidden size={20} /> : <Menu aria-hidden size={20} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            animate={{ height: "auto", opacity: 1 }}
            className="max-h-[calc(100svh-4.5rem)] overflow-y-auto border-t border-white/[0.08] bg-[#050505]/98 lg:hidden"
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
          >
            <div className="mx-auto grid max-w-7xl gap-2 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
              {centerLinks.map((item) => {
                const active = isNavActive(pathname, item.href, item.label);
                const hasChildren = Boolean(item.children?.length);
                const expanded = mobileExpanded === item.label;
                const mobileChildren = item.children ?? [];

                if (hasChildren) {
                  return (
                    <div className="grid gap-1" key={item.href}>
                      <div className="grid grid-cols-[1fr_auto] gap-2">
                        <Link
                          className={`rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-[0.18em] ${
                            active ? "bg-[#FF1010] text-white" : "text-zinc-200 hover:bg-white/5"
                          }`}
                          href={item.href}
                        >
                          {item.label}
                        </Link>
                        <button
                          aria-expanded={expanded}
                          className="rounded-2xl border border-white/10 px-4 text-zinc-300"
                          onClick={() => setMobileExpanded(expanded ? null : item.label)}
                          type="button"
                        >
                          <ChevronDown className={`transition ${expanded ? "rotate-180" : ""}`} size={16} aria-hidden />
                        </button>
                      </div>
                      {expanded ? (
                        <div className="grid gap-1 pl-3">
                          {mobileChildren.map((child) => (
                            <Link
                              className="rounded-xl px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-zinc-400 hover:bg-white/5 hover:text-white"
                              href={child.href}
                              key={child.href}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                }

                return (
                  <Link
                    className={`rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-[0.18em] ${
                      active ? "bg-[#FF1010] text-white" : "text-zinc-200 hover:bg-white/5"
                    }`}
                    href={item.href}
                    key={item.href}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-white/[0.08] pt-4">
                <NavbarProfileLink
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/[0.08] px-4 text-sm font-black uppercase tracking-[0.16em] text-white"
                  href={loginHref}
                  loading={loading}
                  user={user}
                />
                {!user ? (
                  <Link
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#FF1010] px-4 text-sm font-black uppercase tracking-[0.16em] text-white"
                    href={registerHref}
                  >
                    Register
                  </Link>
                ) : (
                  <button
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/[0.08] px-4 text-sm font-black uppercase tracking-[0.16em] text-white"
                    onClick={() => {
                      setIsOpen(false);
                      openCartDrawer();
                    }}
                    type="button"
                  >
                    <ShoppingCart aria-hidden size={16} />
                    Cart {cartCount > 0 ? `(${cartCount})` : ""}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
