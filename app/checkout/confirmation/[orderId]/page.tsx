import { OrderConfirmationPage } from "@/components/commerce/OrderConfirmationPage";

type PageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function OrderConfirmationRoute({ params }: PageProps) {
  const { orderId } = await params;
  return <OrderConfirmationPage orderId={orderId} />;
}
