import { Suspense } from "react";
import { CartPage } from "@/components/commerce/CartPage";

export default function CartRoute() {
  return (
    <Suspense>
      <CartPage />
    </Suspense>
  );
}
