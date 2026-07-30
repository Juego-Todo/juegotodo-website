"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import { useEffect } from "react";

export type YouTubePopupVideo = {
  title: string;
  youtubeId: string;
  href?: string;
  subtitle?: string;
};

export function YouTubeVideoPopup({
  video,
  onClose,
}: {
  video: YouTubePopupVideo | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!video) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [video, onClose]);

  return (
    <AnimatePresence>
      {video ? (
        <>
          <motion.button
            animate={{ opacity: 1 }}
            aria-label="Close video"
            className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-sm"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={onClose}
            type="button"
          />
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            aria-label={video.title}
            aria-modal="true"
            className="fixed inset-x-3 top-[8vh] z-[71] mx-auto w-auto max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-[0_40px_100px_rgba(0,0,0,0.75)] sm:inset-x-6 sm:top-[10vh]"
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            role="dialog"
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] px-4 py-3.5 sm:px-5">
              <div className="min-w-0">
                <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-[#FF1010]">Now Playing</p>
                <h2 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-white sm:text-base">
                  {video.title}
                </h2>
                {video.subtitle ? <p className="mt-1 truncate text-xs text-zinc-500">{video.subtitle}</p> : null}
              </div>
              <button
                aria-label="Close video"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 text-zinc-400 transition hover:bg-white/5 hover:text-white"
                onClick={onClose}
                type="button"
              >
                <X size={18} aria-hidden />
              </button>
            </div>

            <div className="relative aspect-video w-full bg-black">
              <iframe
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                title={video.title}
              />
            </div>

            <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
              {video.href ? (
                <a
                  className="inline-flex min-h-10 items-center gap-1 text-sm font-medium text-[#007AFF] transition hover:text-[#4da3ff]"
                  href={video.href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Open in YouTube
                  <ChevronRight size={14} aria-hidden />
                </a>
              ) : (
                <span />
              )}
              <button
                className="inline-flex min-h-10 items-center rounded-full border border-white/10 px-4 text-xs font-bold uppercase tracking-[0.14em] text-zinc-300 transition hover:bg-white/5 hover:text-white"
                onClick={onClose}
                type="button"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
