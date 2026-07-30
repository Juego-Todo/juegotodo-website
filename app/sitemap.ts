import type { MetadataRoute } from "next";
import { consultationServices } from "@/data/consultations";
import { rulebooks } from "@/data/rules";
import { scheduledSeminars } from "@/data/seminars";
import { shopProducts } from "@/data/shop";
import { events, fighters, pageContent } from "@/data/site";
import { teams } from "@/data/teams";
import { getCanonicalSiteUrl } from "@/lib/seo/config";

const licenseRoles = [
  "fighter",
  "coach",
  "senior-coach",
  "trainer",
  "referee",
  "judge",
  "adviser",
  "staff",
  "club-owner",
  "grand-council-member",
  "grand-council-officer",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getCanonicalSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/calendar`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/consultation/book`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/register-for-license`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const hubRoutes: MetadataRoute.Sitemap = Object.keys(pageContent).map((slug) => ({
    url: `${base}/${slug}`,
    lastModified: now,
    changeFrequency: slug === "events" || slug === "shop" || slug === "media" || slug === "latayanology" ? "daily" : "weekly",
    priority:
      slug === "events" || slug === "shop" || slug === "media" || slug === "about-juego-todo" ? 0.9 : 0.7,
  }));

  const eventRoutes: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${base}/events/${event.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.95,
  }));

  const fighterRoutes: MetadataRoute.Sitemap = fighters.map((fighter) => ({
    url: `${base}/fighters/${fighter.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const shopRoutes: MetadataRoute.Sitemap = shopProducts.map((product) => ({
    url: `${base}/shop/${product.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: product.eventTicket ? 0.95 : 0.75,
  }));

  const teamRoutes: MetadataRoute.Sitemap = teams.map((team) => ({
    url: `${base}/teams/${team.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const seminarRoutes: MetadataRoute.Sitemap = scheduledSeminars.map((seminar) => ({
    url: `${base}/juego-todo-seminars/${seminar.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  const consultationRoutes: MetadataRoute.Sitemap = consultationServices.map((service) => ({
    url: `${base}/consultation/${service.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.55,
  }));

  const rulesRoutes: MetadataRoute.Sitemap = rulebooks.map((rule) => ({
    url: `${base}/rules-regulations/${rule.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.65,
  }));

  const licenseRoutes: MetadataRoute.Sitemap = licenseRoles.map((role) => ({
    url: `${base}/register-for-license/${role}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...hubRoutes,
    ...eventRoutes,
    ...fighterRoutes,
    ...shopRoutes,
    ...teamRoutes,
    ...seminarRoutes,
    ...consultationRoutes,
    ...rulesRoutes,
    ...licenseRoutes,
  ];
}
