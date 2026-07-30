import type { Metadata } from "next";
import { Suspense } from "react";
import { OrdersPage } from "@/components/commerce/OrdersPage";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Your Orders",
  description: "View your Juego Todo order history and tracking details.",
  path: "/orders",
  noIndex: true,
});

export default function OrdersRoute() {
  return (
    <Suspense>
      <OrdersPage />
    </Suspense>
  );
}
