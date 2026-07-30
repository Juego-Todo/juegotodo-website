import type { Metadata } from "next";
import { CheckoutPaymentPage } from "@/components/commerce/CheckoutPaymentPage";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Checkout — Payment",
  description: "Choose a payment method to complete your Juego Todo order.",
  path: "/checkout/payment",
  noIndex: true,
});

export default function CheckoutPaymentRoute() {
  return <CheckoutPaymentPage />;
}
