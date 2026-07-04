import { EventTicketProductImage } from "@/components/commerce/EventTicketProductImage";
import { ProductVisual } from "@/components/commerce/ProductVisual";
import { ProductImage } from "@/components/commerce/ProductImage";
import type { ShopProduct } from "@/data/shop";
import { getProductFrameClassName, type ProductImageSize, type ProductImageVariant } from "@/lib/commerce/product-image-layout";
import { getProductImageKey } from "@/lib/commerce/product-visuals";

type ProductDisplayImageProps = {
  alt: string;
  className?: string;
  imageSrc?: string;
  imageKey?: ReturnType<typeof getProductImageKey>;
  priority?: boolean;
  product?: ShopProduct;
  size?: ProductImageSize;
  stage?: "default" | "catalog" | "hero";
  variant?: ProductImageVariant;
};

export function ProductDisplayImage({
  alt,
  className = "",
  imageSrc,
  imageKey,
  priority = false,
  product,
  size = "md",
  stage = "default",
  variant = "card",
}: ProductDisplayImageProps) {
  const resolvedImageSrc = imageSrc ?? product?.imageSrc;
  const resolvedImageKey = imageKey ?? (product ? getProductImageKey(product) : "gear");
  const resolvedStage = stage === "default" && size === "hero" ? "hero" : stage === "default" ? "catalog" : stage;
  const resolvedVariant = variant === "card" && size === "hero" ? "hero" : variant;
  const frameClass = getProductFrameClassName(size, resolvedVariant);

  if (product?.eventTicket) {
    return <EventTicketProductImage className={className} product={product} size={size} />;
  }

  if (resolvedImageSrc) {
    return (
      <ProductImage
        alt={alt}
        className={`${frameClass} ${className}`}
        priority={priority}
        src={resolvedImageSrc}
        stage={resolvedStage}
      />
    );
  }

  return (
    <ProductVisual
      className={`${frameClass} ${className}`}
      imageKey={resolvedImageKey}
      photographic
      size={size}
    />
  );
}
