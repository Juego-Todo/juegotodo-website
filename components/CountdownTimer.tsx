"use client";

import { useEffect, useMemo, useState } from "react";

function getRemaining(target: string) {
  const difference = Math.max(new Date(target).getTime() - Date.now(), 0);
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
  };
}

export function CountdownTimer({ target }: { target: string }) {
  const [remaining, setRemaining] = useState(() => getRemaining(target));
  const entries = useMemo(() => Object.entries(remaining), [remaining]);

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(getRemaining(target)), 60000);
    return () => window.clearInterval(timer);
  }, [target]);

  return (
    <div className="grid grid-cols-3 gap-2" aria-label="Event countdown">
      {entries.map(([label, value]) => (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-3 text-center" key={label}>
          <div className="font-display text-3xl text-white">{String(value).padStart(2, "0")}</div>
          <div className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-red-300">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
