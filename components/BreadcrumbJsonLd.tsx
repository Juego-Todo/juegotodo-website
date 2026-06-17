import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import { breadcrumbsToJsonLd } from "@/lib/navigation/breadcrumbs";

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = breadcrumbsToJsonLd(items);

  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      type="application/ld+json"
    />
  );
}
