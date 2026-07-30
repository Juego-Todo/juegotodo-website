import { mediaClips } from "@/data/media-assets";

export type FeaturedVideo = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  youtubeId: string;
};

/** Homepage carousel — latest media clips from the official library. */
export const featuredVideos: FeaturedVideo[] = mediaClips.slice(0, 5).map((clip) => ({
  id: clip.id,
  title: clip.title,
  subtitle: "Juego Todo",
  category: "Media Clip",
  youtubeId: clip.youtubeId,
}));

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
