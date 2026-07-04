import type { ShopProduct } from "@/data/shop";
import { formatCurrency } from "@/lib/commerce/pricing";
import { getProductCardSocialProof, getProductMemberPricing } from "@/lib/commerce/product-card";
import { Check } from "lucide-react";
import { AddToCartButton } from "@/components/commerce/AddToCartButton";
import { ProductStarRating } from "@/components/commerce/ProductStarRating";

type EventTicketCardBodyProps = {
  product: ShopProduct;
};

export function EventTicketCardBody({ product }: EventTicketCardBodyProps) {
  const ticket = product.eventTicket;
  const { rating, soldThisMonth } = getProductCardSocialProof(product);
  const { memberPrice, savings } = getProductMemberPricing(product);
  const benefits = product.features.slice(0, 3);

  if (!ticket) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col p-3 sm:p-4">
      <div className="min-w-0 flex-1">
        <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-[#FF1010]">Digital Ticket</p>
        <h3 className="font-display mt-1 text-[1.35rem] uppercase leading-[0.92] text-white sm:text-[1.5rem]">
          General Admission
        </h3>

        <div className="mt-2.5">
          <p className="font-display text-[1.75rem] leading-none text-white">{formatCurrency(product.priceAmount)}</p>
          {savings > 0 ? (
            <p className="mt-1 text-[0.62rem] text-zinc-400">
              JT Members{" "}
              <span className="font-semibold text-emerald-300">{formatCurrency(memberPrice)}</span>
              <span className="text-zinc-500"> · Save {formatCurrency(savings)}</span>
            </p>
          ) : null}
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <ProductStarRating rating={rating} size={12} />
          <span className="text-[0.58rem] text-zinc-400">
            {rating.toFixed(1)} · {soldThisMonth} sold this month
          </span>
        </div>

        <ul className="mt-3 space-y-1.5 border-t border-white/8 pt-3">
          {benefits.map((benefit) => (
            <li className="flex items-start gap-1.5 text-[0.68rem] leading-5 text-zinc-400" key={benefit}>
              <Check className="mt-0.5 shrink-0 text-emerald-400/90" size={11} aria-hidden />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
        <AddToCartButton compact fullWidth product={product} />
      </div>
    </div>
  );
}
