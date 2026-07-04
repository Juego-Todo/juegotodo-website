import Image from "next/image";
import { ProductDisplayImage } from "@/components/commerce/ProductDisplayImage";
import type { ShopProduct } from "@/data/shop";
import { getSelectedVariantImage } from "@/lib/commerce/product-options";

type CartItemPhotoProps = {
  product: ShopProduct;
  variantSelections?: Record<string, string>;
  className?: string;
  sizes?: string;
};

export function CartItemPhoto({
  product,
  variantSelections,
  className = "h-20 w-20",
  sizes = "80px",
}: CartItemPhotoProps) {
  const imageSrc = getSelectedVariantImage(product, variantSelections ?? {}) ?? product.imageSrc;

  if (!imageSrc) {
    return (
      <div className={`relative shrink-0 overflow-hidden rounded-xl border border-white/10 ${className}`}>
        <ProductDisplayImage alt={product.name} className="h-full w-full rounded-none" product={product} size="sm" />
      </div>
    );
  }

  return (
    <div className={`relative shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a] ${className}`}>
      <Image alt={product.name} className="object-contain p-1.5" fill sizes={sizes} src={imageSrc} />
    </div>
  );
}
