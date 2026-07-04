"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { featuredVideos, getYouTubeThumbnail } from "@/data/featured-videos";

export function VideoCarousel() {
  const [activeId, setActiveId] = useState(featuredVideos[0].id);
  const activeVideo = featuredVideos.find((video) => video.id === activeId) ?? featuredVideos[0];

  return (
    <section className="relative overflow-hidden border-t border-white/[0.08] bg-[#050505] py-16 sm:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,16,16,0.1),transparent_40rem)]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-[#FF1010]">Broadcast Library</p>
          <h2 className="font-display mt-3 text-5xl uppercase leading-none text-white sm:text-7xl">
            Featured Videos
          </h2>
        </div>

        <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-black shadow-[0_30px_100px_rgba(0,0,0,0.45)] sm:mt-10">
          <div className="relative aspect-video w-full bg-black">
            <iframe
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?rel=0&modestbranding=1`}
              title={activeVideo.title}
            />
          </div>
          <div className="border-t border-white/[0.08] bg-[#0a0a0a] px-4 py-4 sm:px-5 sm:py-5">
            <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-[#FF1010]">
              {activeVideo.category}
            </p>
            <h3 className="mt-1 font-display text-2xl uppercase leading-none text-white sm:text-3xl">
              {activeVideo.title}
            </h3>
            <p className="mt-2 text-sm text-zinc-400">{activeVideo.subtitle}</p>
          </div>
        </div>

        <div className="-mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:thin] sm:mx-0 sm:mt-8 sm:px-0 lg:grid lg:grid-cols-6 lg:overflow-visible lg:pb-0">
          {featuredVideos.map((video, index) => {
            const isActive = video.id === activeId;

            return (
              <motion.button
                className={`group relative min-w-[16rem] snap-start overflow-hidden rounded-[1.25rem] border text-left transition sm:min-w-[18rem] lg:min-w-0 ${
                  isActive
                    ? "border-[#FF1010]/60 shadow-[0_0_28px_rgba(255,16,16,0.25)]"
                    : "border-white/[0.08] hover:border-[#FF1010]/30"
                }`}
                key={video.id}
                onClick={() => setActiveId(video.id)}
                type="button"
                initial={{ opacity: 0, y: 16 }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <div className="relative aspect-video overflow-hidden bg-zinc-900">
                  <Image
                    alt=""
                    aria-hidden
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    fill
                    sizes="(max-width: 1024px) 16rem, 20vw"
                    src={getYouTubeThumbnail(video.youtubeId)}
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(0,0,0,0.88))]" />
                  <div
                    className={`absolute inset-0 transition ${isActive ? "bg-[#FF1010]/15" : "bg-black/20 group-hover:bg-black/10"}`}
                  />
                  <span
                    className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full p-2.5 transition ${
                      isActive ? "bg-[#FF1010] text-white" : "bg-black/55 text-white group-hover:bg-[#FF1010]"
                    }`}
                  >
                    <Play size={18} aria-hidden />
                  </span>
                </div>
                <div className="bg-[#0D0D0D] p-3">
                  <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">
                    {video.category}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-white">{video.title}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
