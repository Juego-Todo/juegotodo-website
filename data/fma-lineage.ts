export type FmaLineageStyle = {
  slug: string;
  name: string;
  alternateNames: string[];
  origin: string;
  lineageFocus: string;
  juegoTodoRole: string;
  principles: string[];
  accent: string;
};

export const fmaLineageStyles: FmaLineageStyle[] = [
  {
    slug: "arnis",
    name: "Arnis",
    alternateNames: ["Balintawak", "Modern Arnis"],
    origin: "Luzon & Visayas weapon traditions",
    lineageFocus:
      "Stick and blade rhythm, angle theory, and live weapon timing passed through generations of Filipino instructors.",
    juegoTodoRole:
      "Core weapon discipline in Juego Todo's Doble, Solo Baston, and Mano divisions with broadcast-ready pacing.",
    principles: ["Angle control", "Live stick timing", "Disarming entries", "Footwork rhythm"],
    accent: "from-red-700 via-zinc-950 to-yellow-900",
  },
  {
    slug: "eskrima",
    name: "Eskrima",
    alternateNames: ["Escrima", "Estocada"],
    origin: "Cebuano blade and stick schools",
    lineageFocus:
      "Close-range blade intelligence, counter-for-counter flow, and tactical stick work rooted in Visayan combat culture.",
    juegoTodoRole:
      "Informs weapon transition rules, clinch-to-stick entries, and the technical language used in JT officiating.",
    principles: ["Blade awareness", "Counter timing", "Close-range traps", "Combat flow"],
    accent: "from-zinc-950 via-red-950 to-black",
  },
  {
    slug: "kali",
    name: "Kali",
    alternateNames: ["Pagbabalik", "Kali-Silat crossover"],
    origin: "Southern Philippines & Mindanao systems",
    lineageFocus:
      "Seamless transitions between weapon, empty hand, and grappling ranges with emphasis on adaptability under pressure.",
    juegoTodoRole:
      "Shapes Juego Todo's hybrid ruleset where athletes move between weapon phases and open-range striking.",
    principles: ["Range transitions", "Weapon retention", "Adaptive entries", "Flow under pressure"],
    accent: "from-black via-zinc-900 to-red-950",
  },
  {
    slug: "panuntukan",
    name: "Panuntukan",
    alternateNames: ["Suntukan", "Filipino Boxing"],
    origin: "Urban striking traditions across Luzon",
    lineageFocus:
      "Dirty boxing, limb destruction, elbow entries, and head movement adapted from street-proven Filipino striking.",
    juegoTodoRole:
      "Defines the striking foundation inside Juego Todo's Mano and mixed-range bouts with elbow and clinch integration.",
    principles: ["Head movement", "Limb destruction", "Elbow entries", "Inside boxing"],
    accent: "from-red-900 via-zinc-950 to-amber-950",
  },
  {
    slug: "sikaran",
    name: "Sikaran",
    alternateNames: ["Filipino Kickboxing"],
    origin: "Rizal province kicking lineage",
    lineageFocus:
      "Dynamic kicking angles, sweeps, foot traps, and explosive lower-body attacks from traditional harvest-festival combat.",
    juegoTodoRole:
      "Powers the Legs seminar track and kicking-heavy divisions with emphasis on balance, sweeps, and fight IQ.",
    principles: ["Angular kicks", "Foot traps", "Sweep entries", "Distance control"],
    accent: "from-zinc-950 via-stone-950 to-red-900",
  },
  {
    slug: "dumog",
    name: "Dumog",
    alternateNames: ["Filipino Grappling", "Trankada"],
    origin: "Visayan & Mindanao clinch systems",
    lineageFocus:
      "Clinch control, off-balancing, body locks, and standing grappling entries designed for real combat pressure.",
    juegoTodoRole:
      "Anchors Juego Todo's Grappling seminar curriculum and clinch phases inside caged competition formats.",
    principles: ["Clinch dominance", "Off-balancing", "Body locks", "Takedown entries"],
    accent: "from-red-800 via-black to-zinc-900",
  },
  {
    slug: "buno",
    name: "Buno",
    alternateNames: ["Filipino Wrestling", "Hinikkit"],
    origin: "Indigenous wrestling traditions",
    lineageFocus:
      "Native wrestling rides, pins, takedowns, and ground control preserved through regional martial communities.",
    juegoTodoRole:
      "Supports ground phases, ride control scoring, and the wrestling layer inside Juego Todo's hybrid rules.",
    principles: ["Takedown entries", "Ride control", "Pin transitions", "Ground pressure"],
    accent: "from-black via-red-950 to-zinc-950",
  },
  {
    slug: "yaw-yan",
    name: "Yaw-Yan",
    alternateNames: ["Sayaw ng Kamatayan", "Filipino Kickboxing"],
    origin: "Napoleon Fernandez lineage",
    lineageFocus:
      "High-impact angular kicks, spinning attacks, and knockout-oriented striking built for modern combat arenas.",
    juegoTodoRole:
      "Brings explosive finishing mechanics to Juego Todo striking divisions and highlight-reel broadcast moments.",
    principles: ["Angular kicks", "Spinning attacks", "Knockout intent", "Aggressive pacing"],
    accent: "from-zinc-900 via-red-900 to-black",
  },
];
