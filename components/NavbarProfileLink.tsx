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
  if (loading || !user || !showUsername) {
    return null;
  }

  const greeting = `Hi ${getProfileFirstName(user)}`;

  return (
    <Link aria-label={`${greeting} profile`} className={className} href={href}>
      {greeting}
    </Link>
  );
}
