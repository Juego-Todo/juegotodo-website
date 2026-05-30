export type ShopProduct = {
  slug: string;
  name: string;
  category: "Sticks" | "Protective Gear" | "Apparel" | "Accessories";
  price: string;
  description: string;
  summary: string;
  features: string[];
  specs: { label: string; value: string }[];
  competitionUse: string;
  tone: string;
  badge?: string;
};

export const shopProducts: ShopProduct[] = [
  {
    slug: "official-arnis-stick-pair",
    name: "Official Arnis Stick Pair",
    category: "Sticks",
    price: "₱1,850",
    description: "Competition-ready rattan sticks sized for Doble Baston rounds.",
    summary:
      "The official Juego Todo stick pair is built for Round 1 weapon exchanges. Each stick is balanced for speed, control, and safe full-contact sparring under JT rules.",
    features: [
      "Matched pair for Doble Baston competition",
      "Rattan construction with smooth finish",
      "Length calibrated for adult professional divisions",
      "End caps reduce splintering during hard exchanges",
      "Approved for gym training and event check-in",
    ],
    specs: [
      { label: "Material", value: "Premium rattan" },
      { label: "Quantity", value: "Pair (2 sticks)" },
      { label: "Finish", value: "Natural with JT end caps" },
      { label: "Use", value: "Round 1 — Doble Baston" },
    ],
    competitionUse: "Required format for weapon-to-weapon opening rounds in professional and amateur divisions.",
    tone: "from-red-900 via-zinc-950 to-black",
    badge: "Best Seller",
  },
  {
    slug: "solo-baston-training-stick",
    name: "Solo Baston Training Stick",
    category: "Sticks",
    price: "₱980",
    description: "Single-stick format for drills, sparring, and transition work.",
    summary:
      "A single competition stick for Solo Baston rounds and daily gym drills. Ideal for athletes working one-weapon control before Mano y Mano transitions.",
    features: [
      "Single stick for Round 2 competition format",
      "Lightweight profile for fast hand speed",
      "Durable rattan for repeated contact drills",
      "Compatible with JT stick bag and corner setup",
      "Suitable for youth and adult training groups",
    ],
    specs: [
      { label: "Material", value: "Premium rattan" },
      { label: "Quantity", value: "Single stick" },
      { label: "Weight Class", value: "Standard adult" },
      { label: "Use", value: "Round 2 — Solo Baston" },
    ],
    competitionUse: "Used in Solo Baston rounds where one official stick is permitted alongside limited empty-hand strikes.",
    tone: "from-zinc-900 via-red-950 to-black",
  },
  {
    slug: "hardwood-kali-sticks",
    name: "Hardwood Kali Sticks",
    category: "Sticks",
    price: "₱2,400",
    description: "Premium hardwood pair with Juego Todo grip tape and end caps.",
    summary:
      "A premium hardwood stick pair for advanced Kali training and high-intensity weapon camps. Heavier feel with enhanced durability for coaches and elite athletes.",
    features: [
      "Hardwood pair with matched balance",
      "JT grip tape for secure handling",
      "Reinforced end caps for long gym life",
      "Built for advanced flow and impact drills",
      "Corner-ready storage profile",
    ],
    specs: [
      { label: "Material", value: "Hardwood" },
      { label: "Quantity", value: "Pair (2 sticks)" },
      { label: "Grip", value: "Juego Todo tape wrap" },
      { label: "Use", value: "Training / camp equipment" },
    ],
    competitionUse: "Training equipment. Event use depends on division equipment approval at check-in.",
    tone: "from-yellow-900 via-zinc-950 to-red-950",
  },
  {
    slug: "competition-hand-wraps",
    name: "Competition Hand Wraps",
    category: "Protective Gear",
    price: "₱650",
    description: "180-inch wraps built for weapon and Mano y Mano rounds.",
    summary:
      "Elastic hand wraps designed for JT competition base gear. Supports wrist stability through weapon rounds and empty-hand striking in Round 3.",
    features: [
      "180-inch length for full wrist coverage",
      "Breathable elastic blend",
      "Hook-and-loop closure for fast corner changes",
      "Approved base gear for male and female athletes",
      "Available for gym bulk orders",
    ],
    specs: [
      { label: "Length", value: "180 inches" },
      { label: "Closure", value: "Hook-and-loop" },
      { label: "Color", value: "Black / Red" },
      { label: "Use", value: "All rounds — base gear" },
    ],
    competitionUse: "Required base equipment across weapon and Mano y Mano rounds for registered athletes.",
    tone: "from-zinc-950 via-red-900 to-black",
  },
  {
    slug: "groin-guard-pro",
    name: "Groin Guard Pro",
    category: "Protective Gear",
    price: "₱1,450",
    description: "Required base protection for male athletes across all divisions.",
    summary:
      "Competition groin protection engineered for Filipino martial arts ranges, including low-line kicks, clinch entries, and weapon transitions.",
    features: [
      "Hard cup with secure fit system",
      "Low-profile design under fight shorts",
      "Ventilated shell for long training sessions",
      "Approved for JT male athlete divisions",
      "Adjustable waist and leg straps",
    ],
    specs: [
      { label: "Type", value: "Hard cup guard" },
      { label: "Fit", value: "Adjustable straps" },
      { label: "Profile", value: "Low bulk competition cut" },
      { label: "Use", value: "All rounds — male athletes" },
    ],
    competitionUse: "Mandatory base gear for male fighters in professional, amateur, and youth divisions where applicable.",
    tone: "from-red-950 via-black to-zinc-900",
  },
  {
    slug: "mouth-guard-elite",
    name: "Mouth Guard Elite",
    category: "Protective Gear",
    price: "₱890",
    description: "Boil-and-bite guard for Round 3 empty-hand competition.",
    summary:
      "Custom-mold mouth protection for Mano y Mano rounds. Designed for striking, clinch, and grappling phases once weapons are cleared.",
    features: [
      "Boil-and-bite custom fit",
      "High-impact protection for strikes and clinch",
      "Breathing channel for active rounds",
      "Carry case included",
      "Required add-on for Round 3 competition",
    ],
    specs: [
      { label: "Type", value: "Boil-and-bite" },
      { label: "Case", value: "Included" },
      { label: "Colors", value: "Clear / Red" },
      { label: "Use", value: "Round 3 — Mano y Mano" },
    ],
    competitionUse: "Added protection requirement when athletes enter empty-hand Round 3 competition.",
    tone: "from-black via-zinc-900 to-red-950",
  },
  {
    slug: "jt-fight-shorts",
    name: "Juego Todo Fight Shorts",
    category: "Apparel",
    price: "₱1,650",
    description: "MMA-style shorts with stretch panels and JT branding.",
    summary:
      "Official fight shorts built for weapon transitions, high kicks, and ground exchanges. Flexible panels and reinforced seams for competition week.",
    features: [
      "4-way stretch side panels",
      "Reinforced seams for grappling phases",
      "JT logo and brand striping",
      "Quick-dry fabric for multiple sessions",
      "Unisex competition cut",
    ],
    specs: [
      { label: "Fabric", value: "Poly blend with stretch panels" },
      { label: "Fit", value: "Competition / unisex" },
      { label: "Sizes", value: "XS — 3XL" },
      { label: "Use", value: "All rounds — base gear" },
    ],
    competitionUse: "Approved lower-body base gear for MMA shorts or compression shorts requirements.",
    tone: "from-red-700 via-zinc-950 to-black",
    badge: "New",
  },
  {
    slug: "jt-team-jersey",
    name: "Juego Todo Team Jersey",
    category: "Apparel",
    price: "₱1,200",
    description: "Breathable training jersey for gyms, camps, and corner teams.",
    summary:
      "Lightweight team jersey for affiliate gyms, seminar staff, and corner teams. Breathable mesh zones keep coaches and athletes cool during long training blocks.",
    features: [
      "Breathable mesh performance fabric",
      "JT front crest and back wordmark",
      "Relaxed athletic fit for training",
      "Ideal for gym staff and camp uniforms",
      "Machine washable for daily use",
    ],
    specs: [
      { label: "Fabric", value: "Performance mesh blend" },
      { label: "Fit", value: "Athletic training cut" },
      { label: "Sizes", value: "S — 3XL" },
      { label: "Use", value: "Training / team wear" },
    ],
    competitionUse: "Team and corner apparel. Not a substitute for competition base gear.",
    tone: "from-zinc-900 via-red-800 to-black",
  },
  {
    slug: "stick-carry-bag",
    name: "Stick Carry Bag",
    category: "Accessories",
    price: "₱750",
    description: "Padded bag for stick pairs, gloves, and event-day essentials.",
    summary:
      "Padded carry bag sized for stick pairs, wraps, and corner tools. Keeps equipment organized from gym sessions to event check-in.",
    features: [
      "Padded main compartment for stick pairs",
      "Front pocket for wraps and mouth guard",
      "Adjustable shoulder strap",
      "Ventilated base panel",
      "JT patch and red accent stitching",
    ],
    specs: [
      { label: "Capacity", value: "2 sticks + accessories" },
      { label: "Strap", value: "Adjustable shoulder carry" },
      { label: "Material", value: "Ripstop nylon" },
      { label: "Use", value: "Travel / event day" },
    ],
    competitionUse: "Recommended accessory for athletes traveling with approved JT equipment.",
    tone: "from-zinc-950 via-zinc-800 to-black",
  },
  {
    slug: "jt-gym-towel",
    name: "Juego Todo Gym Towel",
    category: "Accessories",
    price: "₱420",
    description: "Quick-dry corner towel with embroidered JT logo.",
    summary:
      "Quick-dry towel for corners, seminars, and gym floors. Embroidered JT branding makes it easy to spot in busy training spaces.",
    features: [
      "Quick-dry microfiber fabric",
      "Embroidered Juego Todo logo",
      "Compact size for gym bags",
      "Corner and seminar ready",
      "Available for bulk gym orders",
    ],
    specs: [
      { label: "Fabric", value: "Quick-dry microfiber" },
      { label: "Size", value: "Gym / corner standard" },
      { label: "Color", value: "Black with red logo" },
      { label: "Use", value: "Training / corner accessory" },
    ],
    competitionUse: "Corner accessory for athlete and coach use between rounds.",
    tone: "from-red-900 via-black to-zinc-950",
  },
];

export function getShopProduct(slug: string) {
  return shopProducts.find((product) => product.slug === slug);
}
