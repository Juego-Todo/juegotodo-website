export type BreadcrumbItem = {
  label: string;
  href?: string;
};

const SEGMENT_LABELS: Record<string, string> = {
  fighters: "LATAYANOLOGY",
  events: "Events",
  media: "Media",
  shop: "Shop",
  registration: "Registration",
  partners: "Partners",
  teams: "Teams",
  partnerships: "Partners",
  "rules-regulations": "Rules & Regulations",
  "juego-todo-seminars": "Seminars",
  consultation: "Consultation",
  "about-juego-todo": "About JTGC",
  "grand-council": "Grand Council",
  "fma-lineage": "FMA Lineage",
  contact: "Contact",
  login: "Login",
  profile: "Profile",
  cart: "Cart",
  checkout: "Checkout",
  admin: "Admin",
  "license-approvals": "License Approvals",
  orders: "Orders",
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  cookies: "Cookie Policy",
  disclaimer: "Disclaimer",
  "broadcast-rights": "Broadcast Rights",
  "fighter-agreement": "Fighter Agreement",
  waiver: "Waiver",
  "safety-policy": "Safety Policy",
  "media-accreditation": "Media Accreditation",
  sponsorships: "Sponsorships",
  latayanology: "LATAYANOLOGY",
};

const STATIC_PAGE_LABELS: Record<string, string> = {
  "/events": "Fight Calendar",
  "/calendar": "Official Calendar",
  "/media": "Broadcast Library",
  "/shop": "Official Store",
  "/registration": "Registration",
  "/partners": "Partners",
  "/teams": "Teams",
  "/partnerships": "Partners",
  "/rules-regulations": "Rules Library",
  "/juego-todo-seminars": "Seminar Calendar",
  "/consultation": "Consultation",
  "/consultation/book": "Book Consultation",
  "/about-juego-todo": "Organizational Structure",
  "/grand-council": "Organizational Structure",
  "/fma-lineage": "FMA Lineage",
  "/contact": "Contact",
  "/login": "Login",
  "/profile": "Profile",
  "/register-for-license": "Register for a License",
  "/cart": "Cart",
  "/checkout/shipping": "Checkout — Shipping",
  "/checkout/payment": "Checkout — Payment",
  "/checkout/review": "Checkout — Review",
  "/admin": "Admin Dashboard",
  "/admin/license-approvals": "License Approvals",
  "/orders": "Order History",
  "/privacy": "Privacy Policy",
  "/terms": "Terms of Service",
  "/cookies": "Cookie Policy",
  "/disclaimer": "Disclaimer",
  "/broadcast-rights": "Broadcast Rights",
  "/fighter-agreement": "Fighter Agreement",
  "/waiver": "Waiver & Release",
  "/safety-policy": "Safety Policy",
  "/media-accreditation": "Media Accreditation",
  "/sponsorships": "Sponsorship Policy",
  "/latayanology": "LATAYANOLOGY",
};

const DETAIL_PARENTS: Record<string, { href: string; label: string; backLabel: string }> = {
  fighters: { href: "/latayanology", label: "LATAYANOLOGY", backLabel: "Back to LATAYANOLOGY" },
  teams: { href: "/teams", label: "Teams", backLabel: "Back to Teams" },
  events: { href: "/events", label: "Events", backLabel: "Back to Events" },
  shop: { href: "/shop", label: "Shop", backLabel: "Back to Shop" },
  orders: { href: "/orders", label: "Orders", backLabel: "Back to Orders" },
  "rules-regulations": {
    href: "/rules-regulations",
    label: "Rules & Regulations",
    backLabel: "Back to Rules",
  },
  "juego-todo-seminars": {
    href: "/juego-todo-seminars",
    label: "Seminars",
    backLabel: "Back to Seminars",
  },
  consultation: {
    href: "/consultation",
    label: "Consultation",
    backLabel: "Back to Consultation",
  },
};

export function resolvePageCategoryLabel(pathname: string, currentLabel?: string) {
  if (pathname === "/fighters" || pathname.startsWith("/fighters/")) {
    return "Latayanology";
  }

  const items = resolveBreadcrumbs(pathname, currentLabel);
  if (items.length <= 1) {
    return "Home";
  }

  const segments = pathname.split("/").filter(Boolean);
  const parent = segments[0] ? DETAIL_PARENTS[segments[0]] : undefined;

  if (parent && segments.length > 1) {
    return parent.label;
  }

  return items[items.length - 1].label;
}

export function shouldShowPageNavigation(pathname: string) {
  return pathname !== "/";
}

export function resolveBreadcrumbs(pathname: string, currentLabel?: string): BreadcrumbItem[] {
  if (pathname === "/") {
    return [{ label: "Home", href: "/" }];
  }

  const crumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }];
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return crumbs;
  }

  if (segments.length === 1) {
    const segment = segments[0];
    const label = STATIC_PAGE_LABELS[`/${segment}`] ?? SEGMENT_LABELS[segment] ?? formatSegment(segment);
    crumbs.push({ label });
    return crumbs;
  }

  const parentSegment = segments[0];

  if (parentSegment === "fighters") {
    crumbs.push({ label: "LATAYANOLOGY", href: "/latayanology" });
    crumbs.push({ label: currentLabel ?? formatSegment(segments[segments.length - 1]) });
    return crumbs;
  }

  const parent = DETAIL_PARENTS[parentSegment];

  if (parent) {
    crumbs.push({ label: parent.label, href: parent.href });
    crumbs.push({ label: currentLabel ?? formatSegment(segments[segments.length - 1]) });
    return crumbs;
  }

  let path = "";
  segments.forEach((segment, index) => {
    path += `/${segment}`;
    const isLast = index === segments.length - 1;
    const label = isLast
      ? currentLabel ?? STATIC_PAGE_LABELS[path] ?? SEGMENT_LABELS[segment] ?? formatSegment(segment)
      : STATIC_PAGE_LABELS[path] ?? SEGMENT_LABELS[segment] ?? formatSegment(segment);

    crumbs.push(isLast ? { label } : { label, href: path });
  });

  return crumbs;
}

export function resolveBackNavigation(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) {
    return { label: "Back to Home", href: "/" };
  }

  if (segments[0] === "admin" && segments[1] === "license-approvals" && segments.length === 3) {
    return { label: "Back to Applications", href: "/profile?tab=licenses&view=approvals" };
  }

  if (segments[0] === "admin" && segments.length === 2 && segments[1] !== "license-approvals") {
    return { label: "Back to Admin Console", href: "/admin" };
  }

  if (segments[0] === "admin" && segments.length === 1) {
    return { label: "Back to Profile", href: "/profile" };
  }

  if (segments[0] === "checkout") {
    if (segments[1] === "review") {
      return { label: "Back to Payment", href: "/checkout/payment" };
    }
    if (segments[1] === "payment") {
      return { label: "Back to Shipping", href: "/checkout/shipping" };
    }
    if (segments[1] === "shipping") {
      return { label: "Back to Cart", href: "/cart" };
    }
    if (segments[1] === "confirmation") {
      return { label: "Back to Orders", href: "/orders" };
    }
  }

  if (segments[0] === "orders" && segments.length === 3) {
    return { label: "Back to Orders", href: "/orders" };
  }

  const parentSegment = segments[0];
  const parent = DETAIL_PARENTS[parentSegment];

  if (parent && segments.length > 1) {
    return { label: parent.backLabel, href: parent.href };
  }

  const parentPath = `/${segments.slice(0, -1).join("/")}`;
  const parentLabel =
    STATIC_PAGE_LABELS[parentPath] ??
    SEGMENT_LABELS[segments[segments.length - 2]] ??
    formatSegment(segments[segments.length - 2]);

  return {
    label: `Back to ${parentLabel}`,
    href: parentPath || "/",
  };
}

function formatSegment(value: string) {
  return value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function breadcrumbsToJsonLd(items: BreadcrumbItem[], baseUrl = "https://juegotodo.com") {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${baseUrl}${item.href}` } : {}),
    })),
  };
}
