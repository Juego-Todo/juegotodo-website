"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { useAuth } from "@/lib/auth/context";
import { useCommerce } from "@/lib/commerce/context";
import { shopNavCategories } from "@/lib/commerce/types";
import { navItems } from "@/data/site";

function isNavActive(pathname: string, href: string, label: string) {
  if (pathname === href || pathname.startsWith(`${href}/`)) {
    return true;
  }

  if (label === "Rankings") {
    return pathname === "/rankings" || pathname.startsWith("/fighters") || pathname === "/ranking-methodology";
  }

  if (label === "Teams") {
    return pathname.startsWith("/teams");
  }

  if (label === "Partners") {
    return pathname === "/partners" || pathname === "/partnerships";
  }

  if (label === "Shop") {
    return pathname.startsWith("/shop");
  }

  if (label === "News") {
    return pathname.startsWith("/media");
  }

  return false;
}

export function Navbar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { cartCount } = useCommerce();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  const centerLinks = navItems.filter((item) => !item.cta && item.label !== "Login" && item.label !== "Register");
  const loginItem = navItems.find((item) => item.label === "Login");
  const registerItem = navItems.find((item) => item.cta);

  const loginHref = user ? "/profile" : loginItem?.href ?? "/login";
  const loginLabel = user ? "Profile" : "Login";
  const registerHref = registerItem?.href ?? "/login?mode=register";

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 24);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setOpenDropdown(null);
    setMobileExpanded(null);
  }, [pathname]);

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
                    className={`nav-link-underline inline-flex items-center gap-1 px-3 py-2 text-[0.72rem] font-bold uppercase tracking-[0.18em] transition sm:text-xs ${
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
                        className={`absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 rounded-2xl border border-white/10 bg-[#050505]/98 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.55)] ${
                          item.label === "Rankings" ? "w-64" : "w-56"
                        }`}
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
                className={`nav-link-underline px-3 py-2 text-[0.72rem] font-bold uppercase tracking-[0.18em] transition sm:text-xs ${
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
          <Link
            aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
            className="relative rounded-full border border-white/10 bg-white/5 p-2.5 text-white transition hover:border-red-500/40"
            href="/cart"
          >
            <ShoppingBag size={18} aria-hidden />
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF1010] px-1 text-[0.6rem] font-black text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            <Link
              className="nav-link-underline px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-zinc-300 transition hover:text-white"
              href={loginHref}
            >
              {loading ? "Login" : loginLabel}
            </Link>
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
                const mobileChildren =
                  item.label === "Shop"
                    ? shopNavCategories.map((child) => ({ label: child.label, href: child.href }))
                    : item.children ?? [];

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
                <Link
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/[0.08] px-4 text-sm font-black uppercase tracking-[0.16em] text-white"
                  href={loginHref}
                >
                  {loading ? "Login" : loginLabel}
                </Link>
                {!user ? (
                  <Link
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#FF1010] px-4 text-sm font-black uppercase tracking-[0.16em] text-white"
                    href={registerHref}
                  >
                    Register
                  </Link>
                ) : (
                  <Link
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/[0.08] px-4 text-sm font-black uppercase tracking-[0.16em] text-white"
                    href="/cart"
                  >
                    Cart {cartCount > 0 ? `(${cartCount})` : ""}
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
