import { ChampionsSection } from "@/components/ChampionsSection";
import { CompetitionStructureSection } from "@/components/CompetitionStructureSection";
import { HeritageSection } from "@/components/HeritageSection";
import { HeroSection } from "@/components/HeroSection";
import {
  AuthorityProofSection,
  EcosystemUniverseSection,
  LuxuryBookingCtaSection,
  SignatureArenaMoment,
} from "@/components/HomepageExperienceSections";
import { LatayanologySection } from "@/components/LatayanologySection";
import { LeagueStatsSection } from "@/components/LeagueStatsSection";
import { MotionSection } from "@/components/MotionSection";
import { PremiumDivider } from "@/components/PremiumDivider";
import { VideoCarousel } from "@/components/VideoCarousel";

export function HomePage() {
  return (
    <main className="overflow-hidden">
      <HeroSection />
      <AuthorityProofSection />
      <SignatureArenaMoment />

      <MotionSection>
        <VideoCarousel />
      </MotionSection>

      <ChampionsSection />

      <PremiumDivider />
      <HeritageSection />
      <EcosystemUniverseSection />
      <LatayanologySection />
      <LeagueStatsSection />
      <CompetitionStructureSection />
      <LuxuryBookingCtaSection />
    </main>
  );
}
