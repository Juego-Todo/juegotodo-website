import type { Metadata } from "next";
import { CheckoutShippingPage } from "@/components/commerce/CheckoutShippingPage";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Checkout — Shipping",
  description: "Enter your shipping details to continue Juego Todo checkout.",
  path: "/checkout/shipping",
  noIndex: true,
});

export default function CheckoutShippingRoute() {
  return <CheckoutShippingPage />;
}
