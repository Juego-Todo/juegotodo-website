export type ProductImageSize = "sm" | "md" | "lg" | "hero";
export type ProductImageVariant = "card" | "thumb" | "hero";

/** Standard catalog / product-card frame — keeps grid rows aligned */
export const productCatalogAspectClass = "aspect-[4/5] w-full";

/** Square frame for cart rows, toasts, and compact lists */
export const productThumbAspectClass = "aspect-square h-full w-full";

export function getProductFrameClassName(size: ProductImageSize, variant: ProductImageVariant = "card") {
  if (variant === "thumb") {
    return productThumbAspectClass;
  }

  if (variant === "hero" || size === "hero") {
    return "aspect-[4/5] w-full min-h-[24rem] sm:min-h-[30rem] lg:min-h-[36rem]";
  }

  return productCatalogAspectClass;
}
