import type { Metadata } from "next";
import { CheckoutReviewPage } from "@/components/commerce/CheckoutReviewPage";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Checkout — Review",
  description: "Review your Juego Todo order before placing it.",
  path: "/checkout/review",
  noIndex: true,
});

export default function CheckoutReviewRoute() {
  return <CheckoutReviewPage />;
}
