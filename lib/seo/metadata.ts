import type { Metadata } from "next";
import {
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_OG_IMAGE,
  SITE_KEYWORDS,
  SITE_LOCALE,
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

function truncateDescription(value: string, max = 160): string {
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

  return {
    title: {
      default: `${SITE_NAME} | Filipino Combat Sports`,
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
      title: `${SITE_NAME} | ${SITE_TAGLINE}`,
      description,
      url: siteUrl,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      type: "website",
      images: [{ url: imageUrl, alt: `${SITE_NAME} — ${SITE_TAGLINE}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE_NAME} | ${SITE_TAGLINE}`,
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
  };
}
