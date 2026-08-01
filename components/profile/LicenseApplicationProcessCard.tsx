"use client";

import { Clock3, PhilippinePeso } from "lucide-react";
import type { LicenseProgramPresetKey } from "@/data/license-program-presets";
import { getLicenseProcessMeta } from "@/lib/profile/license-process";

export function LicenseApplicationProcessCard({
  presetKey,
  compact = false,
}: {
  presetKey: LicenseProgramPresetKey;
  compact?: boolean;
}) {
  const process = getLicenseProcessMeta(presetKey);

  return (
    <section className="rounded-[1.75rem] border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6">
      <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">How licensing works</h2>
      <p className="mt-1.5 text-sm leading-6 text-zinc-500">{process.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-zinc-300">
          <Clock3 size={13} aria-hidden />
          {process.durationLabel}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-zinc-300">
          <PhilippinePeso size={13} aria-hidden />
          {process.costLabel}
        </span>
      </div>

      {!compact ? (
        <ol className="mt-5 grid gap-2 sm:grid-cols-2">
          {process.steps.map((step, index) => (
            <li
              className="flex items-center gap-3 rounded-xl bg-black/25 px-3 py-2.5"
              key={step}
            >
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[0.65rem] font-semibold text-zinc-300">
                {index + 1}
              </span>
              <span className="text-sm text-zinc-200">{step}</span>
            </li>
          ))}
        </ol>
      ) : (
        <ol className="mt-5 flex flex-wrap gap-1.5">
          {process.steps.map((step, index) => (
            <li
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[0.7rem] text-zinc-400"
              key={step}
            >
              <span className="font-semibold text-zinc-500">{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      )}

      <p className="mt-4 text-xs leading-5 text-zinc-600">
        Fees are estimated annual dues and may be confirmed during review. Payment instructions are sent after approval.
      </p>
    </section>
  );
}
