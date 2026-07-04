import { Star } from "lucide-react";

type ProductStarRatingProps = {
  rating: number;
  size?: number;
  className?: string;
};

export function ProductStarRating({ rating, size = 13, className = "" }: ProductStarRatingProps) {
  const clamped = Math.max(0, Math.min(5, rating));

  return (
    <div
      aria-label={`Rated ${clamped.toFixed(1)} out of 5 stars`}
      className={`flex items-center gap-0.5 ${className}`}
      role="img"
    >
      {Array.from({ length: 5 }).map((_, index) => {
        const fill = Math.max(0, Math.min(1, clamped - index));
        const filled = fill >= 1;
        const partial = fill > 0 && fill < 1;

        return (
          <span className="relative inline-flex" key={index}>
            <Star className="text-zinc-700" fill="none" size={size} aria-hidden />
            {filled || partial ? (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: partial ? `${fill * 100}%` : "100%" }}
              >
                <Star className="fill-amber-300 text-amber-300" size={size} aria-hidden />
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}
