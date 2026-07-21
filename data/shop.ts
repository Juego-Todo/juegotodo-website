import type { ShopCategory } from "@/lib/commerce/types";
import { merchandiseProducts } from "@/data/shop-merchandise";
import { eventTicketProducts } from "@/data/shop-tickets";

export type ShopEventTicket = {
  series: string;
  title: string;
  dateLabel: string;
  timeLabel: string;
  venue: string;
  target: string;
};

export type ProductVariantOption = {
  id: string;
  label: string;
  imageSrc?: string;
  priceAmount?: number;
};

export type ProductVariantGroup = {
  id: string;
  label: string;
  options: ProductVariantOption[];
};

export type ShopProduct = {
  slug: string;
  name: string;
  category: ShopCategory;
  price: string;
  priceAmount: number;
  description: string;
  summary: string;
  features: string[];
  specs: { label: string; value: string }[];
  competitionUse: string;
  tone: string;
  badge?: string;
  digital?: boolean;
  stock: number;
  searchTags: string[];
  rating?: number;
  reviewCount?: number;
  imageSrc?: string;
  /** Opens an external checkout (e.g. PayMongo) instead of the in-app cart flow. */
  externalCheckoutUrl?: string;
  eventTicket?: ShopEventTicket;
  variantGroups?: ProductVariantGroup[];
};

const legacyShopProducts: ShopProduct[] = [
  {
    slug: "official-arnis-stick-pair",
    name: "Official Arnis Stick Pair",
    category: "official-gear",
    price: "₱1,850",
    priceAmount: 1850,
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
    stock: 48,
    rating: 4.9,
    reviewCount: 128,
    searchTags: ["sticks", "doble baston", "competition", "rattan"],
  },
  {
    slug: "jt-competition-gloves",
    name: "JT Competition Gloves",
    category: "competition-equipment",
    price: "₱2,200",
    priceAmount: 2200,
    description: "Official padded gloves for weapon and Mano y Mano transitions.",
    summary:
      "Competition gloves engineered for Filipino martial arts ranges. Lightweight padding preserves weapon grip while protecting knuckles in Round 3 exchanges.",
    features: [
      "Open-palm weapon grip profile",
      "Competition-weight padding",
      "Hook-and-loop wrist wrap",
      "JT red accent stitching",
      "Approved for professional divisions",
    ],
    specs: [
      { label: "Weight", value: "Competition 8oz profile" },
      { label: "Closure", value: "Hook-and-loop" },
      { label: "Color", value: "Black / Red" },
      { label: "Use", value: "All rounds — base gear" },
    ],
    competitionUse: "Approved hand protection for registered athletes across weapon and empty-hand rounds.",
    tone: "from-zinc-900 via-red-950 to-black",
    badge: "Best Seller",
    stock: 32,
    rating: 4.9,
    reviewCount: 156,
    searchTags: ["gloves", "competition", "official"],
  },
  {
    slug: "jt-competition-jersey",
    name: "JT Competition Jersey",
    category: "competition-equipment",
    price: "₱1,750",
    priceAmount: 1750,
    description: "Official competition jersey with athlete nameplate zone.",
    summary:
      "Breathable competition jersey with moisture-wicking panels and official JT crest. Nameplate zone ready for event printing.",
    features: [
      "Moisture-wicking performance fabric",
      "Nameplate print zone",
      "Sublimated JT crest",
      "Athletic competition fit",
      "Corner and weigh-in ready",
    ],
    specs: [
      { label: "Fabric", value: "Poly performance blend" },
      { label: "Sizes", value: "XS — 3XL" },
      { label: "Print", value: "Nameplate compatible" },
      { label: "Use", value: "Competition base gear" },
    ],
    competitionUse: "Approved upper-body competition apparel for registered athletes.",
    tone: "from-red-700 via-zinc-950 to-black",
    badge: "Best Seller",
    stock: 40,
    rating: 4.7,
    reviewCount: 87,
    searchTags: ["jersey", "competition", "apparel"],
  },
  {
    slug: "solo-baston-training-stick",
    name: "Solo Baston Training Stick",
    category: "training-equipment",
    price: "₱980",
    priceAmount: 980,
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
    stock: 64,
    searchTags: ["solo baston", "training", "stick"],
  },
  {
    slug: "hardwood-kali-sticks",
    name: "Hardwood Kali Sticks",
    category: "training-equipment",
    price: "₱2,400",
    priceAmount: 2400,
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
    stock: 22,
    searchTags: ["kali", "hardwood", "training"],
  },
  {
    slug: "foam-trainer-sticks",
    name: "Foam Trainer Sticks",
    category: "training-equipment",
    price: "₱1,150",
    priceAmount: 1150,
    description: "Safe foam sticks for beginner seminars and youth programs.",
    summary:
      "High-density foam trainer sticks for first-time athletes, seminar drills, and youth introduction classes. Full-speed reps with reduced impact.",
    features: [
      "High-density foam core",
      "Flexible rattan-style flex",
      "Seminar and youth safe profile",
      "Pair included",
      "Ideal for Latayanology intro camps",
    ],
    specs: [
      { label: "Material", value: "Foam over composite core" },
      { label: "Quantity", value: "Pair (2 sticks)" },
      { label: "Profile", value: "Youth / beginner" },
      { label: "Use", value: "Training only" },
    ],
    competitionUse: "Training and seminar equipment only. Not approved for competition check-in.",
    tone: "from-zinc-800 via-red-900 to-black",
    stock: 55,
    searchTags: ["foam", "trainer", "youth", "seminar"],
  },
  {
    slug: "training-knife-trainer",
    name: "Training Knife Trainer",
    category: "training-equipment",
    price: "₱890",
    priceAmount: 890,
    description: "Rubber blade trainer for disarming and transition drills.",
    summary:
      "Flexible rubber training knife for disarming seminars, flow drills, and weapon transition work without live-blade risk.",
    features: [
      "Flexible rubber blade",
      "Secure training grip",
      "Seminar-safe profile",
      "Disarming drill compatible",
      "JT red handle accent",
    ],
    specs: [
      { label: "Material", value: "Rubber blade / polymer handle" },
      { label: "Length", value: "Standard training" },
      { label: "Color", value: "Black / Red" },
      { label: "Use", value: "Training only" },
    ],
    competitionUse: "Training equipment for disarming and seminar modules.",
    tone: "from-zinc-950 via-zinc-800 to-red-950",
    stock: 36,
    searchTags: ["knife", "trainer", "disarming"],
  },
  {
    slug: "competition-hand-wraps",
    name: "Competition Hand Wraps",
    category: "protective-equipment",
    price: "₱650",
    priceAmount: 650,
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
    stock: 120,
    searchTags: ["wraps", "hand", "protection"],
  },
  {
    slug: "groin-guard-pro",
    name: "Groin Guard Pro",
    category: "protective-equipment",
    price: "₱1,450",
    priceAmount: 1450,
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
    stock: 44,
    searchTags: ["groin", "guard", "protection"],
  },
  {
    slug: "mouth-guard-elite",
    name: "Mouth Guard Elite",
    category: "protective-equipment",
    price: "₱890",
    priceAmount: 890,
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
    stock: 72,
    searchTags: ["mouth guard", "dental", "protection"],
  },
  {
    slug: "shin-guards-pro",
    name: "Shin Guards Pro",
    category: "protective-equipment",
    price: "₱1,680",
    priceAmount: 1680,
    description: "Low-profile shin protection for kicking and check exchanges.",
    summary:
      "Competition shin guards with anatomical fit and secure sleeve system. Built for low-line kicks in Mano y Mano phases.",
    features: [
      "Anatomical low-profile shell",
      "Secure sleeve retention",
      "Breathable inner lining",
      "Approved for amateur divisions",
      "Pair included",
    ],
    specs: [
      { label: "Type", value: "Sleeve shin guard" },
      { label: "Sizes", value: "S — XL" },
      { label: "Quantity", value: "Pair" },
      { label: "Use", value: "Round 3 — Mano y Mano" },
    ],
    competitionUse: "Optional add-on protection for divisions allowing shin guards in empty-hand rounds.",
    tone: "from-zinc-900 via-red-800 to-black",
    stock: 28,
    searchTags: ["shin", "guards", "kicks"],
  },
  {
    slug: "jt-fight-shorts",
    name: "Juego Todo Fight Shorts",
    category: "apparel",
    price: "₱1,650",
    priceAmount: 1650,
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
    stock: 56,
    searchTags: ["shorts", "fight", "apparel"],
  },
  {
    slug: "jt-team-jersey",
    name: "Juego Todo Team Jersey",
    category: "apparel",
    price: "₱1,200",
    priceAmount: 1200,
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
    stock: 80,
    searchTags: ["jersey", "team", "training"],
  },
  {
    slug: "jt-hoodie-elite",
    name: "JT Elite Hoodie",
    category: "apparel",
    price: "₱2,450",
    priceAmount: 2450,
    description: "Premium heavyweight hoodie with embroidered JT crest.",
    summary:
      "Fan and athlete staple with heavyweight fleece, embroidered crest, and subtle red accent piping. Built for event nights and gym travel.",
    features: [
      "Heavyweight fleece interior",
      "Embroidered JT crest",
      "Kangaroo pocket with hidden phone slot",
      "Red accent piping",
      "Unisex relaxed fit",
    ],
    specs: [
      { label: "Fabric", value: "Cotton / poly fleece blend" },
      { label: "Fit", value: "Relaxed unisex" },
      { label: "Sizes", value: "S — 3XL" },
      { label: "Use", value: "Fan / athlete lifestyle" },
    ],
    competitionUse: "Lifestyle apparel. Not competition base gear.",
    tone: "from-black via-zinc-900 to-red-950",
    stock: 42,
    searchTags: ["hoodie", "apparel", "fan"],
  },
  {
    slug: "jt-cap-classic",
    name: "JT Classic Cap",
    category: "apparel",
    price: "₱780",
    priceAmount: 780,
    description: "Structured cap with 3D JT crest and red underbill.",
    summary:
      "Structured six-panel cap with embroidered crest and red underbill. Event-day essential for fans, corners, and gym staff.",
    features: [
      "Structured six-panel crown",
      "3D embroidered JT crest",
      "Red underbill accent",
      "Adjustable snapback",
      "Breathable eyelets",
    ],
    specs: [
      { label: "Closure", value: "Snapback" },
      { label: "Color", value: "Black / Red" },
      { label: "Crest", value: "3D embroidery" },
      { label: "Use", value: "Fan / corner wear" },
    ],
    competitionUse: "Corner and fan apparel.",
    tone: "from-zinc-950 via-zinc-800 to-red-900",
    stock: 90,
    searchTags: ["cap", "hat", "apparel"],
  },
  {
    slug: "championship-replica-belt",
    name: "Championship Replica Belt",
    category: "championship-collection",
    price: "₱8,500",
    priceAmount: 8500,
    description: "Premium replica JTGC championship belt for collectors and gyms.",
    summary:
      "Display-grade replica of the Juego Todo Grand Council championship belt. Metal plates, leather strap, and engraved division plate.",
    features: [
      "Display-grade metal plates",
      "Genuine leather strap",
      "Engraved division nameplate",
      "Collector presentation box",
      "Limited production run",
    ],
    specs: [
      { label: "Type", value: "Replica display belt" },
      { label: "Strap", value: "Leather" },
      { label: "Plates", value: "Metal alloy" },
      { label: "Edition", value: "Limited" },
    ],
    competitionUse: "Collector merchandise. Not awarded at events through shop purchase.",
    tone: "from-yellow-700 via-red-950 to-black",
    badge: "Limited",
    stock: 12,
    searchTags: ["belt", "champion", "replica", "collectible"],
  },
  {
    slug: "champion-jersey-signed",
    name: "Champion Jersey — Signed Edition",
    category: "championship-collection",
    price: "₱4,200",
    priceAmount: 4200,
    description: "Authenticated signed jersey from JTGC title holders.",
    summary:
      "Limited signed champion jersey with authentication card. Rotating athlete editions from current JTGC title holders.",
    features: [
      "Authenticated athlete signature",
      "Holographic authenticity card",
      "Official champion edition print",
      "Individually numbered",
      "Display-ready packaging",
    ],
    specs: [
      { label: "Edition", value: "Signed / numbered" },
      { label: "Auth", value: "Holographic card included" },
      { label: "Sizes", value: "M — XXL" },
      { label: "Use", value: "Collector merchandise" },
    ],
    competitionUse: "Collector merchandise linked to JTGC rankings and title history.",
    tone: "from-red-600 via-zinc-950 to-black",
    badge: "Exclusive",
    stock: 8,
    searchTags: ["signed", "champion", "jersey", "collectible"],
  },
  {
    slug: "signed-event-poster",
    name: "Signed Event Poster",
    category: "championship-collection",
    price: "₱1,950",
    priceAmount: 1950,
    description: "Limited signed poster from flagship JTGC events.",
    summary:
      "Cinematic event poster with athlete signatures from flagship cards. Museum-grade print on archival stock.",
    features: [
      "Archival print stock",
      "Multiple athlete signatures",
      "Event edition numbering",
      "Protective tube packaging",
      "Official JTGC event branding",
    ],
    specs: [
      { label: "Print", value: "Archival matte" },
      { label: "Size", value: "18 x 24 in" },
      { label: "Edition", value: "Event limited" },
      { label: "Use", value: "Collector merchandise" },
    ],
    competitionUse: "Event memorabilia tied to JTGC fight cards.",
    tone: "from-zinc-900 via-red-900 to-black",
    stock: 24,
    searchTags: ["poster", "signed", "event", "collectible"],
  },
  {
    slug: "stick-carry-bag",
    name: "Stick Carry Bag",
    category: "training-equipment",
    price: "₱750",
    priceAmount: 750,
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
    stock: 65,
    searchTags: ["bag", "carry", "gym"],
  },
  {
    slug: "jt-gym-towel",
    name: "Juego Todo Gym Towel",
    category: "training-equipment",
    price: "₱420",
    priceAmount: 420,
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
    stock: 100,
    searchTags: ["towel", "gym", "corner"],
  },
  {
    slug: "heavy-training-bag",
    name: "JT Heavy Training Bag",
    category: "training-equipment",
    price: "₱12,500",
    priceAmount: 12500,
    description: "Professional heavy bag for weapon and striking camps.",
    summary:
      "Professional-grade heavy bag with reinforced chains and JT branding. Built for affiliate gyms running Latayanology striking modules.",
    features: [
      "Professional-weight fill profile",
      "Reinforced mounting chains",
      "Durable synthetic shell",
      "JT branded panel",
      "Gym affiliate pricing available",
    ],
    specs: [
      { label: "Weight", value: "100 lb class" },
      { label: "Shell", value: "Synthetic leather" },
      { label: "Mount", value: "Chain included" },
      { label: "Use", value: "Gym / camp installation" },
    ],
    competitionUse: "Gym equipment for striking and conditioning modules.",
    tone: "from-zinc-950 via-red-950 to-black",
    stock: 6,
    searchTags: ["heavy bag", "gym", "training"],
  },
  {
    slug: "rules-handbook-digital",
    name: "JT Rules Handbook — Digital",
    category: "digital-products",
    price: "₱499",
    priceAmount: 499,
    description: "Complete digital rules library with scoring and equipment guides.",
    summary:
      "Instant-access digital handbook covering JTGC divisions, scoring, equipment standards, and medical protocols. Updated each season.",
    features: [
      "Instant digital download",
      "Full rules library PDF",
      "Equipment checklists",
      "Scoring reference charts",
      "Season update access",
    ],
    specs: [
      { label: "Format", value: "PDF + mobile reference" },
      { label: "Delivery", value: "Instant download" },
      { label: "Updates", value: "Season releases" },
      { label: "Use", value: "Officials / coaches / athletes" },
    ],
    competitionUse: "Official reference material for competition preparation.",
    tone: "from-red-900 via-zinc-950 to-black",
    digital: true,
    stock: 9999,
    searchTags: ["rules", "handbook", "digital", "pdf"],
  },
  {
    slug: "latayanology-fundamentals-course",
    name: "Latayanology Fundamentals — Digital Course",
    category: "digital-products",
    price: "₱2,999",
    priceAmount: 2999,
    description: "Video course covering JT weapon transitions and base drills.",
    summary:
      "Self-paced digital course with weapon transition modules, base drills, and competition prep pathways. Includes seminar credit voucher.",
    features: [
      "12-module video curriculum",
      "Downloadable drill sheets",
      "Seminar credit voucher included",
      "Athlete and coach tracks",
      "Lifetime platform access",
    ],
    specs: [
      { label: "Format", value: "Streaming + downloads" },
      { label: "Modules", value: "12 chapters" },
      { label: "Access", value: "Lifetime" },
      { label: "Use", value: "Training / education" },
    ],
    competitionUse: "Education product aligned with JTGC athlete development pathways.",
    tone: "from-zinc-900 via-red-800 to-black",
    digital: true,
    badge: "Popular",
    stock: 9999,
    searchTags: ["course", "latayanology", "training", "digital"],
  },
  {
    slug: "seminar-access-pass",
    name: "Seminar Access Pass — Digital",
    category: "digital-products",
    price: "₱1,500",
    priceAmount: 1500,
    description: "Digital pass redeemable for one JTGC seminar registration.",
    summary:
      "Redeemable digital pass for official Juego Todo seminars. Apply at checkout on the seminar calendar for Disarming, Striking, Legs, or Grappling modules.",
    features: [
      "One seminar redemption",
      "Valid for 12 months",
      "Transferable once",
      "Works with paid seminar tiers",
      "Linked to member profile",
    ],
    specs: [
      { label: "Format", value: "Digital voucher code" },
      { label: "Validity", value: "12 months" },
      { label: "Redemption", value: "Seminar calendar" },
      { label: "Use", value: "Education / registration" },
    ],
    competitionUse: "Seminar registration product for athlete and coach development.",
    tone: "from-red-950 via-black to-zinc-900",
    digital: true,
    stock: 9999,
    searchTags: ["seminar", "pass", "digital", "registration"],
  },
];

export const shopProducts: ShopProduct[] = [
  ...legacyShopProducts,
  ...merchandiseProducts,
  ...eventTicketProducts,
].filter((product) => Boolean(product.imageSrc));

export function getShopProduct(slug: string) {
  return shopProducts.find((product) => product.slug === slug);
}

export function getProductsByCategory(category: ShopCategory) {
  return shopProducts.filter((product) => product.category === category);
}

export function searchProducts(query: string, category?: ShopCategory) {
  const normalized = query.trim().toLowerCase();
  return shopProducts.filter((product) => {
    const matchesCategory = !category || product.category === category;
    if (!normalized) {
      return matchesCategory;
    }

    const haystack = [
      product.name,
      product.description,
      product.summary,
      ...product.searchTags,
    ]
      .join(" ")
      .toLowerCase();

    return matchesCategory && haystack.includes(normalized);
  });
}
