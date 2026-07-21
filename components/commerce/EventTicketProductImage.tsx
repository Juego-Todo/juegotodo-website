import Image from "next/image";
import type { ShopProduct } from "@/data/shop";
import { getProductFrameClassName, type ProductImageSize } from "@/lib/commerce/product-image-layout";
import { EVENT_CARD_BACKGROUND } from "@/components/EventCardBackdrop";

type EventTicketProductImageProps = {
  product: ShopProduct;
  className?: string;
  size?: ProductImageSize;
};

export function EventTicketProductImage({
  product,
  className = "",
  size = "lg",
}: EventTicketProductImageProps) {
  if (!product.eventTicket) {
    return null;
  }

  const imageSrc = product.imageSrc ?? EVENT_CARD_BACKGROUND;

  return (
    <div className={`relative overflow-hidden bg-[#0a0a0a] ${getProductFrameClassName(size)} ${className}`}>
      <Image
        alt={product.name}
        className="object-cover object-center"
        fill
        sizes={size === "hero" ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
        src={imageSrc}
      />
    </div>
  );
}
