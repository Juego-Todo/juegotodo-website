import type { ShopProduct } from "@/data/shop";
import { formatCurrency } from "@/lib/commerce/pricing";
import { getProductCardSocialProof, getProductMemberPricing } from "@/lib/commerce/product-card";
import { AddToCartButton } from "@/components/commerce/AddToCartButton";
import { ProductStarRating } from "@/components/commerce/ProductStarRating";

type EventTicketCardBodyProps = {
  product: ShopProduct;
};

export function EventTicketCardBody({ product }: EventTicketCardBodyProps) {
  const ticket = product.eventTicket;
  const { rating, soldThisMonth } = getProductCardSocialProof(product);
  const { memberPrice, savings } = getProductMemberPricing(product);

  if (!ticket) {
    return null;
  }

  return (
    <>
      {/* Mobile: basic card */}
      <div className="flex flex-1 flex-col gap-1 p-2 sm:hidden">
        <h3 className="line-clamp-2 text-[0.78rem] font-semibold leading-snug text-zinc-100">
          {ticket.title || "General Admission"}
        </h3>
        <p className="text-[0.95rem] font-bold leading-none text-[#FF1010]">
          {formatCurrency(product.priceAmount)}
        </p>
        <p className="text-[0.58rem] leading-4 text-zinc-500">
          {rating.toFixed(1)} ★ · {soldThisMonth} sold
        </p>
      </div>

      {/* Desktop: richer card */}
      <div className="hidden flex-1 flex-col p-3 sm:flex">
        <div className="min-w-0 flex-1">
          <p className="text-[0.52rem] font-black uppercase tracking-[0.14em] text-[#FF1010]">Digital Ticket</p>
          <h3 className="font-display mt-0.5 line-clamp-2 text-[1.15rem] uppercase leading-[0.95] text-white">
            General Admission
          </h3>

          <div className="mt-1.5">
            <p className="font-display text-[1.35rem] leading-none text-white">
              {formatCurrency(product.priceAmount)}
            </p>
            {savings > 0 ? (
              <p className="mt-0.5 text-[0.56rem] text-zinc-400">
                JT Members{" "}
                <span className="font-semibold text-emerald-300">{formatCurrency(memberPrice)}</span>
                <span className="text-zinc-500"> · Save {formatCurrency(savings)}</span>
              </p>
            ) : null}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
            <ProductStarRating rating={rating} size={10} />
            <span className="text-[0.52rem] text-zinc-400">
              {rating.toFixed(1)} · {soldThisMonth} sold
            </span>
          </div>
        </div>

        <div
          className="mt-2"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <AddToCartButton compact fullWidth product={product} />
        </div>
      </div>
    </>
  );
}
