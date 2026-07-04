"use client";

import { useCallback, useMemo, useRef, useSyncExternalStore } from "react";

function getRemaining(target: string) {
  const difference = Math.max(new Date(target).getTime() - Date.now(), 0);
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

const emptyRemaining = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
};

function subscribeToCountdown(onStoreChange: () => void) {
  const timer = window.setInterval(onStoreChange, 1000);
  return () => window.clearInterval(timer);
}

function remainingEqual(
  a: ReturnType<typeof getRemaining>,
  b: ReturnType<typeof getRemaining>,
) {
  return a.days === b.days && a.hours === b.hours && a.minutes === b.minutes && a.seconds === b.seconds;
}

export function CountdownTimer({ target }: { target: string }) {
  const snapshotRef = useRef(emptyRemaining);

  const getSnapshot = useCallback(() => {
    const next = getRemaining(target);
    if (remainingEqual(snapshotRef.current, next)) {
      return snapshotRef.current;
    }
    snapshotRef.current = next;
    return next;
  }, [target]);

  const remaining = useSyncExternalStore(
    subscribeToCountdown,
    getSnapshot,
    () => emptyRemaining,
  );
  const entries = useMemo<[string, number | null][]>(
    () => Object.entries(remaining),
    [remaining],
  );

  return (
    <div className="grid grid-cols-4 gap-2" aria-label="Event countdown">
      {entries.map(([label, value]) => (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-3 text-center" key={label}>
          <div className="font-display text-2xl text-white sm:text-3xl">
            {typeof value === "number" ? String(value).padStart(2, "0") : "--"}
          </div>
          <div className="text-[0.58rem] font-black uppercase tracking-[0.2em] text-red-300 sm:text-[0.62rem] sm:tracking-[0.24em]">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
