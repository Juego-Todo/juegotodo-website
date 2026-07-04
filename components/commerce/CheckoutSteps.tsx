"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { getCheckoutAuthHref } from "@/lib/commerce/checkout-auth";

const steps = [
  { label: "Cart", href: "/cart" },
  { label: "Account", href: getCheckoutAuthHref("/checkout/shipping") },
  { label: "Verification", href: "/profile" },
  { label: "Shipping", href: "/checkout/shipping" },
  { label: "Payment", href: "/checkout/payment" },
  { label: "Review", href: "/checkout/review" },
];

export function CheckoutSteps() {
  const pathname = usePathname();
  const { user } = useAuth();

  const activeIndex = (() => {
    if (pathname.startsWith("/checkout/review")) return 5;
    if (pathname.startsWith("/checkout/payment")) return 4;
    if (pathname.startsWith("/checkout/shipping")) return 3;
    if (pathname.startsWith("/profile")) return 2;
    if (pathname.startsWith("/login")) return 1;
    if (pathname.startsWith("/cart")) return 0;
    return 0;
  })();

  return (
    <ol className="mb-8 flex flex-wrap gap-2">
      {steps.map((step, index) => {
        const completed = user ? index < activeIndex : index < activeIndex && index !== 1;
        const current = index === activeIndex;
        const reachable = user || index <= 1;

        return (
          <li key={step.href}>
            {reachable ? (
              <Link
                className={`inline-flex rounded-full px-3 py-2 text-[0.58rem] font-black uppercase tracking-[0.14em] transition sm:px-4 sm:text-[0.62rem] ${
                  current
                    ? "bg-red-600 text-white"
                    : completed
                      ? "border border-red-500/30 bg-red-500/10 text-red-200"
                      : "border border-white/10 text-zinc-500"
                }`}
                href={step.href}
              >
                {index + 1}. {step.label}
              </Link>
            ) : (
              <span className="inline-flex rounded-full border border-white/10 px-3 py-2 text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-600 sm:px-4">
                {index + 1}. {step.label}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
