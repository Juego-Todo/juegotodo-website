"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { useState } from "react";
import { videoCategories } from "@/data/site";

export function VideoCarousel() {
  const [activeCategory, setActiveCategory] = useState(videoCategories[0].id);

  const category = videoCategories.find((item) => item.id === activeCategory) ?? videoCategories[0];

  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-[#FF1010]">Broadcast Library</p>
            <h2 className="font-display mt-3 text-5xl uppercase leading-none text-white sm:text-7xl">
              Featured Videos
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {videoCategories.map((item) => (
              <button
                className={`rounded-full px-4 py-2 text-[0.65rem] font-black uppercase tracking-[0.16em] transition sm:text-xs ${
                  activeCategory === item.id
                    ? "bg-[#FF1010] text-white shadow-[0_0_24px_rgba(255,16,16,0.35)]"
                    : "border border-white/[0.08] bg-[#0D0D0D] text-zinc-400 hover:text-white"
                }`}
                key={item.id}
                onClick={() => setActiveCategory(item.id)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="-mx-4 mt-8 flex snap-x gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:thin] sm:mx-0 sm:mt-10 sm:px-0">
          {category.videos.map((video, index) => (
            <motion.article
              className="video-card group relative min-w-[17rem] snap-center overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-[#0D0D0D] sm:min-w-[20rem]"
              initial={{ opacity: 0, x: 24 }}
              key={video.title}
              transition={{ delay: index * 0.06 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <div className={`relative aspect-video bg-gradient-to-br ${video.tone}`}>
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(0,0,0,0.85))]" />
                <div className="video-preview absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                  <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_50%_50%,rgba(255,16,16,0.35),transparent_60%)]" />
                </div>
                <Play
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF1010] p-3 text-white shadow-[0_0_30px_rgba(255,16,16,0.5)] transition group-hover:scale-110"
                  size={28}
                  aria-hidden
                />
                <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[0.6rem] font-black uppercase tracking-[0.16em] text-white">
                  {video.duration}
                </span>
              </div>
              <div className="p-4">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-[#FF1010]">{category.label}</p>
                <h3 className="mt-2 text-base font-bold text-white">{video.title}</h3>
                <p className="mt-2 text-sm text-zinc-500">{video.fighter}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
