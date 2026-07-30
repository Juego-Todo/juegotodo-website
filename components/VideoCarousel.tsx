"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { useCallback, useState } from "react";
import { YouTubeVideoPopup } from "@/components/YouTubeVideoPopup";
import { featuredVideos, getYouTubeThumbnailFallbacks } from "@/data/featured-videos";

function VideoThumbnail({ youtubeId, title }: { youtubeId: string; title: string }) {
  const fallbacks = getYouTubeThumbnailFallbacks(youtubeId);
  const [srcIndex, setSrcIndex] = useState(0);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- YouTube CDN thumbnails bypass Next image optimization, which fails locally on TLS.
    <img
      alt=""
      aria-hidden
      className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
      decoding="async"
      loading="lazy"
      onError={() => {
        setSrcIndex((current) => (current < fallbacks.length - 1 ? current + 1 : current));
      }}
      src={fallbacks[srcIndex]}
      title={title}
    />
  );
}

export function VideoCarousel() {
  const [activeVideo, setActiveVideo] = useState<(typeof featuredVideos)[number] | null>(null);
  const closePopup = useCallback(() => setActiveVideo(null), []);

  return (
    <section className="relative overflow-hidden border-t border-white/[0.08] bg-[#050505] py-16 sm:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,16,16,0.1),transparent_40rem)]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-[#FF1010]">Broadcast Library</p>
          <h2 className="font-display mt-3 text-4xl uppercase leading-none text-white sm:text-6xl">
            Featured Videos
          </h2>
        </div>

        <div className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:thin] sm:mx-0 sm:mt-10 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 xl:grid-cols-5">
          {featuredVideos.map((video, index) => (
            <motion.button
              className="group relative min-w-[16rem] snap-start overflow-hidden rounded-[1.25rem] border border-white/[0.08] text-left transition hover:border-[#FF1010]/40 sm:min-w-0"
              initial={{ opacity: 0, y: 16 }}
              key={video.id}
              onClick={() => setActiveVideo(video)}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              type="button"
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div className="relative aspect-video overflow-hidden bg-zinc-900">
                <VideoThumbnail title={video.title} youtubeId={video.youtubeId} />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(0,0,0,0.88))]" />
                <div className="absolute inset-0 bg-black/20 transition group-hover:bg-black/10" />
                <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 p-2.5 text-white transition group-hover:bg-[#FF1010]">
                  <Play size={18} aria-hidden />
                </span>
              </div>
              <div className="bg-[#0D0D0D] p-3">
                <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">
                  {video.category}
                </p>
                <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-white">{video.title}</p>
                <p className="mt-1 text-xs text-zinc-500">Tap to play</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <YouTubeVideoPopup
        onClose={closePopup}
        video={
          activeVideo
            ? {
                title: activeVideo.title,
                youtubeId: activeVideo.youtubeId,
                href: `https://www.youtube.com/watch?v=${activeVideo.youtubeId}`,
                subtitle: activeVideo.subtitle,
              }
            : null
        }
      />
    </section>
  );
}
