import type { Metadata } from "next";
import {
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_OG_IMAGE,
  SITE_DEFAULT_TITLE,
  SITE_KEYWORDS,
  SITE_LOCALE,
  SITE_LOGO,
  SITE_NAME,
  SITE_TAGLINE,
  absoluteUrl,
  getCanonicalSiteUrl,
} from "@/lib/seo/config";

export type BuildPageMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  imageAlt?: string;
  type?: "website" | "article" | "profile";
  keywords?: string[];
  /** When true, search engines should not index the page. */
  noIndex?: boolean;
};

function truncateDescription(value: string, max = 155): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) {
    return normalized;
  }
  return `${normalized.slice(0, max - 1).trimEnd()}…`;
}

export function buildPageMetadata(input: BuildPageMetadataInput): Metadata {
  const description = truncateDescription(input.description || SITE_DEFAULT_DESCRIPTION);
  const canonical = absoluteUrl(input.path);
  const imagePath = input.image?.trim() || SITE_DEFAULT_OG_IMAGE;
  const imageUrl = absoluteUrl(imagePath);
  const imageAlt = input.imageAlt ?? `${input.title} | ${SITE_NAME}`;
  const keywords = [...SITE_KEYWORDS, ...(input.keywords ?? [])];

  return {
    title: input.title,
    description,
    keywords,
    alternates: {
      canonical: input.path,
    },
    robots: input.noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true },
    openGraph: {
      title: input.title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      type: input.type ?? "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description,
      images: [imageUrl],
    },
  };
}

export function buildRootMetadata(): Metadata {
  const siteUrl = getCanonicalSiteUrl();
  const description = SITE_DEFAULT_DESCRIPTION;
  const imageUrl = absoluteUrl(SITE_DEFAULT_OG_IMAGE);
  const logoUrl = absoluteUrl(SITE_LOGO);

  return {
    title: {
      default: SITE_DEFAULT_TITLE,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    keywords: [...SITE_KEYWORDS],
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME, url: siteUrl }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "sports",
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: SITE_DEFAULT_TITLE,
      description,
      url: siteUrl,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      type: "website",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: `${SITE_NAME} — ${SITE_TAGLINE}` }],
    },
    icons: {
      icon: [
        { url: "/favicon.png", sizes: "48x48", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
      shortcut: "/favicon-48x48.png",
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_DEFAULT_TITLE,
      description,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    other: {
      "og:logo": logoUrl,
    },
  };
}
