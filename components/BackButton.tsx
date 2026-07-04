"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const baseClassName =
  "group inline-flex items-center text-[0.7rem] font-black uppercase tracking-[0.18em] text-zinc-500 transition hover:text-[#FF1010]";

export function BackButton({
  href,
  label,
  onClick,
  preferHistory = false,
  className = "",
}: {
  href?: string;
  label: string;
  onClick?: () => void;
  preferHistory?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const classes = `${baseClassName} ${className}`.trim();

  function handleClick() {
    if (onClick) {
      onClick();
      return;
    }

    if (preferHistory && typeof window !== "undefined" && window.history.length > 1) {
      const referrer = document.referrer;
      const sameOrigin =
        referrer.length > 0 && new URL(referrer).origin === window.location.origin;

      if (sameOrigin) {
        router.back();
        return;
      }
    }

    if (href) {
      router.push(href);
    }
  }

  if (href && !onClick && !preferHistory) {
    return (
      <Link className={classes} href={href}>
        <ChevronLeft
          className="mr-1 transition group-hover:-translate-x-0.5 group-hover:text-[#FF1010]"
          size={14}
          aria-hidden
        />
        {label}
      </Link>
    );
  }

  return (
    <button className={classes} onClick={handleClick} type="button">
      <ChevronLeft
        className="mr-1 transition group-hover:-translate-x-0.5 group-hover:text-[#FF1010]"
        size={14}
        aria-hidden
      />
      {label}
    </button>
  );
}
