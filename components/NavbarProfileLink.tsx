"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProfileAvatarButton } from "@/components/profile/ProfileAvatarButton";
import { getProfileFirstName } from "@/lib/auth/name";
import type { UserProfile } from "@/lib/auth/types";
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

  if (loading || !user) {
    return null;
  }

  const displayName = user.fullName.trim() || user.username;
  const greeting = `Hi ${getProfileFirstName(user)}`;

  return (
    <div className={`inline-flex min-w-0 items-center gap-2.5 ${className}`}>
      {showUsername ? (
        <Link
          aria-label={`${greeting} profile`}
          className="max-w-[9rem] truncate text-xs font-bold normal-case tracking-[0.02em] text-zinc-200 transition hover:text-white"
          href={href}
        >
          {greeting}
        </Link>
      ) : null}
      <ProfileAvatarButton
        accent="red"
        displayName={displayName}
        onSave={savePortrait}
        portraitImage={portraitImage}
        showCameraHint={false}
        size="sm"
      />
    </div>
  );
}
