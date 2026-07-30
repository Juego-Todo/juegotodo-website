import type { MetadataRoute } from "next";
import { getCanonicalSiteUrl } from "@/lib/seo/config";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getCanonicalSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/cart",
          "/checkout",
          "/checkout/",
          "/orders",
          "/orders/",
          "/profile",
          "/auth/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
