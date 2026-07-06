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

const desktopNavLinkClassName =
  "nav-link-underline px-4 py-2.5 text-[0.8125rem] font-bold uppercase tracking-[0.12em] text-zinc-400 sm:text-[0.84rem] sm:tracking-[0.13em]";

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
        className="relative mx-auto flex min-h-[4.25rem] max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-6 lg:min-h-[4.5rem] lg:px-8 lg:py-3.5"
      >
        <div className="relative z-10 flex shrink-0 items-center">
          <BrandLogo />
        </div>

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex xl:gap-1.5">
          {centerLinks.map((item) => {
            const active = isNavActive(pathname, item.href, item.label);

            if (item.children?.length) {
              const isDropdownOpen = openDropdown === item.label;

              return (
                <div
                  className="relative"
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
                        role="menu"
                        transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {item.children.map((child) => {
                          const childActive = isChildActive(pathname, child.href);

                          return (
                            <Link
                              className="nav-dropdown-link"
                              data-active={childActive ? "true" : "false"}
                              href={child.href}
                              key={child.href}
                              role="menuitem"
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

        <div className="relative z-10 flex items-center gap-2.5 sm:gap-3">
          <NavbarCartLink />

          <div className="hidden items-center gap-2.5 lg:flex">
            {!loading && !user ? (
              <>
                <Link className="nav-auth-outline" href={loginHref}>
                  Login
                </Link>
                <Link className="nav-auth-primary" href={registerHref}>
                  Register
                </Link>
              </>
            ) : null}
            {user ? (
              <NavbarProfileLink className="nav-profile-greeting" href={loginHref} loading={loading} user={user} />
            ) : null}
          </div>

          <button
            aria-controls="mobile-primary-nav"
            aria-expanded={isOpen}
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            className="nav-menu-toggle lg:hidden"
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
              className="nav-mobile-backdrop fixed inset-0 z-40 lg:hidden"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              transition={{ duration: 0.24 }}
              type="button"
            />
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="nav-mobile-drawer relative z-50 max-h-[calc(100svh-4.25rem)] overflow-y-auto lg:hidden"
              exit={{ opacity: 0, y: -12 }}
              id="mobile-primary-nav"
              initial={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mx-auto grid max-w-7xl gap-2 px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6">
                {centerLinks.map((item) => {
                  const active = isNavActive(pathname, item.href, item.label);
                  const hasChildren = Boolean(item.children?.length);
                  const expanded = mobileExpanded === item.label;
                  const mobileChildren = item.children ?? [];

                  if (hasChildren) {
                    return (
                      <div className="grid gap-1.5" key={item.href}>
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
                            className="nav-menu-toggle min-w-[3rem] px-4"
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
                              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
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

                <div className="mt-3 grid grid-cols-2 gap-2.5 border-t border-white/[0.08] pt-4">
                  {!loading && !user ? (
                    <>
                      <Link className="nav-auth-outline min-h-12" href={loginHref} onClick={() => setIsOpen(false)}>
                        Login
                      </Link>
                      <Link className="nav-auth-primary min-h-12" href={registerHref} onClick={() => setIsOpen(false)}>
                        Register
                      </Link>
                    </>
                  ) : null}
                  {user ? (
                    <>
                      <NavbarProfileLink
                        className="nav-profile-greeting col-span-2 min-h-12 justify-center px-4"
                        href={loginHref}
                        loading={loading}
                        user={user}
                      />
                      <button
                        className="nav-auth-outline col-span-2 min-h-12 gap-2"
                        onClick={() => {
                          setIsOpen(false);
                          openCartDrawer();
                        }}
                        type="button"
                      >
                        <ShoppingCart aria-hidden size={16} />
                        Cart {cartCount > 0 ? `(${cartCount})` : ""}
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
