import { absoluteUrl, SITE_DEFAULT_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/seo/config";

export type JsonLdValue = Record<string, unknown> | Record<string, unknown>[];

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["SportsOrganization", "Organization"],
    name: SITE_NAME,
    alternateName: ["JTGC", "Juego Todo Grand Council"],
    description: SITE_DEFAULT_DESCRIPTION,
    slogan: SITE_TAGLINE,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/gab-sanctioned.png"),
    image: absoluteUrl("/hero-background.png"),
    email: "operations@juegotodo.com",
    areaServed: {
      "@type": "Country",
      name: "Philippines",
    },
    sport: "Filipino Martial Arts",
    sameAs: [],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    description: SITE_DEFAULT_DESCRIPTION,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/shop")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function eventJsonLd(input: {
  name: string;
  description: string;
  startDate: string;
  venue: string;
  city?: string;
  image?: string;
  url: string;
  ticketUrl?: string;
  price?: number;
  currency?: string;
  status?: "Upcoming" | "Results";
}) {
  const isUpcoming = input.status !== "Results";
  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: input.name,
    description: input.description,
    startDate: input.startDate,
    eventStatus: isUpcoming
      ? "https://schema.org/EventScheduled"
      : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    image: input.image ? [absoluteUrl(input.image)] : undefined,
    url: absoluteUrl(input.url),
    location: {
      "@type": "Place",
      name: input.venue,
      address: {
        "@type": "PostalAddress",
        addressLocality: input.city ?? "Philippines",
        addressCountry: "PH",
        streetAddress: input.venue,
      },
    },
    organizer: {
      "@type": "SportsOrganization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
    ...(input.ticketUrl || input.price
      ? {
          offers: {
            "@type": "Offer",
            url: absoluteUrl(input.ticketUrl ?? input.url),
            priceCurrency: input.currency ?? "PHP",
            ...(typeof input.price === "number" ? { price: input.price } : {}),
            availability: isUpcoming
              ? "https://schema.org/InStock"
              : "https://schema.org/SoldOut",
            validFrom: new Date().toISOString(),
          },
        }
      : {}),
  };
}

export function productJsonLd(input: {
  name: string;
  description: string;
  image?: string;
  url: string;
  sku: string;
  price: number;
  currency?: string;
  availability: "InStock" | "OutOfStock" | "PreOrder";
  brand?: string;
  category?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description,
    sku: input.sku,
    image: input.image ? [absoluteUrl(input.image)] : undefined,
    url: absoluteUrl(input.url),
    brand: {
      "@type": "Brand",
      name: input.brand ?? SITE_NAME,
    },
    category: input.category,
    offers: {
      "@type": "Offer",
      url: absoluteUrl(input.url),
      priceCurrency: input.currency ?? "PHP",
      price: input.price,
      availability: `https://schema.org/${input.availability}`,
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
  };
}

export function personJsonLd(input: {
  name: string;
  description: string;
  url: string;
  jobTitle?: string;
  affiliation?: string;
  nationality?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.url),
    jobTitle: input.jobTitle ?? "Professional Fighter",
    ...(input.affiliation
      ? {
          affiliation: {
            "@type": "SportsTeam",
            name: input.affiliation,
          },
        }
      : {}),
    ...(input.nationality
      ? {
          nationality: {
            "@type": "Country",
            name: input.nationality,
          },
        }
      : {}),
  };
}

export function sportsTeamJsonLd(input: {
  name: string;
  description: string;
  url: string;
  location?: string;
  coach?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.url),
    sport: "Filipino Martial Arts",
    ...(input.location
      ? {
          location: {
            "@type": "Place",
            name: input.location,
          },
        }
      : {}),
    ...(input.coach
      ? {
          coach: {
            "@type": "Person",
            name: input.coach,
          },
        }
      : {}),
  };
}
