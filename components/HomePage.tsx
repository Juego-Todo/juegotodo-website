import { ChampionsSection } from "@/components/ChampionsSection";
import { CompetitionStructureSection } from "@/components/CompetitionStructureSection";
import { HeritageSection } from "@/components/HeritageSection";
import { HeroSection } from "@/components/HeroSection";
import { LatayanologySection } from "@/components/LatayanologySection";
import { LeagueStatsSection } from "@/components/LeagueStatsSection";
import { MotionSection } from "@/components/MotionSection";
import { PremiumDivider } from "@/components/PremiumDivider";
import { VideoCarousel } from "@/components/VideoCarousel";

export function HomePage() {
  return (
    <main className="overflow-hidden">
      <HeroSection />

      <MotionSection>
        <VideoCarousel />
      </MotionSection>

      <ChampionsSection />

      <PremiumDivider />
      <HeritageSection />
      <LatayanologySection />
      <LeagueStatsSection />
      <CompetitionStructureSection />
    </main>
  );
}
