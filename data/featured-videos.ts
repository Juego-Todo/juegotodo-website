export type FeaturedVideo = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  youtubeId: string;
};

export const featuredVideos: FeaturedVideo[] = [
  {
    id: "laban-ng-lahat",
    title: "Juego Todo — Laban Ng Lahat",
    subtitle: "Juego Todo",
    category: "Event Coverage",
    youtubeId: "VPEGVuxKDAI",
  },
  {
    id: "making-changes-fma",
    title: "Juego Todo is Making Changes in Filipino Martial Arts",
    subtitle: "Juego Todo",
    category: "Brand Story",
    youtubeId: "LsCnJmz8ooA",
  },
  {
    id: "grabe-sa-latay",
    title: "JUEGO TODO — GRABE SA LATAY!",
    subtitle: "Juego Todo",
    category: "Fight Highlights",
    youtubeId: "t0tw6ewxSPo",
  },
  {
    id: "sta-lucia-barrio-brawls-4",
    title: "Sta. Lucia Barrio Brawls 4",
    subtitle: "Barrio Brawls",
    category: "Event Coverage",
    youtubeId: "mtdChT32hGM",
  },
  {
    id: "official-music-video",
    title: "JUEGO TODO Official Music Video",
    subtitle: "Juego Todo",
    category: "Music",
    youtubeId: "o0SFZZZ8X2k",
  },
];

export function getYouTubeThumbnail(youtubeId: string, quality: "hq" | "sd" | "max" = "sd") {
  const file =
    quality === "max" ? "maxresdefault.jpg" : quality === "sd" ? "sddefault.jpg" : "hqdefault.jpg";
  return `https://img.youtube.com/vi/${youtubeId}/${file}`;
}

export function getYouTubeThumbnailFallbacks(youtubeId: string) {
  return [
    getYouTubeThumbnail(youtubeId, "max"),
    getYouTubeThumbnail(youtubeId, "sd"),
    getYouTubeThumbnail(youtubeId, "hq"),
  ];
}
