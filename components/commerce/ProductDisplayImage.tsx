import { ProductVisual } from "@/components/commerce/ProductVisual";
import type { ShopProduct } from "@/data/shop";
import { getProductImageKey } from "@/lib/commerce/product-visuals";
import { ProductImage } from "@/components/commerce/ProductImage";

type ProductDisplayImageProps = {
  alt: string;
  className?: string;
  imageSrc?: string;
  imageKey?: ReturnType<typeof getProductImageKey>;
  priority?: boolean;
  product?: ShopProduct;
  size?: "sm" | "md" | "lg" | "hero";
};

export function ProductDisplayImage({
  alt,
  className = "",
  imageSrc,
  imageKey,
  priority = false,
  product,
  size = "md",
}: ProductDisplayImageProps) {
  const resolvedImageSrc = imageSrc ?? product?.imageSrc;
  const resolvedImageKey = imageKey ?? (product ? getProductImageKey(product) : "gear");

  if (resolvedImageSrc) {
    return (
      <ProductImage
        alt={alt}
        className={`${size === "hero" ? "min-h-[28rem] sm:min-h-[34rem] lg:min-h-[40rem]" : size === "lg" ? "min-h-[16rem]" : size === "sm" ? "min-h-[8rem]" : "min-h-[12rem]"} ${className}`}
        priority={priority}
        src={resolvedImageSrc}
      />
    );
  }

  return (
    <ProductVisual
      className={className}
      imageKey={resolvedImageKey}
      photographic
      size={size}
    />
  );
}
