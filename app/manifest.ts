import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_TAGLINE, getCanonicalSiteUrl } from "@/lib/seo/config";

export default function manifest(): MetadataRoute.Manifest {
  const siteUrl = getCanonicalSiteUrl();

  return {
    name: `${SITE_NAME} — ${SITE_TAGLINE}`,
    short_name: SITE_NAME,
    description:
      "Official Juego Todo platform for Filipino combat sports events, tickets, rankings, and gear.",
    start_url: "/",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#050505",
    lang: "en-PH",
    scope: "/",
    icons: [
      {
        src: "/gab-sanctioned.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    id: siteUrl,
  };
}
