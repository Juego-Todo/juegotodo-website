"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Camera, Loader2 } from "lucide-react";
import { useState } from "react";
import { useProfilePhotoUpload } from "@/lib/profile/use-profile-photo-upload";

function PortraitImage({
  portraitImage,
  displayName,
}: {
  portraitImage: string;
  displayName: string;
}) {
  if (portraitImage.startsWith("data:")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={`${displayName} promotional portrait`}
        className="h-full w-full object-contain object-bottom drop-shadow-[0_30px_60px_rgba(0,0,0,0.65)]"
        src={portraitImage}
      />
    );
  }

  return (
    <Image
      alt={`${displayName} promotional portrait`}
      className="object-contain object-bottom drop-shadow-[0_30px_60px_rgba(0,0,0,0.65)]"
      fill
      priority
      sizes="(max-width: 1280px) 50vw, 420px"
      src={portraitImage}
    />
  );
}

export function FighterPromoPortrait({
  portraitImage,
  displayName,
  size = "hero",
  onUpload,
  allowUpload = false,
}: {
  portraitImage?: string;
  displayName: string;
  size?: "hero" | "mobile";
  onUpload?: (dataUrl: string) => Promise<void> | void;
  allowUpload?: boolean;
}) {
  const { cropModal, uploading, error, openFilePicker } = useProfilePhotoUpload(onUpload ?? (async () => {}));
  const [hovering, setHovering] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-100, 100], [4, -4]), { stiffness: 160, damping: 22 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-5, 5]), { stiffness: 160, damping: 22 });
  const glow = useSpring(hovering ? 1 : 0.35, { stiffness: 120, damping: 18 });
  const heightClass = size === "hero" ? "min-h-[28rem] sm:min-h-[34rem] xl:min-h-[38rem]" : "min-h-[18rem]";
  const showUpload = allowUpload && onUpload;

  return (
    <motion.div
      className={`group relative mx-auto w-full max-w-[22rem] xl:max-w-none ${heightClass}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => {
        setHovering(false);
        x.set(0);
        y.set(0);
      }}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        x.set(event.clientX - rect.left - rect.width / 2);
        y.set(event.clientY - rect.top - rect.height / 2);
      }}
      style={{ rotateX, rotateY, transformPerspective: 1400 }}
    >
      {cropModal}

      <motion.div
        animate={{ opacity: hovering ? 1 : 0.55 }}
        className="pointer-events-none absolute -inset-8 bg-[radial-gradient(circle,rgba(255,16,16,0.42),transparent_68%)] blur-3xl"
        style={{ scale: glow }}
      />

      <div className="relative h-full w-full">
        {portraitImage ? (
          <>
            <PortraitImage displayName={displayName} portraitImage={portraitImage} />
            {showUpload ? (
              <button
                className="absolute bottom-8 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-black/70 px-4 py-2 text-[0.58rem] font-black uppercase tracking-[0.14em] text-white opacity-0 transition hover:border-red-500/40 group-hover:opacity-100"
                disabled={uploading}
                onClick={openFilePicker}
                type="button"
              >
                {uploading ? <Loader2 className="animate-spin" size={14} aria-hidden /> : <Camera size={14} aria-hidden />}
                Change Photo
              </button>
            ) : null}
          </>
        ) : showUpload ? (
          <button
            className="group relative flex h-full w-full flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/15 bg-[radial-gradient(circle_at_50%_0%,rgba(255,16,16,0.12),transparent_42%),linear-gradient(180deg,#121214_0%,#050506_55%,#000_100%)] transition hover:border-red-500/35 hover:bg-red-500/5"
            disabled={uploading}
            onClick={openFilePicker}
            type="button"
          >
            {uploading ? (
              <Loader2 className="animate-spin text-red-200" size={36} aria-hidden />
            ) : (
              <Camera className="text-red-200" size={36} aria-hidden />
            )}
            <p className="mt-5 text-sm font-black uppercase tracking-[0.16em] text-white">Add Fighter Photo</p>
            <p className="mt-2 max-w-[14rem] text-center text-xs text-zinc-400">
              Waist-up PNG or JPG. This becomes your profile portrait.
            </p>
          </button>
        ) : (
          <svg
            aria-label={`${displayName} fighter render`}
            className="h-full w-full drop-shadow-[0_30px_60px_rgba(0,0,0,0.65)]"
            viewBox="0 0 400 520"
          >
            <defs>
              <linearGradient id="skin" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#3f3f46" />
                <stop offset="100%" stopColor="#18181b" />
              </linearGradient>
              <linearGradient id="rim" x1="100%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#FF1010" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#FF1010" stopOpacity="0" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur result="blur" stdDeviation="8" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <ellipse cx="200" cy="500" fill="rgba(0,0,0,0.55)" rx="120" ry="18" />
            <path
              d="M200 88c-34 0-58 24-58 58 0 28 12 46 24 58-18 8-34 28-38 52-6 36 8 78 8 118h132c0-40 14-82 8-118-4-24-20-44-38-52 12-12 24-30 24-58 0-34-24-58-58-58z"
              fill="url(#skin)"
            />
            <path
              d="M148 118c8-18 24-28 52-28s44 10 52 28c-14 6-28 10-52 10s-38-4-52-10z"
              fill="#27272a"
            />
            <path d="M132 168c-8 36-6 72 10 108 24-8 58-8 116 0 16-36 18-72 10-108-18 10-38 16-68 16s-50-6-68-16z" fill="#1c1c1f" />
            <path d="M118 276c-18 34-28 88-28 132h48c8-42 6-88-8-132-4 0-8 0-12 0z" fill="#141416" />
            <path d="M282 276c18 34 28 88 28 132h-48c-8-42-6-88 8-132 4 0 8 0 12 0z" fill="#141416" />
            <path d="M156 276h88c10 38 12 82 4 132H152c-8-50-6-94 4-132z" fill="#0a0a0b" />
            <rect fill="url(#rim)" height="520" opacity="0.45" width="40" x="360" y="0" />
            <circle cx="200" cy="118" fill="#FF1010" filter="url(#glow)" opacity={hovering ? 0.35 : 0.15} r="90" />
          </svg>
        )}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#FF1010]/20 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </div>

      {error ? <p className="mt-3 text-center text-xs text-red-300">{error}</p> : null}
    </motion.div>
  );
}
