import Image from "next/image";
import type { MediaPartner } from "@/data/site";

type MediaPartnerLogoProps = {
  partner: MediaPartner;
  className?: string;
  compact?: boolean;
};

export function MediaPartnerLogo({ partner, className = "", compact = false }: MediaPartnerLogoProps) {
  return (
    <span
      className={`partner-wordmark inline-flex shrink-0 items-center justify-center px-5 sm:px-8 ${className}`}
    >
      <Image
        alt={partner.name}
        className={`w-auto object-contain opacity-90 brightness-110 ${
          compact ? "h-8 max-w-[8.5rem] sm:h-9 sm:max-w-[9.5rem]" : "h-9 max-w-[9.5rem] sm:h-11 sm:max-w-[11rem]"
        }`}
        height={44}
        src={partner.logoSrc}
        width={176}
      />
    </span>
  );
}
