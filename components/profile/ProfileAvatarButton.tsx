"use client";

import { Camera, Loader2 } from "lucide-react";
import { buildInitials } from "@/lib/profile/image-crop";
import { useProfilePhotoUpload } from "@/lib/profile/use-profile-photo-upload";

const sizeClasses = {
  sm: "h-8 w-8 text-[0.62rem] border",
  md: "h-24 w-24 text-3xl border-4 sm:h-28 sm:w-28 sm:text-4xl",
  lg: "h-28 w-28 text-4xl border-4",
} as const;

const accentClasses = {
  amber:
    "border-amber-500/40 shadow-[0_0_32px_rgba(245,158,11,0.18)] hover:border-amber-300/60 bg-[radial-gradient(circle_at_35%_18%,rgba(245,158,11,0.35),transparent_38%),linear-gradient(145deg,#27272a,#050505)]",
  red: "border-white/20 shadow-[0_0_16px_rgba(255,255,255,0.06)] hover:border-red-500/40 bg-[radial-gradient(circle_at_35%_18%,rgba(255,16,16,0.22),transparent_42%),linear-gradient(145deg,#27272a,#050505)]",
} as const;

type ProfileAvatarButtonProps = {
  displayName: string;
  portraitImage?: string;
  onSave?: (dataUrl: string) => Promise<void> | void;
  size?: keyof typeof sizeClasses;
  accent?: keyof typeof accentClasses;
  className?: string;
  showCameraHint?: boolean;
};

export function ProfileAvatarButton({
  displayName,
  portraitImage,
  onSave,
  size = "md",
  accent = "red",
  className = "",
  showCameraHint = true,
}: ProfileAvatarButtonProps) {
  const initials = buildInitials(displayName) || displayName.slice(0, 2).toUpperCase();
  const { cropModal, uploading, error, openFilePicker } = useProfilePhotoUpload(onSave ?? (async () => {}));

  const avatarBody = portraitImage ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={`${displayName} profile photo`} className="h-full w-full object-cover object-top" src={portraitImage} />
  ) : (
    <div
      className={`flex h-full w-full items-center justify-center font-display text-white ${accentClasses[accent]}`}
    >
      {initials}
    </div>
  );

  if (!onSave) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-full bg-black/50 ${sizeClasses[size]} ${accentClasses[accent]} ${className}`}
      >
        {avatarBody}
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        aria-label={portraitImage ? "Change profile photo" : "Upload profile photo"}
        className={`group relative shrink-0 overflow-hidden rounded-full bg-black/50 transition ${sizeClasses[size]} ${accentClasses[accent]}`}
        disabled={uploading}
        onClick={openFilePicker}
        type="button"
      >
        {avatarBody}
        {showCameraHint && size !== "sm" ? (
          <span className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
            {uploading ? (
              <Loader2 className="animate-spin text-white" size={size === "lg" ? 22 : 18} aria-hidden />
            ) : (
              <Camera className="text-white" size={size === "lg" ? 22 : 18} aria-hidden />
            )}
          </span>
        ) : null}
        {uploading && size === "sm" ? (
          <span className="absolute inset-0 flex items-center justify-center bg-black/55">
            <Loader2 className="animate-spin text-white" size={12} aria-hidden />
          </span>
        ) : null}
      </button>
      {cropModal}
      {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
