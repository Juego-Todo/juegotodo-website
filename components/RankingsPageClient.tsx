"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { MotionSection } from "@/components/MotionSection";
import { RankingsFull } from "@/components/RankingsSystem";
import { RankingsHub } from "@/components/RankingsHub";

export function RankingsPageClient() {
  const searchParams = useSearchParams();
  const division = searchParams.get("division");

  useEffect(() => {
    if (!division) {
      return;
    }

    const timer = window.setTimeout(() => {
      const target = document.getElementById(division);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [division]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.location.hash) {
      return;
    }

    const timer = window.setTimeout(() => {
      const target = document.querySelector(window.location.hash);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <RankingsHub />
      <MotionSection className="mx-auto max-w-7xl pb-14 sm:pb-20">
        <RankingsFull />
      </MotionSection>
    </>
  );
}
