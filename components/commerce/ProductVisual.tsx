import type { ProductImageKey } from "@/lib/commerce/product-visuals";

type ProductVisualProps = {
  imageKey: ProductImageKey;
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
  championship?: boolean;
  photographic?: boolean;
};

export function ProductVisual({
  imageKey,
  size = "md",
  className = "",
  championship = false,
  photographic = false,
}: ProductVisualProps) {
  const height =
    size === "hero" ? "min-h-[22rem] sm:min-h-[28rem]" : size === "lg" ? "min-h-[16rem]" : size === "sm" ? "min-h-[8rem]" : "min-h-[12rem]";

  return (
    <div
      className={`relative overflow-hidden rounded-lg ${height} ${
        championship
          ? "bg-gradient-to-br from-zinc-950 via-black to-amber-950/40"
          : photographic
            ? "bg-gradient-to-b from-zinc-800 via-[#1a0a0c] to-[#080808]"
            : "bg-gradient-to-br from-zinc-900 via-[#120305] to-black"
      } ${className}`}
    >
      <div
        className={`absolute inset-0 ${
          photographic
            ? "bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.08),transparent_45%),radial-gradient(circle_at_50%_85%,rgba(255,16,16,0.18),transparent_38%)]"
            : "bg-[radial-gradient(circle_at_50%_18%,rgba(255,16,16,0.22),transparent_42%)]"
        }`}
        aria-hidden
      />
      {photographic ? (
        <div className="absolute bottom-[12%] left-1/2 h-8 w-[55%] -translate-x-1/2 rounded-[100%] bg-black/50 blur-xl" aria-hidden />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(0,0,0,0.85))]" aria-hidden />
      <div className={`relative flex h-full items-center justify-center ${photographic ? "p-4 sm:p-6" : "p-6"}`}>
        <ProductArt imageKey={imageKey} photographic={photographic} size={size} />
      </div>
      {championship ? (
        <div className="absolute right-4 top-4 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-[0.58rem] font-black uppercase tracking-[0.18em] text-amber-200">
          Championship
        </div>
      ) : null}
    </div>
  );
}

function ProductArt({
  imageKey,
  size,
  photographic = false,
}: {
  imageKey: ProductImageKey;
  size: ProductVisualProps["size"];
  photographic?: boolean;
}) {
  const scale =
    size === "hero"
      ? photographic
        ? "scale-[1.35]"
        : "scale-125"
      : size === "lg"
        ? photographic
          ? "scale-[1.2]"
          : "scale-110"
        : size === "sm"
          ? "scale-90"
          : photographic
            ? "scale-105"
            : "scale-100";

  switch (imageKey) {
    case "gloves":
      return (
        <div className={`flex gap-3 ${scale}`} aria-hidden>
          {[0, 1].map((index) => (
            <div
              className="h-28 w-20 rounded-2xl border border-red-500/30 bg-gradient-to-b from-zinc-700 to-zinc-950 shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
              key={index}
              style={{ transform: `rotate(${index === 0 ? -8 : 8}deg)` }}
            >
              <div className="mx-2 mt-3 h-10 rounded-xl bg-red-600/80" />
              <div className="mx-3 mt-4 h-2 rounded-full bg-zinc-600" />
            </div>
          ))}
        </div>
      );
    case "helmet":
      return (
        <div className={`h-32 w-36 rounded-[2.5rem] border-4 border-red-500/40 bg-gradient-to-b from-zinc-600 to-zinc-900 shadow-[0_24px_48px_rgba(0,0,0,0.55)] ${scale}`} aria-hidden>
          <div className="mx-auto mt-8 h-10 w-24 rounded-full bg-black/50" />
          <div className="mx-auto mt-4 h-3 w-20 rounded-full bg-[#FF1010]/70" />
        </div>
      );
    case "jersey":
      return (
        <div className={`relative h-36 w-32 ${scale}`} aria-hidden>
          <div className="absolute inset-x-3 top-0 h-8 rounded-t-3xl bg-zinc-700" />
          <div className="absolute inset-x-0 top-6 h-28 rounded-b-3xl border border-red-500/30 bg-gradient-to-b from-zinc-800 to-black">
            <div className="mx-auto mt-8 h-10 w-10 rounded-full bg-[#FF1010]/80" />
            <div className="mx-auto mt-3 h-2 w-16 rounded-full bg-white/20" />
          </div>
        </div>
      );
    case "sticks":
      return (
        <div className={`flex gap-4 ${scale}`} aria-hidden>
          {[0, 1].map((index) => (
            <div
              className="h-40 w-3 rounded-full bg-gradient-to-b from-amber-700 via-amber-900 to-amber-950 shadow-lg"
              key={index}
              style={{ transform: `rotate(${index === 0 ? -14 : 14}deg)` }}
            />
          ))}
        </div>
      );
    case "belt":
      return (
        <div className={`relative h-24 w-44 ${scale}`} aria-hidden>
          <div className="absolute inset-x-0 top-1/2 h-8 -translate-y-1/2 rounded-full bg-gradient-to-r from-amber-950 via-amber-800 to-amber-950" />
          <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-amber-400 bg-gradient-to-br from-amber-300 via-amber-600 to-amber-900 shadow-[0_0_30px_rgba(251,191,36,0.35)]" />
        </div>
      );
    case "digital":
      return (
        <div className={`h-28 w-40 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950 to-black p-4 ${scale}`} aria-hidden>
          <div className="h-2 w-16 rounded-full bg-cyan-400/60" />
          <div className="mt-4 space-y-2">
            <div className="h-2 w-full rounded-full bg-white/10" />
            <div className="h-2 w-4/5 rounded-full bg-white/10" />
            <div className="h-2 w-3/5 rounded-full bg-white/10" />
          </div>
        </div>
      );
    default:
      return (
        <div className={`h-28 w-28 rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800 to-black shadow-xl ${scale}`} aria-hidden>
          <div className="mx-auto mt-8 h-10 w-10 rounded-full bg-[#FF1010]/70" />
        </div>
      );
  }
}
