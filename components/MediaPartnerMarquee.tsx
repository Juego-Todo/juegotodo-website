import { MediaPartnerLogo } from "@/components/MediaPartnerLogo";
import { mediaPartners } from "@/data/site";
import { buildSeamlessMarqueeLoop } from "@/lib/marquee";

export function MediaPartnerMarquee({ className = "" }: { className?: string }) {
  const marqueePartners = buildSeamlessMarqueeLoop(mediaPartners);

  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="media-marquee-track flex w-max items-center py-2">
        {marqueePartners.map((partner, index) => (
          <MediaPartnerLogo key={`${partner.name}-${index}`} partner={partner} />
        ))}
      </div>
    </div>
  );
}
