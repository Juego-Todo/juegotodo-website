"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, Package, Settings, ShoppingCart, User, X } from "lucide-react";
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
  "/rules-regulations",
  "/partners",
  "/partnerships",
  "/grand-council",
];

const latayanologyPaths = ["/latayanology", "/fighters", "/fma-lineage", "/juego-todo-seminars"];

const desktopNavLinkClassName =
  "nav-link-underline shrink-0 whitespace-nowrap px-3 text-[0.78rem] font-bold uppercase leading-none tracking-[0.15em] text-zinc-400 2xl:px-4";

const accountLinks = [
  { label: "Profile", href: "/profile", icon: User },
  { label: "Orders", href: "/orders", icon: Package },
  { label: "Settings", href: "/profile?tab=settings", icon: Settings },
];

function isNavActive(pathname: string, href: string, label: string) {
  if (label === "Home") {
    return pathname === "/";
  }

  if (label === "About Us") {
    return (
      aboutUsPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`)) ||
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

function isChildActive(pathname: string, href: string) {
  if (href.includes("#")) {
    return pathname === href.split("#")[0];
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

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setOpenDropdown(null);
        setMobileExpanded(null);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  function closeDropdownIfBlurred(currentTarget: HTMLElement, relatedTarget: EventTarget | null) {
    if (!relatedTarget || !currentTarget.contains(relatedTarget as Node)) {
      setOpenDropdown(null);
    }
  }

  return (
    <header className={`glass-nav fixed inset-x-0 top-0 z-50 ${scrolled ? "glass-nav-scrolled" : ""}`}>
      <nav
        aria-label="Primary navigation"
        className={`relative mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 transition-[min-height,padding] duration-300 ease-out sm:gap-4 sm:px-6 lg:px-8 xl:grid xl:grid-cols-[auto_1fr_auto] xl:items-center xl:gap-6 ${
          scrolled ? "min-h-[4rem] py-2.5" : "min-h-[4.75rem] py-3"
        }`}
      >
        <div className="relative z-10 flex shrink-0 items-center xl:justify-self-start">
          <BrandLogo variant="header" />
        </div>

        <div className="hidden min-w-0 items-center justify-center gap-4 xl:flex 2xl:gap-8">
          {centerLinks.map((item) => {
            const active = isNavActive(pathname, item.href, item.label);

            if (item.children?.length) {
              const isDropdownOpen = openDropdown === item.label;

              return (
                <div
                  className="relative flex items-center"
                  key={item.href}
                  onBlur={(event) => closeDropdownIfBlurred(event.currentTarget, event.relatedTarget)}
                  onFocus={() => setOpenDropdown(item.label)}
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="menu"
                    className={`${desktopNavLinkClassName} ${active ? "text-white" : "hover:text-white"}`}
                    data-active={active ? "true" : "false"}
                    href={item.href}
                  >
                    {item.label}
                    <ChevronDown
                      aria-hidden
                      className={`transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                      size={14}
                    />
                  </Link>
                  <AnimatePresence>
                    {isDropdownOpen ? (
                      <motion.div
                        animate={{ opacity: 1, y: 0 }}
                        aria-label={`${item.label} submenu`}
                        className="nav-dropdown-panel absolute left-1/2 top-[calc(100%+0.65rem)] z-50 w-72 -translate-x-1/2 rounded-xl p-2"
                        exit={{ opacity: 0, y: 10 }}
                        initial={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {item.children.map((child) => {
                          const childActive = isChildActive(pathname, child.href);

                          return (
                            <Link
                              className="nav-dropdown-link"
                              data-active={childActive ? "true" : "false"}
                              href={child.href}
                              key={child.href}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <Link
                className={`${desktopNavLinkClassName} ${active ? "text-white" : "hover:text-white"}`}
                data-active={active ? "true" : "false"}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="relative z-10 flex shrink-0 items-center gap-2.5 sm:gap-3 xl:col-start-3 xl:justify-self-end">
          <NavbarCartLink />

          <div className="hidden shrink-0 items-center gap-2 lg:flex lg:items-center lg:gap-2.5">
            {!user ? (
              <>
                <Link className="nav-auth-outline" href={loginHref}>
                  Login
                </Link>
                <Link className="nav-auth-primary" href={registerHref}>
                  Sign Up
                </Link>
              </>
            ) : (
              <NavbarProfileLink
                className="nav-profile-greeting"
                href={loginHref}
                loading={loading}
                showMenu
                user={user}
              />
            )}
          </div>

          <button
            aria-controls="mobile-primary-nav"
            aria-expanded={isOpen}
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            className="nav-menu-toggle nav-menu-toggle--header inline-flex"
            onClick={() => setIsOpen((value) => !value)}
            type="button"
          >
            {isOpen ? <X aria-hidden size={20} /> : <Menu aria-hidden size={20} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen ? (
          <>
            <motion.button
              animate={{ opacity: 1 }}
              aria-label="Close navigation menu"
              className="nav-mobile-backdrop fixed inset-0 z-40 xl:hidden"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              transition={{ duration: 0.24 }}
              type="button"
            />
            <motion.aside
              animate={{ opacity: 1, x: 0 }}
              aria-label="Mobile navigation"
              className="nav-mobile-drawer fixed right-0 top-0 z-50 flex h-dvh w-[min(420px,calc(100vw-1rem))] flex-col overflow-hidden pt-[env(safe-area-inset-top)] xl:hidden"
              exit={{ opacity: 0, x: "100%" }}
              id="mobile-primary-nav"
              initial={{ opacity: 0, x: "100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex min-h-[4.75rem] shrink-0 items-center justify-between border-b border-white/[0.08] px-5">
                <BrandLogo variant="header" />
                <button
                  aria-label="Close navigation menu"
                  className="nav-menu-toggle inline-flex"
                  onClick={() => setIsOpen(false)}
                  type="button"
                >
                  <X aria-hidden size={20} />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                <div className="grid gap-1.5">
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
                            className="nav-mobile-link"
                            data-active={active ? "true" : "false"}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                          >
                            {item.label}
                          </Link>
                          <button
                            aria-controls={`mobile-submenu-${item.label.replace(/\s+/g, "-").toLowerCase()}`}
                            aria-expanded={expanded}
                            aria-label={`${expanded ? "Collapse" : "Expand"} ${item.label} submenu`}
                            className="nav-mobile-accordion-button"
                            onClick={() => setMobileExpanded(expanded ? null : item.label)}
                            type="button"
                          >
                            <ChevronDown
                              aria-hidden
                              className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
                              size={16}
                            />
                          </button>
                        </div>
                        <AnimatePresence initial={false}>
                          {expanded ? (
                            <motion.div
                              animate={{ height: "auto", opacity: 1 }}
                              className="grid gap-1 overflow-hidden pl-2"
                              exit={{ height: 0, opacity: 0 }}
                              id={`mobile-submenu-${item.label.replace(/\s+/g, "-").toLowerCase()}`}
                              initial={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            >
                              {mobileChildren.map((child) => (
                                <Link
                                  className="nav-mobile-sublink"
                                  href={child.href}
                                  key={child.href}
                                  onClick={() => setIsOpen(false)}
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
                      className="nav-mobile-link"
                      data-active={active ? "true" : "false"}
                      href={item.href}
                      key={item.href}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                </div>

                <div className="mt-5 border-t border-white/[0.08] pt-5">
                  {!user ? (
                    <div className="grid grid-cols-2 gap-2.5">
                      <Link className="nav-auth-outline min-h-12" href={loginHref} onClick={() => setIsOpen(false)}>
                        Login
                      </Link>
                      <Link className="nav-auth-primary min-h-12" href={registerHref} onClick={() => setIsOpen(false)}>
                        Sign Up
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="px-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-zinc-500">Account</p>
                      <NavbarProfileLink
                        className="nav-mobile-account-greeting"
                        href={loginHref}
                        loading={loading}
                        user={user}
                      />
                      <div className="grid gap-1">
                        {accountLinks.map((link) => {
                          const Icon = link.icon;

                          return (
                            <Link
                              className="nav-mobile-account-link"
                              href={link.href}
                              key={link.href}
                              onClick={() => setIsOpen(false)}
                            >
                              <Icon aria-hidden size={17} strokeWidth={2} />
                              {link.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 border-t border-white/[0.08] pt-5">
                  <button
                    className="nav-mobile-account-link w-full justify-between"
                    onClick={() => {
                      setIsOpen(false);
                      openCartDrawer();
                    }}
                    type="button"
                  >
                    <span className="inline-flex items-center gap-3">
                      <ShoppingCart aria-hidden size={17} strokeWidth={2} />
                      Cart
                    </span>
                    {cartCount > 0 ? (
                      <span className="rounded-full bg-[#FF1010] px-2 py-0.5 text-[0.65rem] font-black text-white">
                        {cartCount}
                      </span>
                    ) : null}
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
