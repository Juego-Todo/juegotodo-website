"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const steps = [
  { label: "Cart", href: "/cart" },
  { label: "Shipping", href: "/checkout/shipping" },
  { label: "Payment", href: "/checkout/payment" },
  { label: "Review", href: "/checkout/review" },
];

export function CheckoutSteps() {
  const pathname = usePathname();
  const activeIndex = steps.findIndex((step) => pathname.startsWith(step.href));

  return (
    <ol className="mb-8 flex flex-wrap gap-2">
      {steps.map((step, index) => {
        const active = index <= activeIndex;
        const current = index === activeIndex;
        return (
          <li key={step.href}>
            <Link
              className={`inline-flex rounded-full px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.16em] transition ${
                current
                  ? "bg-red-600 text-white"
                  : active
                    ? "border border-red-500/30 bg-red-500/10 text-red-200"
                    : "border border-white/10 text-zinc-500"
              }`}
              href={step.href}
            >
              {index + 1}. {step.label}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
