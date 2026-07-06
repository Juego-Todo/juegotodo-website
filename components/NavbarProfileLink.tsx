"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProfileAvatarButton } from "@/components/profile/ProfileAvatarButton";
import type { UserProfile } from "@/lib/auth/types";
import { formatUsername } from "@/lib/auth/username";
import { fetchLicenseApplicationByUserId } from "@/lib/licenses/storage";
import { useProfilePortrait } from "@/lib/profile/use-profile-portrait";

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

  const { portraitImage, savePortrait } = useProfilePortrait(user?.id, licensePhoto);

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
  const usernameLabel = formatUsername(user.username);

  return (
    <div className={`inline-flex min-w-0 items-center gap-2.5 ${className}`}>
      <ProfileAvatarButton
        accent="red"
        displayName={displayName}
        onSave={savePortrait}
        portraitImage={portraitImage}
        showCameraHint={false}
        size="sm"
      />
      {showUsername ? (
        <Link
          aria-label={`${usernameLabel} profile`}
          className="max-w-[9rem] truncate text-xs font-bold normal-case tracking-[0.02em] text-zinc-200 transition hover:text-white"
          href={href}
        >
          {usernameLabel}
        </Link>
      ) : null}
    </div>
  );
}
