import { Suspense } from "react";
import { OrdersPage } from "@/components/commerce/OrdersPage";

export default function OrdersRoute() {
  return (
    <Suspense>
      <OrdersPage />
    </Suspense>
  );
}
