import type { Metadata } from "next";
import { OrderConfirmationPage } from "@/components/commerce/OrderConfirmationPage";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ orderId: string }>;
};

export const metadata: Metadata = buildPageMetadata({
  title: "Order Confirmation",
  description: "Your Juego Todo order confirmation and payment status.",
  path: "/checkout/confirmation",
  noIndex: true,
});

export default async function OrderConfirmationRoute({ params }: PageProps) {
  const { orderId } = await params;
  return <OrderConfirmationPage orderId={orderId} />;
}
