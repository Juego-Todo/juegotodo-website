import type { MetadataRoute } from "next";
import { SITE_DEFAULT_DESCRIPTION, SITE_NAME, SITE_TAGLINE, getCanonicalSiteUrl } from "@/lib/seo/config";

export default function manifest(): MetadataRoute.Manifest {
  const siteUrl = getCanonicalSiteUrl();

  return {
    name: `${SITE_NAME} — ${SITE_TAGLINE}`,
    short_name: SITE_NAME,
    description: SITE_DEFAULT_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#050505",
    lang: "en-PH",
    scope: "/",
    icons: [
      {
        src: "/favicon-48x48.png",
        sizes: "48x48",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    id: siteUrl,
  };
}
