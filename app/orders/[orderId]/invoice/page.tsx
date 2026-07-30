import type { Metadata } from "next";
import { OrderInvoicePage } from "@/components/commerce/OrderInvoicePage";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ orderId: string }>;
};

export const metadata: Metadata = buildPageMetadata({
  title: "Order Invoice",
  description: "Juego Todo order invoice.",
  path: "/orders",
  noIndex: true,
});

export default async function OrderInvoiceRoute({ params }: PageProps) {
  const { orderId } = await params;
  return <OrderInvoicePage orderId={orderId} />;
}
