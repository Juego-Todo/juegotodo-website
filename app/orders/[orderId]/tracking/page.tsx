import type { Metadata } from "next";
import { OrderTrackingPage } from "@/components/commerce/OrderTrackingPage";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ orderId: string }>;
};

export const metadata: Metadata = buildPageMetadata({
  title: "Order Tracking",
  description: "Track your Juego Todo order shipment.",
  path: "/orders",
  noIndex: true,
});

export default async function OrderTrackingRoute({ params }: PageProps) {
  const { orderId } = await params;
  return <OrderTrackingPage orderId={orderId} />;
}
