import type { ShopProduct } from "@/data/shop";

export const barrioBrawlsTicketSlug = "barrio-brawls-tickets";

/** Single source of truth for Barrio Brawls featured event date/time. */
export const barrioBrawlsEvent = {
  series: "Juego Todo",
  title: "Barrio Brawls",
  dateLabel: "August 28, 2026",
  timeLabel: "1:00 PM",
  venue: "TBA",
  target: "2026-08-28T13:00:00+08:00",
} as const;

export const eventTicketProducts: ShopProduct[] = [
  {
    slug: barrioBrawlsTicketSlug,
    name: "Juego Todo: Barrio Brawls — Digital Ticket",
    category: "digital-products",
    price: "₱1,500",
    priceAmount: 1500,
    description: `Digital general admission for Juego Todo: Barrio Brawls on ${barrioBrawlsEvent.dateLabel}.`,
    summary:
      "Flagship hybrid FMA card with professional weaponized competition and championship stakes. Instant digital QR delivery to your account.",
    features: [
      "QR ticket delivered to your account instantly",
      "General admission seating",
      "Venue details sent before event day",
    ],
    specs: [
      { label: "Event", value: "Juego Todo: Barrio Brawls" },
      { label: "Date", value: barrioBrawlsEvent.dateLabel },
      { label: "Time", value: barrioBrawlsEvent.timeLabel },
      { label: "Delivery", value: "Digital QR ticket" },
    ],
    competitionUse: "Spectator admission for the flagship JTGC Barrio Brawls card.",
    tone: "from-red-950 via-black to-zinc-950",
    badge: "On Sale",
    digital: true,
    stock: 500,
    rating: 4.9,
    reviewCount: 86,
    searchTags: ["tickets", "barrio brawls", "event", "admission", "digital ticket"],
    imageSrc: "/juego-todo-event-background.png",
    eventTicket: barrioBrawlsEvent,
  },
];
