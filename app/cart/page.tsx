import type { Metadata } from "next";
import { Suspense } from "react";
import { CartPage } from "@/components/commerce/CartPage";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Shopping Cart",
  description: "Review items in your Juego Todo shopping cart before checkout.",
  path: "/cart",
  noIndex: true,
});

export default function CartRoute() {
  return (
    <Suspense>
      <CartPage />
    </Suspense>
  );
}
