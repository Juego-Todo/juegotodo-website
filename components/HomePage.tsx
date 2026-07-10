import { AsSeenOnCarousel } from "@/components/AsSeenOnCarousel";
import { ChampionsSection } from "@/components/ChampionsSection";
import { CompetitionStructureSection } from "@/components/CompetitionStructureSection";
import { HeritageSection } from "@/components/HeritageSection";
import { HeroSection } from "@/components/HeroSection";
import {
  SignatureSystemSection,
} from "@/components/HomepageExperienceSections";
import { MotionSection } from "@/components/MotionSection";
import { PremiumDivider } from "@/components/PremiumDivider";
import { VideoCarousel } from "@/components/VideoCarousel";

export function HomePage() {
  return (
    <main>
      <HeroSection />

      <AsSeenOnCarousel />

      <SignatureSystemSection />

      <MotionSection>
        <VideoCarousel />
      </MotionSection>

      <ChampionsSection />

      <PremiumDivider />
      <HeritageSection />
      <CompetitionStructureSection />
    </main>
  );
}
