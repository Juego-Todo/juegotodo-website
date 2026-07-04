export type FeaturedVideo = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  youtubeId: string;
};

export const featuredVideos: FeaturedVideo[] = [
  {
    id: "reyes-welterweight-gold",
    title: "Reyes Retains Welterweight Gold",
    subtitle: "Miguel Reyes",
    category: "Fight Highlights",
    youtubeId: "LXb3EKWsInQ",
  },
  {
    id: "santos-mendoza-sequence",
    title: "Santos vs Mendoza Full Sequence",
    subtitle: "Ana Santos",
    category: "Fight Highlights",
    youtubeId: "ysz5S6PUM-U",
  },
  {
    id: "night-of-blades-main",
    title: "Night of Blades Main Event",
    subtitle: "Juego Todo",
    category: "Fight Highlights",
    youtubeId: "aqz-KE-bpKQ",
  },
  {
    id: "spinning-back-elbow",
    title: "Spinning Back Elbow Finish",
    subtitle: "Isabel Mendoza",
    category: "Knockouts",
    youtubeId: "ScMzIvxBSi4",
  },
  {
    id: "doble-baston-patterns",
    title: "Doble Baston Entry Patterns",
    subtitle: "LATAYANOLOGY",
    category: "Techniques",
    youtubeId: "e-ORfe18gpU",
  },
  {
    id: "road-to-ascension",
    title: "Road to Ascension Manila",
    subtitle: "Miguel Reyes",
    category: "Athlete Stories",
    youtubeId: "kJQP7kiw5Fk",
  },
];

export function getYouTubeThumbnail(youtubeId: string, quality: "hq" | "max" = "hq") {
  const file = quality === "max" ? "maxresdefault.jpg" : "hqdefault.jpg";
  return `https://img.youtube.com/vi/${youtubeId}/${file}`;
}
