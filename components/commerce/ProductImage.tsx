import Image from "next/image";
import { productCatalogAspectClass } from "@/lib/commerce/product-image-layout";

type ProductImageProps = {
  alt: string;
  className?: string;
  priority?: boolean;
  src: string;
  stage?: "default" | "catalog" | "hero";
};

export function ProductImage({
  alt,
  className = "",
  priority = false,
  src,
  stage = "default",
}: ProductImageProps) {
  const isCatalog = stage === "catalog";
  const isHero = stage === "hero";

  return (
    <div
      className={`relative overflow-hidden ${
        isCatalog || isHero ? `${productCatalogAspectClass} bg-[#0a0a0a]` : "bg-[#080808]"
      } ${className}`}
    >
      <div
        className={`absolute inset-0 ${
          isCatalog || isHero
            ? "bg-[radial-gradient(circle_at_50%_38%,rgba(45,45,45,0.55),rgba(8,8,8,0.95)_68%)]"
            : "bg-[radial-gradient(circle_at_50%_35%,rgba(35,35,35,0.4),transparent_62%)]"
        }`}
        aria-hidden
      />
      {isCatalog || isHero ? (
        <div
          className="absolute inset-x-[12%] bottom-[8%] h-8 rounded-[100%] bg-black/60 blur-2xl"
          aria-hidden
        />
      ) : null}
      <Image
        alt={alt}
        className={`relative z-[1] h-full w-full object-contain ${
          isCatalog || isHero
            ? "p-4 sm:p-5 drop-shadow-[0_28px_48px_rgba(0,0,0,0.55)]"
            : "p-3 sm:p-4"
        }`}
        fill
        priority={priority}
        sizes={
          isCatalog
            ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            : isHero
              ? "(max-width: 768px) 100vw, 50vw"
              : "(max-width: 768px) 100vw, 50vw"
        }
        src={src}
      />
      {isCatalog || isHero ? (
        <>
          <div
            className="pointer-events-none absolute inset-0 z-[2] shadow-[inset_0_0_80px_rgba(0,0,0,0.72)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-16 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent"
            aria-hidden
          />
        </>
      ) : null}
    </div>
  );
}
