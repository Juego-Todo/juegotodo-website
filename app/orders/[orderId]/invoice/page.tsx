import { OrderInvoicePage } from "@/components/commerce/OrderInvoicePage";

type PageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function OrderInvoiceRoute({ params }: PageProps) {
  const { orderId } = await params;
  return <OrderInvoicePage orderId={orderId} />;
}
