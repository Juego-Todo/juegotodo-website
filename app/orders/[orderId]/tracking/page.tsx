import { OrderTrackingPage } from "@/components/commerce/OrderTrackingPage";

type PageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function OrderTrackingRoute({ params }: PageProps) {
  const { orderId } = await params;
  return <OrderTrackingPage orderId={orderId} />;
}
