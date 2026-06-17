import { EcosystemJourney } from "@/components/EcosystemJourney";
import { ChampionsSection } from "@/components/ChampionsSection";
import { EventCardsSection } from "@/components/EventCardsSection";
import { FighterDatabase } from "@/components/FighterDatabase";
import { HeritageSection } from "@/components/HeritageSection";
import { HeroSection } from "@/components/HeroSection";
import { LatayanologySection } from "@/components/LatayanologySection";
import { MotionSection } from "@/components/MotionSection";
import { RankingsPreview } from "@/components/RankingsSystem";
import { SponsorsSection } from "@/components/SponsorsSection";
import { StatsCounter } from "@/components/StatsCounter";
import { VideoCarousel } from "@/components/VideoCarousel";
import { stats } from "@/data/site";

export function HomePage() {
  return (
    <main className="overflow-hidden">
      <HeroSection />
      <ChampionsSection />

      <MotionSection className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-[#FF1010]">League Authority</p>
          <h2 className="font-display mt-3 text-5xl uppercase leading-none text-white sm:text-7xl">
            By The Numbers
          </h2>
        </div>
        <StatsCounter stats={stats} />
      </MotionSection>

      <LatayanologySection />

      <MotionSection className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <FighterDatabase />
      </MotionSection>

      <EcosystemJourney />

      <MotionSection className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <RankingsPreview />
      </MotionSection>

      <MotionSection>
        <EventCardsSection />
      </MotionSection>

      <MotionSection>
        <VideoCarousel />
      </MotionSection>

      <HeritageSection />
      <SponsorsSection />
    </main>
  );
}
