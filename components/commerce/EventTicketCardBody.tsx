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
    <div className="flex flex-1 flex-col p-2.5 sm:p-3">
      <div className="min-w-0 flex-1">
        <p className="text-[0.5rem] font-black uppercase tracking-[0.14em] text-[#FF1010] sm:text-[0.52rem]">Digital Ticket</p>
        <h3 className="font-display mt-0.5 line-clamp-2 text-[1rem] uppercase leading-[0.95] text-white sm:text-[1.15rem]">
          General Admission
        </h3>

        <div className="mt-1.5">
          <p className="font-display text-[1.2rem] leading-none text-white sm:text-[1.35rem]">{formatCurrency(product.priceAmount)}</p>
          {savings > 0 ? (
            <p className="mt-0.5 text-[0.52rem] text-zinc-400 sm:text-[0.56rem]">
              JT Members{" "}
              <span className="font-semibold text-emerald-300">{formatCurrency(memberPrice)}</span>
              <span className="text-zinc-500"> · Save {formatCurrency(savings)}</span>
            </p>
          ) : null}
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <ProductStarRating rating={rating} size={10} />
          <span className="text-[0.5rem] text-zinc-400 sm:text-[0.52rem]">
            {rating.toFixed(1)} · {soldThisMonth} sold
          </span>
        </div>

        <ul className="mt-2 hidden space-y-1 border-t border-white/8 pt-2 sm:block">
          {benefits.map((benefit) => (
            <li className="flex items-start gap-1 text-[0.58rem] leading-4 text-zinc-400 sm:text-[0.62rem]" key={benefit}>
              <Check className="mt-0.5 shrink-0 text-emerald-400/90" size={10} aria-hidden />
              <span className="line-clamp-1">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-2" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
        <AddToCartButton fullWidth micro product={product} />
      </div>
    </div>
  );
}
