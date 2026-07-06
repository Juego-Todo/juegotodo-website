"use client";

import Link from "next/link";
import { getProfileFirstName } from "@/lib/auth/name";
import type { UserProfile } from "@/lib/auth/types";

type NavbarProfileLinkProps = {
  user: UserProfile | null;
  loading: boolean;
  href: string;
  className?: string;
  showUsername?: boolean;
};

export function NavbarProfileLink({
  user,
  loading,
  href,
  className = "",
  showUsername = true,
}: NavbarProfileLinkProps) {
  if (loading || !user) {
    return null;
  }

  const greeting = `Hi ${getProfileFirstName(user)}`;

  if (!showUsername) {
    return null;
  }

  return (
    <Link
      aria-label={`${greeting} profile`}
      className={`max-w-[9rem] truncate text-xs font-bold normal-case tracking-[0.02em] text-zinc-200 transition hover:text-white ${className}`}
      href={href}
    >
      {greeting}
    </Link>
  );
}
