"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { getProfileFirstName } from "@/lib/auth/name";
import type { UserProfile } from "@/lib/auth/types";

type NavbarProfileLinkProps = {
  user: UserProfile | null;
  loading: boolean;
  href: string;
  className?: string;
  showUsername?: boolean;
  showMenu?: boolean;
};

export function NavbarProfileLink({
  user,
  loading,
  href,
  className = "",
  showUsername = true,
  showMenu = false,
}: NavbarProfileLinkProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  if (!user || !showUsername) {
    return null;
  }

  const greeting = `Hi ${getProfileFirstName(user)}`;

  if (!showMenu) {
    return (
      <Link aria-label={`${greeting} profile`} className={className} href={href}>
        {greeting}
      </Link>
    );
  }

  async function handleSignOut() {
    setOpen(false);
    await logout();
    router.push("/");
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`${greeting} account menu`}
        className={`${className} gap-1.5`}
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span className="truncate">{greeting}</span>
        <ChevronDown
          aria-hidden
          className={`shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          size={14}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            aria-label="Account menu"
            className="nav-profile-menu absolute right-0 top-[calc(100%+0.55rem)] z-50 min-w-[11rem] rounded-xl p-1.5"
            exit={{ opacity: 0, y: 8 }}
            initial={{ opacity: 0, y: 8 }}
            role="menu"
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              className="nav-profile-menu-link"
              href={href}
              onClick={() => setOpen(false)}
              role="menuitem"
            >
              <User aria-hidden size={15} strokeWidth={2} />
              Profile
            </Link>
            <button
              className="nav-profile-menu-link nav-profile-menu-link--danger w-full"
              onClick={() => void handleSignOut()}
              role="menuitem"
              type="button"
            >
              <LogOut aria-hidden size={15} strokeWidth={2} />
              Sign Out
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
