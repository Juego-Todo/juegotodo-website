import Image from "next/image";
import type { MediaPartner } from "@/data/site";

type MediaPartnerLogoProps = {
  partner: MediaPartner;
  className?: string;
  compact?: boolean;
  variant?: "default" | "as-seen-on";
};

export function MediaPartnerLogo({
  partner,
  className = "",
  compact = false,
  variant = "default",
}: MediaPartnerLogoProps) {
  const isAsSeenOn = variant === "as-seen-on";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center px-5 sm:px-8 ${
        isAsSeenOn ? "as-seen-on-wordmark" : "partner-wordmark"
      } ${className}`}
    >
      <Image
        alt={partner.name}
        className={`w-auto object-contain ${
          compact
            ? "h-8 max-w-[8.5rem] sm:h-9 sm:max-w-[9.5rem]"
            : "h-9 max-w-[9.5rem] sm:h-11 sm:max-w-[11rem]"
        } ${isAsSeenOn ? "opacity-80 brightness-125 contrast-110" : "opacity-90 brightness-110"}`}
        height={44}
        src={partner.logoSrc}
        width={176}
      />
    </span>
  );
}
