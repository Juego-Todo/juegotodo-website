/**
 * Canonical site URL and shared SEO constants.
 * Prefer NEXT_PUBLIC_SITE_URL so staging/production stay aligned.
 */
export const SITE_NAME = "Juego Todo";
export const SITE_TAGLINE = "The World's First Weaponized Combat League";

/** Homepage / default <title> — keep ~50–60 characters for Google. */
export const SITE_DEFAULT_TITLE = "Juego Todo | Filipino Combat Sports League";

/**
 * Meta description — front-load brand + value, keep under ~155 chars so Google
 * does not truncate mid-sentence or replace it with on-page copy.
 */
export const SITE_DEFAULT_DESCRIPTION =
  "Official home of Juego Todo — Filipino weaponized combat sports. Watch events, buy tickets, follow fighters, and shop official JT gear.";

export const SITE_DEFAULT_OG_IMAGE = "/hero-background.png";
export const SITE_LOGO = "/juego-todo-logo.png";
export const SITE_LOCALE = "en_PH";

export const SITE_SOCIAL = {
  facebook: "https://www.facebook.com/JuegoTodoPH",
  facebookPh: "https://www.facebook.com/profile.php?id=61583785331326",
  instagram: "https://www.instagram.com/juegotodophilippines",
  tiktok: "https://www.tiktok.com/@juegotodoofficial",
  youtube: "https://www.youtube.com/@juegotodoph",
} as const;

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
  "Barrio Brawls",
  "Philippines combat sports",
  "fight tickets Philippines",
] as const;

/** Absolute site origin without trailing slash. */
export function getCanonicalSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) {
    return fromEnv;
  }
  return "https://juegotodo.org";
}

/** Resolve a path or absolute URL to an absolute URL. */
export function absoluteUrl(pathOrUrl = "/"): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${getCanonicalSiteUrl()}${path}`;
}
