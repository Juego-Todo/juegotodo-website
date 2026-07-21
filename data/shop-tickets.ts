import type { ShopProduct } from "@/data/shop";

export const barrioBrawlsTicketSlug = "barrio-brawls-tickets";

export const barrioBrawlsEventFullName =
  "UGB46 and JUEGO TODO 1st Proclamation Anniversary";

export const barrioBrawlsTicketCheckoutUrl =
  "https://paymongo.page/l/ugb46andjuegotodo1stproclamationanniversary";

/** Single source of truth for the featured event date/time and display copy. */
export const barrioBrawlsEvent = {
  series: "UGB46",
  title: "JUEGO TODO 1st Proclamation Anniversary",
  dateLabel: "August 28, 2026",
  timeLabel: "1:00 PM",
  venue: "TBA",
  target: "2026-08-28T13:00:00+08:00",
} as const;

export const eventTicketProducts: ShopProduct[] = [
  {
    slug: barrioBrawlsTicketSlug,
    name: `${barrioBrawlsEventFullName} — Digital Ticket`,
    category: "digital-products",
    price: "₱1,999",
    priceAmount: 1999,
    description: `Digital general admission for ${barrioBrawlsEventFullName} on ${barrioBrawlsEvent.dateLabel}.`,
    summary:
      "AUGUST 28, 2026 | UGB 46 x BLAZE FC 10 x Juego Todo 1st Proclamation Anniversary. Two championships. Four warriors. One unforgettable night.",
    features: [
      "QR ticket delivered to your account instantly",
      "General admission seating",
      "Venue details sent before event day",
    ],
    specs: [
      { label: "Event", value: barrioBrawlsEventFullName },
      { label: "Date", value: barrioBrawlsEvent.dateLabel },
      { label: "Time", value: barrioBrawlsEvent.timeLabel },
      { label: "Price", value: "₱1,999" },
      { label: "Delivery", value: "Digital QR ticket" },
    ],
    competitionUse: `Spectator admission for ${barrioBrawlsEventFullName}.`,
    tone: "from-red-950 via-black to-zinc-950",
    badge: "On Sale",
    digital: true,
    stock: 500,
    rating: 4.9,
    reviewCount: 86,
    searchTags: [
      "tickets",
      "ugb46",
      "juego todo",
      "proclamation anniversary",
      "event",
      "admission",
      "digital ticket",
    ],
    imageSrc: "/juego-todo-event-background.png",
    externalCheckoutUrl: barrioBrawlsTicketCheckoutUrl,
    eventTicket: barrioBrawlsEvent,
  },
];
