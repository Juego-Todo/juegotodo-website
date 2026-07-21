import { Ticket } from "lucide-react";
import { EventCardBackdrop } from "@/components/EventCardBackdrop";
import type { ShopProduct } from "@/data/shop";
import { getProductFrameClassName, type ProductImageSize } from "@/lib/commerce/product-image-layout";

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
  const ticket = product.eventTicket;
  if (!ticket) {
    return null;
  }

  const compact = size === "sm" || size === "md";

  return (
    <EventCardBackdrop
      className={`${getProductFrameClassName(size)} ${className}`}
      imageClassName="object-cover object-[center_20%]"
      imageSrc={product.imageSrc ?? undefined}
      sizes={size === "hero" ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
    >
      <div
        className={`flex h-full min-h-full flex-col justify-between ${compact ? "p-3" : "p-4 sm:p-5"}`}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="rounded-full border border-white/15 bg-black/55 px-2.5 py-1 text-[0.52rem] font-black uppercase tracking-[0.2em] text-zinc-200 backdrop-blur-sm sm:text-[0.58rem]">
            Featured Event
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-[#FF1010]/35 bg-black/60 px-2 py-1 text-[0.52rem] font-black uppercase tracking-[0.12em] text-[#FF1010] backdrop-blur-sm">
            <Ticket size={10} aria-hidden />
            Digital
          </span>
        </div>

        <div className="mt-auto">
          <p className="text-[0.58rem] font-bold uppercase tracking-[0.2em] text-red-100/85 sm:text-[0.65rem]">
            {ticket.series}
          </p>
          <p
            className={`font-display mt-1.5 uppercase leading-[0.92] text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.85)] ${
              compact ? "text-2xl" : "text-[1.85rem] sm:text-[2.15rem]"
            }`}
          >
            {ticket.title}
          </p>
          <div
            className={`mt-2 space-y-0.5 text-zinc-200 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] ${compact ? "text-[0.62rem]" : "text-xs sm:text-sm"}`}
          >
            <p className="font-semibold">{ticket.dateLabel}</p>
            <p>{ticket.timeLabel} · Venue {ticket.venue}</p>
          </div>
        </div>
      </div>
    </EventCardBackdrop>
  );
}
