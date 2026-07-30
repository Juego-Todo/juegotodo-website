import { absoluteUrl, SITE_DEFAULT_DESCRIPTION, SITE_LOGO, SITE_NAME, SITE_SOCIAL, SITE_TAGLINE } from "@/lib/seo/config";

export type JsonLdValue = Record<string, unknown> | Record<string, unknown>[];

export function organizationJsonLd() {
  const logoUrl = absoluteUrl(SITE_LOGO);
  return {
    "@context": "https://schema.org",
    "@type": ["SportsOrganization", "Organization"],
    name: SITE_NAME,
    legalName: "Juego Todo",
    alternateName: ["JTGC", "Juego Todo Grand Council", "juegotodo.org"],
    description: SITE_DEFAULT_DESCRIPTION,
    slogan: SITE_TAGLINE,
    url: absoluteUrl("/"),
    logo: {
      "@type": "ImageObject",
      url: logoUrl,
      width: 512,
      height: 512,
      caption: SITE_NAME,
    },
    image: absoluteUrl("/hero-background.png"),
    email: "operations@juegotodo.com",
    areaServed: {
      "@type": "Country",
      name: "Philippines",
    },
    sport: "Filipino Martial Arts",
    sameAs: Object.values(SITE_SOCIAL),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${absoluteUrl("/")}/#website`,
    name: SITE_NAME,
    alternateName: ["Juego Todo Combat Sports", "juegotodo.org"],
    url: absoluteUrl("/"),
    description: SITE_DEFAULT_DESCRIPTION,
    inLanguage: "en-PH",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(SITE_LOGO),
        width: 512,
        height: 512,
      },
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

export function videoObjectJsonLd(input: {
  name: string;
  description: string;
  url: string;
  youtubeId: string;
  uploadDate?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: input.name,
    description: input.description,
    thumbnailUrl: `https://img.youtube.com/vi/${input.youtubeId}/hqdefault.jpg`,
    embedUrl: `https://www.youtube.com/embed/${input.youtubeId}`,
    contentUrl: input.url,
    uploadDate: input.uploadDate,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
  };
}

export function newsArticleJsonLd(input: {
  headline: string;
  url: string;
  datePublished: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: input.headline,
    url: input.url,
    datePublished: input.datePublished,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/gab-sanctioned.png"),
      },
    },
  };
}

export function educationEventJsonLd(input: {
  name: string;
  description: string;
  startDate: string;
  venue: string;
  city: string;
  url: string;
  isFree?: boolean;
  price?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "EducationEvent",
    name: input.name,
    description: input.description,
    startDate: input.startDate,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: input.venue,
      address: {
        "@type": "PostalAddress",
        addressLocality: input.city,
        addressCountry: "PH",
      },
    },
    url: absoluteUrl(input.url),
    organizer: {
      "@type": "SportsOrganization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
    ...(input.isFree
      ? {
          offers: {
            "@type": "Offer",
            price: 0,
            priceCurrency: "PHP",
            availability: "https://schema.org/InStock",
            url: absoluteUrl(input.url),
          },
        }
      : input.price
        ? {
            offers: {
              "@type": "Offer",
              price: input.price.replace(/[^\d.]/g, "") || undefined,
              priceCurrency: "PHP",
              availability: "https://schema.org/InStock",
              url: absoluteUrl(input.url),
            },
          }
        : {}),
  };
}

export function mediaHubJsonLd(input: {
  articles: { title: string; href: string; publishedAt: string }[];
  clips: { title: string; href: string; youtubeId: string }[];
  podcasts: { title: string; href: string; youtubeId: string }[];
}) {
  const latestArticle = input.articles[0];
  const latestClip = input.clips[0];
  const latestPodcast = input.podcasts[0];

  const nodes = [
    {
      "@type": "CollectionPage",
      name: "Juego Todo Media Hub",
      description:
        "Official news, YouTube fight clips, and Goatism podcast episodes from Juego Todo.",
      url: absoluteUrl("/media"),
      isPartOf: {
        "@type": "WebSite",
        name: SITE_NAME,
        url: absoluteUrl("/"),
      },
    },
    ...(latestArticle
      ? [
          {
            "@type": "NewsArticle",
            headline: latestArticle.title,
            url: latestArticle.href,
            datePublished: latestArticle.publishedAt,
            publisher: {
              "@type": "Organization",
              name: SITE_NAME,
              url: absoluteUrl("/"),
            },
          },
        ]
      : []),
    ...(latestClip
      ? [
          {
            "@type": "VideoObject",
            name: latestClip.title,
            description: latestClip.title,
            thumbnailUrl: `https://img.youtube.com/vi/${latestClip.youtubeId}/hqdefault.jpg`,
            embedUrl: `https://www.youtube.com/embed/${latestClip.youtubeId}`,
            contentUrl: latestClip.href,
          },
        ]
      : []),
    ...(latestPodcast
      ? [
          {
            "@type": "VideoObject",
            name: latestPodcast.title,
            description: `Goatism podcast — ${latestPodcast.title}`,
            thumbnailUrl: `https://img.youtube.com/vi/${latestPodcast.youtubeId}/hqdefault.jpg`,
            embedUrl: `https://www.youtube.com/embed/${latestPodcast.youtubeId}`,
            contentUrl: latestPodcast.href,
          },
        ]
      : []),
  ];

  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}
