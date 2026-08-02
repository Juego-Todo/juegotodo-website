import type { ShopProduct } from "@/data/shop";

export const barrioBrawlsTicketSlug = "barrio-brawls-tickets";

export const barrioBrawlsEventFullName = "UGB46 and JUEGO TODO 1st Proclamation Anniversary";

export const barrioBrawlsTicketCheckoutUrl =
  "https://paymongo.page/l/ugb46andjuegotodo1stproclamationanniversary";

export const barrioBrawlsEventPosterSrc =
  "/events/ugb46-juego-todo-proclamation-anniversary.png";

export type BarrioBrawlsBout = {
  matchup: string;
  division: string;
  note?: string;
};

/** Single source of truth for the featured event date/time, venue, and fight card. */
export const barrioBrawlsEvent = {
  series: "UGB46",
  brandTitle: "Sta. Lucia Barrio Brawls",
  title: "1st Proclamation Anniversary",
  fullName: barrioBrawlsEventFullName,
  dateLabel: "August 28, 2026",
  timeLabel: "1:00 PM",
  venue: "Entertainment Center, Building 3, Sta. Lucia East Mall",
  city: "Cainta, Rizal, Philippines",
  target: "2026-08-28T13:00:00+08:00",
  mainEvent: "Taladtad vs Flores — Blaze FC Strawweight Championship",
  fightCard: [
    {
      matchup: "Taladtad vs Flores",
      division: "Blaze FC Strawweight Championship",
      note: "Title Defense",
    },
    {
      matchup: "Landong vs Quiñonero",
      division: "Juego Todo Professional Bantamweight Bout",
    },
    {
      matchup: "Arcilla vs Sarol",
      division: "Fun Fight Flyweight Championship Bout",
    },
    {
      matchup: "Monsod vs Cañete",
      division: "Juego Todo Professional Featherweight Bout",
    },
  ] satisfies BarrioBrawlsBout[],
} as const;

export const barrioBrawlsBoutLabels = barrioBrawlsEvent.fightCard.map((bout) =>
  bout.note ? `${bout.matchup} — ${bout.note} · ${bout.division}` : `${bout.matchup} — ${bout.division}`,
);

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
    imageSrc: barrioBrawlsEventPosterSrc,
    externalCheckoutUrl: barrioBrawlsTicketCheckoutUrl,
    eventTicket: barrioBrawlsEvent,
  },
];
