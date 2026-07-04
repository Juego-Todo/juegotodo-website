"use client";

import { useMemo } from "react";

type Particle = {
  id: number;
  left: string;
  top: string;
  size: number;
  delay: number;
  duration: number;
};

function seededUnit(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

export function EnergyParticles({ count = 24 }: { count?: number }) {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: count }, (_, id) => ({
        id,
        left: `${(seededUnit(id * 5 + 1) * 100).toFixed(2)}%`,
        top: `${(seededUnit(id * 5 + 2) * 100).toFixed(2)}%`,
        size: Number((2 + seededUnit(id * 5 + 3) * 3).toFixed(2)),
        delay: Number((seededUnit(id * 5 + 4) * 8).toFixed(2)),
        duration: Number((6 + seededUnit(id * 5 + 5) * 8).toFixed(2)),
      })),
    [count],
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <span
          className="energy-particle absolute rounded-full bg-[#FF1010]"
          key={particle.id}
          style={{
            left: particle.left,
            top: particle.top,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
