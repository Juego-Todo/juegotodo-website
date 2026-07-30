/**
 * Canonical site URL and shared SEO constants.
 * Prefer NEXT_PUBLIC_SITE_URL so staging/production stay aligned.
 */
export const SITE_NAME = "Juego Todo";
export const SITE_TAGLINE = "The World's First Weaponized Combat League";
export const SITE_DEFAULT_DESCRIPTION =
  "Official Juego Todo platform for Filipino combat sports — live events, tickets, fighter rankings, seminars, official gear, and JTGC licensing.";
export const SITE_DEFAULT_OG_IMAGE = "/hero-background.png";
export const SITE_LOCALE = "en_PH";

export const SITE_KEYWORDS = [
  "Juego Todo",
  "Filipino Martial Arts",
  "FMA",
  "Arnis",
  "Eskrima",
  "Kali",
  "weaponized combat sports",
  "JTGC",
  "UGB46",
  "Philippines combat sports",
  "fight tickets Philippines",
] as const;

/** Absolute site origin without trailing slash. */
export function getCanonicalSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) {
    return fromEnv;
  }
  return "https://juegotodo.com";
}

/** Resolve a path or absolute URL to an absolute URL. */
export function absoluteUrl(pathOrUrl = "/"): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${getCanonicalSiteUrl()}${path}`;
}
