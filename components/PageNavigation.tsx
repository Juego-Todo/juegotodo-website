"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import {
  resolveBackNavigation,
  resolveBreadcrumbs,
  resolvePageCategoryLabel,
  type BreadcrumbItem,
} from "@/lib/navigation/breadcrumbs";

type PageHeroHeaderProps = {
  currentLabel?: string;
  breadcrumbs?: BreadcrumbItem[];
  categoryLabel?: string;
  showCategoryLabel?: boolean;
  backHref?: string;
  backLabel?: string;
};

export function PageNavigation(props: PageHeroHeaderProps) {
  return <PageHeroHeader {...props} />;
}

export function PageHeroHeader({
  currentLabel,
  breadcrumbs,
  categoryLabel,
  showCategoryLabel = true,
  backHref,
  backLabel,
}: PageHeroHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const items = useMemo(
    () => breadcrumbs ?? resolveBreadcrumbs(pathname, currentLabel),
    [breadcrumbs, currentLabel, pathname],
  );

  const category = useMemo(
    () => categoryLabel ?? resolvePageCategoryLabel(pathname, currentLabel),
    [categoryLabel, currentLabel, pathname],
  );

  const back = useMemo(() => {
    const resolved = resolveBackNavigation(pathname);
    return {
      label: backLabel ?? resolved.label,
      href: backHref ?? resolved.href,
    };
  }, [backHref, backLabel, pathname]);

  if (pathname === "/") {
    return null;
  }

  function handleBack() {
    const referrer = typeof document !== "undefined" ? document.referrer : "";
    const sameOrigin =
      referrer.length > 0 &&
      typeof window !== "undefined" &&
      new URL(referrer).origin === window.location.origin;

    if (sameOrigin && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(back.href);
  }

  return (
    <div>
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.75rem] font-bold uppercase tracking-[0.2em] text-white/60">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li className="flex items-center gap-2" key={`${item.label}-${index}`}>
                {index > 0 ? <span className="text-white/25">/</span> : null}
                {item.href && !isLast ? (
                  <Link className="transition hover:text-white" href={item.href}>
                    {item.label}
                  </Link>
                ) : (
                  <span className={isLast ? "text-white/80" : undefined}>{item.label}</span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <button
        className="group mt-4 inline-flex items-center text-[0.7rem] font-black uppercase tracking-[0.18em] text-zinc-500 transition hover:text-[#FF1010] lg:hidden"
        onClick={handleBack}
        type="button"
      >
        <ChevronLeft
          className="mr-1 transition group-hover:-translate-x-0.5 group-hover:text-[#FF1010]"
          size={14}
          aria-hidden
        />
        {back.label}
      </button>

      {showCategoryLabel && category ? (
        <p className="mt-6 text-[0.7rem] font-black uppercase tracking-[0.25em] text-[#FF1010] sm:mt-8">
          {category}
        </p>
      ) : null}
    </div>
  );
}
