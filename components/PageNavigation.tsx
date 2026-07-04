"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { BackButton } from "@/components/BackButton";
import {
  resolveBackNavigation,
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
  categoryLabel,
  showCategoryLabel = true,
  backHref,
  backLabel,
}: PageHeroHeaderProps) {
  const pathname = usePathname();

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

  return (
    <div>
      <BackButton href={back.href} label={back.label} preferHistory />

      {showCategoryLabel && category ? (
        <p className="mt-6 text-[0.7rem] font-black uppercase tracking-[0.25em] text-[#FF1010] sm:mt-8">
          {category}
        </p>
      ) : null}
    </div>
  );
}
