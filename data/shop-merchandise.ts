import type { ShopProduct } from "@/data/shop";

const shirtSizes = ["S", "M", "L", "XL", "2XL"].map((size) => ({
  id: size.toLowerCase(),
  label: size,
}));

const premiumShirtSizes = [...shirtSizes, { id: "3xl", label: "3XL" }];

const fightSizes = ["S", "M", "L", "XL", "XXL"].map((size) => ({
  id: size.toLowerCase(),
  label: size,
}));

const helmetSizes = ["S", "M", "L", "XL"].map((size) => ({
  id: size.toLowerCase(),
  label: size,
}));

export const merchandiseProducts: ShopProduct[] = [
  {
    slug: "jt-competition-helmet",
    name: "Juego Todo Competition Helmet",
    category: "competition-equipment",
    price: "₱3,450",
    priceAmount: 3450,
    description: "Official Juego Todo weaponized competition headgear with face cage and tribal flaps.",
    summary:
      "Premium JTGC competition helmet built for Doble Baston, Solo Baston, and Mano Y Mano exchanges. Choose your colorway and size for sanctioned event check-in.",
    features: [
      "Ventilated competition shell with full face cage",
      "Tribal-pattern men flaps for neck and shoulder protection",
      "Blue Premium, Red, and Red Premium colorways",
      "Adjustable fit for adult competition divisions",
      "Official Juego Todo branding on front flap",
    ],
    specs: [
      { label: "Shell", value: "Impact-resistant composite" },
      { label: "Sizes", value: "S — XL" },
      { label: "Colorways", value: "Blue Premium / Red / Red Premium" },
      { label: "Use", value: "JTGC weaponized competition" },
    ],
    competitionUse: "Required head protection in divisions where helmet use is mandated at check-in.",
    tone: "from-red-950 via-black to-zinc-900",
    badge: "Best Seller",
    stock: 24,
    rating: 4.9,
    reviewCount: 112,
    searchTags: ["helmet", "headgear", "juego todo", "competition", "blue", "red"],
    imageSrc: "/shop/products/juego-todo-red-helmet.png",
    variantGroups: [
      {
        id: "color",
        label: "Helmet Color",
        options: [
          {
            id: "blue-premium",
            label: "Blue Premium",
            imageSrc: "/shop/products/juego-todo-blue-helmet-premium.png",
            priceAmount: 4249,
          },
          {
            id: "red",
            label: "Red",
            imageSrc: "/shop/products/juego-todo-red-helmet.png",
            priceAmount: 3450,
          },
          {
            id: "red-premium",
            label: "Red Premium",
            imageSrc: "/shop/products/juego-todo-red-helmet-premium.png",
            priceAmount: 4249,
          },
        ],
      },
      {
        id: "size",
        label: "Size",
        options: helmetSizes,
      },
    ],
  },
  {
    slug: "juego-todo-id-lanyard",
    name: "Juego Todo ID Lanyard",
    category: "apparel",
    price: "₱199",
    priceAmount: 199,
    description: "Official Juego Todo and UGB event lanyards with breakaway buckle and swivel hook.",
    summary:
      "Collect every official JTGC and UGB collaboration lanyard in one product line. Pick your design for credentials, corners, and event access.",
    features: [
      "Breakaway side-release buckle",
      "Metal swivel hook attachment",
      "Official Juego Todo and UGB print runs",
      "Lightweight event-day wear",
      "Multiple collaboration designs available",
    ],
    specs: [
      { label: "Price", value: "₱199 per lanyard" },
      { label: "Hardware", value: "Breakaway buckle + swivel hook" },
      { label: "Designs", value: "4 official print variants" },
      { label: "Use", value: "Events / credentials / fan merch" },
    ],
    competitionUse: "Event credential accessory for JTGC cards, seminars, and official fight weeks.",
    tone: "from-red-900 via-zinc-950 to-black",
    stock: 120,
    searchTags: ["lanyard", "id lace", "ugb", "juego todo", "accessory"],
    imageSrc: "/shop/products/juego-todo-id-lace.png",
    variantGroups: [
      {
        id: "design",
        label: "Lanyard Design",
        options: [
          {
            id: "juego-todo-id-lace",
            label: "Juego Todo ID Lace",
            imageSrc: "/shop/products/juego-todo-id-lace.png",
          },
          {
            id: "ugb-x-juego-todo-id-lace",
            label: "UGB x Juego Todo ID Lace",
            imageSrc: "/shop/products/ugb-x-juego-todo-id-lace.png",
          },
          {
            id: "ugb-id-lace",
            label: "UGB 13th Anniversary ID Lace",
            imageSrc: "/shop/products/ugb-id-lace.png",
          },
          {
            id: "ugb-x-juego-todo-lace-2",
            label: "UGB x Juego Todo Lace 2",
            imageSrc: "/shop/products/ugb-x-juego-todo-lace-2.png",
          },
        ],
      },
    ],
  },
  {
    slug: "juego-todo-shirt",
    name: "Juego Todo Shirt",
    category: "apparel",
    price: "₱699",
    priceAmount: 699,
    description: "Official Juego Todo graphic tees with front and back league branding.",
    summary:
      "Fan and fighter-ready Juego Todo shirts in black with multiple official chest graphics. Select your design and size for walkout, gym, and event days.",
    features: [
      "Premium black cotton-feel tee body",
      "Official Juego Todo sleeve crest",
      "Multiple front graphic designs",
      "The Evolution of FMA back mark on select runs",
      "Sizes from S through 2XL",
    ],
    specs: [
      { label: "Price", value: "₱699" },
      { label: "Color", value: "Black" },
      { label: "Sizes", value: "S — 2XL" },
      { label: "Designs", value: "Classic, Ato Ni Bai, Barrio Brawls, Mandirigma, Arnisador" },
    ],
    competitionUse: "Official fan and athlete apparel for JTGC events and gym representation.",
    tone: "from-zinc-900 via-red-950 to-black",
    badge: "New Arrival",
    stock: 96,
    searchTags: ["shirt", "tee", "apparel", "juego todo", "barrio brawls", "mandirigma"],
    imageSrc: "/shop/products/juego-todo-tshirt-classic.png",
    variantGroups: [
      {
        id: "design",
        label: "Shirt Design",
        options: [
          {
            id: "classic",
            label: "Classic",
            imageSrc: "/shop/products/juego-todo-tshirt-classic.png",
          },
          {
            id: "ato-ni-bai",
            label: "Ato Ni Bai",
            imageSrc: "/shop/products/juego-todo-tshirt-ato-ni-bai.png",
          },
          {
            id: "barrio-brawls",
            label: "Barrio Brawls",
            imageSrc: "/shop/products/juego-todo-tshirt-classic.png",
          },
          {
            id: "mandirigma",
            label: "Mandirigma",
            imageSrc: "/shop/products/juego-todo-tshirt-mandirigma.png",
          },
          {
            id: "arnisador",
            label: "Arnisador",
            imageSrc: "/shop/products/juego-todo-tshirt-arnisador.png",
          },
        ],
      },
      {
        id: "size",
        label: "Size",
        options: shirtSizes,
      },
    ],
  },
  {
    slug: "juego-todo-premium-shirt",
    name: "Juego Todo Premium Shirt",
    category: "apparel",
    price: "₱999",
    priceAmount: 999,
    description: "Premium event shirts including JTC and UGB 13th Anniversary editions.",
    summary:
      "Higher-detail event shirts for championship weeks and anniversary drops. Choose between the JTC event graphic or the UGB 13th Anniversary run.",
    features: [
      "Premium event-weight tee construction",
      "Large front and back event graphics",
      "Official JTC and UGB collaboration artwork",
      "Sizes from S through 3XL",
      "Limited event-run styling",
    ],
    specs: [
      { label: "Price", value: "₱999" },
      { label: "Designs", value: "JTC Event / UGB 13th" },
      { label: "Sizes", value: "S — 3XL" },
      { label: "Use", value: "Event shirts / premium fan merch" },
    ],
    competitionUse: "Event merchandise aligned with JTGC cards and UGB anniversary programming.",
    tone: "from-red-900 via-black to-zinc-950",
    badge: "Limited Drop",
    stock: 64,
    searchTags: ["shirt", "jtc", "ugb", "event shirt", "premium"],
    imageSrc: "/shop/products/juego-todo-tshirt-jtc.png",
    variantGroups: [
      {
        id: "design",
        label: "Shirt Design",
        options: [
          {
            id: "jtc-event",
            label: "JTC Event Shirt",
            imageSrc: "/shop/products/juego-todo-tshirt-jtc.png",
          },
          {
            id: "ugb-13th",
            label: "UGB 13th Shirt",
            imageSrc: "/shop/products/ugb-tshirt-13th.png",
          },
        ],
      },
      {
        id: "size",
        label: "Size",
        options: premiumShirtSizes,
      },
    ],
  },
  {
    slug: "juego-todo-fight-shorts",
    name: "Juego Todo Fight Shorts",
    category: "apparel",
    price: "₱1,249",
    priceAmount: 1249,
    description: "JT fight shorts with tribal pattern panels in Design B and Design C.",
    summary:
      "Competition-ready fight shorts built for JTGC athletes. Choose between Design B and Design C pattern runs with full size coverage.",
    features: [
      "Lightweight competition short cut",
      "Tribal geometric panel artwork",
      "Elastic waistband with drawcord",
      "Juego Todo leg branding",
      "Design B and Design C options",
    ],
    specs: [
      { label: "Price", value: "₱1,249" },
      { label: "Designs", value: "Design B / Design C" },
      { label: "Sizes", value: "S — XXL" },
      { label: "Use", value: "Walkout / competition / training" },
    ],
    competitionUse: "Walkout and competition apparel for registered JTGC athletes.",
    tone: "from-zinc-950 via-red-950 to-black",
    stock: 48,
    searchTags: ["shorts", "fight shorts", "jt short", "apparel"],
    imageSrc: "/shop/products/jt-short-design-b.png",
    variantGroups: [
      {
        id: "design",
        label: "Short Design",
        options: [
          {
            id: "design-b",
            label: "Design B",
            imageSrc: "/shop/products/jt-short-design-b.png",
          },
          {
            id: "design-c",
            label: "Design C",
            imageSrc: "/shop/products/jt-short-design-c.png",
          },
        ],
      },
      {
        id: "size",
        label: "Size",
        options: fightSizes,
      },
    ],
  },
  {
    slug: "juego-todo-trucker-cap",
    name: "Juego Todo Trucker Cap",
    category: "apparel",
    price: "₱499",
    priceAmount: 499,
    description: "Official Juego Todo trucker cap with mesh back and Philippines crest print.",
    summary:
      "Classic JTGC trucker cap with structured front panel, breathable mesh back, and official Philippines crest artwork. Available in black and red.",
    features: [
      "Structured front panel with mesh back",
      "Official Juego Todo Philippines crest",
      "Snapback-style fit",
      "Black and red colorways",
      "Event-day and everyday wear",
    ],
    specs: [
      { label: "Price", value: "₱499" },
      { label: "Colors", value: "Black / Red" },
      { label: "Fit", value: "Adjustable trucker cap" },
      { label: "Use", value: "Fan merch / corners / events" },
    ],
    competitionUse: "Official fan and corner apparel for JTGC events.",
    tone: "from-red-950 via-black to-zinc-900",
    stock: 72,
    searchTags: ["cap", "trucker cap", "hat", "apparel"],
    imageSrc: "/shop/products/juego-todo-trucker-cap.png",
    variantGroups: [
      {
        id: "color",
        label: "Cap Color",
        options: [
          { id: "black", label: "Black" },
          { id: "red", label: "Red" },
        ],
      },
    ],
  },
  {
    slug: "juego-todo-sleeveless-hoodie",
    name: "Juego Todo Sleeveless Hoodie",
    category: "apparel",
    price: "₱1,249",
    priceAmount: 1249,
    description: "Sleeveless hoodies in Design B and Design C with weaponized caged fighting branding.",
    summary:
      "Warm-up and walkout sleeveless hoodies featuring JT tribal artwork and hex-badge back branding. Choose your design and size.",
    features: [
      "Sleeveless hoodie cut for warm-ups",
      "Tribal pattern body artwork",
      "Hex-badge back branding",
      "Design B and Design C options",
      "Sizes from S through XXL",
    ],
    specs: [
      { label: "Price", value: "₱1,249" },
      { label: "Designs", value: "Design B / Design C" },
      { label: "Sizes", value: "S — XXL" },
      { label: "Use", value: "Warm-up / walkout / gym" },
    ],
    competitionUse: "Athlete warm-up apparel for JTGC fight weeks and gym training.",
    tone: "from-zinc-900 via-red-950 to-black",
    stock: 36,
    searchTags: ["hoodie", "sleeveless", "apparel", "warm-up"],
    imageSrc: "/shop/products/juego-todo-sleeveless-design-b.png",
    variantGroups: [
      {
        id: "design",
        label: "Hoodie Design",
        options: [
          {
            id: "design-b",
            label: "Design B",
            imageSrc: "/shop/products/juego-todo-sleeveless-design-b.png",
          },
          {
            id: "design-c",
            label: "Design C",
            imageSrc: "/shop/products/jt-hoodie-sleeveless-design-c.png",
          },
        ],
      },
      {
        id: "size",
        label: "Size",
        options: fightSizes,
      },
    ],
  },
];
