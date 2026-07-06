"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { UserProfile } from "@/lib/auth/types";
import { formatUsername } from "@/lib/auth/username";
import { fetchLicenseApplicationByUserId } from "@/lib/licenses/storage";
import { useProfilePortrait } from "@/lib/profile/use-profile-portrait";

function buildInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

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
  const [licensePhoto, setLicensePhoto] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLicensePhoto(null);
      return;
    }

    let active = true;
    void fetchLicenseApplicationByUserId(user.id).then((application) => {
      if (active) {
        setLicensePhoto(application?.uploads?.profilePhoto ?? null);
      }
    });

    return () => {
      active = false;
    };
  }, [user?.id]);

  const { portraitImage } = useProfilePortrait(user?.id, licensePhoto);

  if (loading) {
    return <span className={className}>Login</span>;
  }

  if (!user) {
    return (
      <Link className={className} href={href}>
        Login
      </Link>
    );
  }

  const displayName = user.fullName.trim() || user.username;
  const initials = buildInitials(displayName) || user.username.slice(0, 2).toUpperCase();
  const usernameLabel = formatUsername(user.username);

  return (
    <Link
      aria-label={`${usernameLabel} profile`}
      className={`inline-flex min-w-0 items-center gap-2.5 ${className}`}
      href={href}
    >
      <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/20 bg-zinc-900 shadow-[0_0_16px_rgba(255,255,255,0.06)]">
        {portraitImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" className="h-full w-full object-cover object-top" src={portraitImage} />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_35%_18%,rgba(255,16,16,0.22),transparent_42%),linear-gradient(145deg,#27272a,#050505)] text-[0.62rem] font-black uppercase tracking-[0.04em] text-white">
            {initials}
          </span>
        )}
      </span>
      {showUsername ? (
        <span className="max-w-[9rem] truncate text-xs font-bold normal-case tracking-[0.02em] text-zinc-200">
          {usernameLabel}
        </span>
      ) : null}
    </Link>
  );
}
