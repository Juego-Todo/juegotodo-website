"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, ExternalLink, Play, X } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

export type YouTubePopupVideo = {
  title: string;
  youtubeId: string;
  href?: string;
  subtitle?: string;
};

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function YouTubeVideoPopup({
  video,
  onClose,
}: {
  video: YouTubePopupVideo | null;
  onClose: () => void;
}) {
  const mounted = useIsClient();

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

  if (!mounted) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {video ? (
        <>
          <motion.button
            animate={{ opacity: 1 }}
            aria-label="Close video"
            className="fixed inset-0 z-[80] bg-black/88 backdrop-blur-sm"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={onClose}
            type="button"
          />
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            aria-label={video.title}
            aria-modal="true"
            className="fixed inset-x-3 top-[max(1rem,env(safe-area-inset-top))] z-[81] mx-auto w-auto max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-[0_40px_100px_rgba(0,0,0,0.75)] sm:inset-x-6 sm:top-[8vh]"
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
    </AnimatePresence>,
    document.body,
  );
}

/** Choice sheet: watch on-page or open YouTube. */
export function YouTubeWatchChooser({
  video,
  onClose,
  onWatchHere,
}: {
  video: YouTubePopupVideo | null;
  onClose: () => void;
  onWatchHere: () => void;
}) {
  const mounted = useIsClient();

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

  if (!mounted) {
    return null;
  }

  const youtubeHref =
    video?.href ?? (video ? `https://www.youtube.com/watch?v=${video.youtubeId}` : "#");

  return createPortal(
    <AnimatePresence>
      {video ? (
        <>
          <motion.button
            animate={{ opacity: 1 }}
            aria-label="Dismiss"
            className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={onClose}
            type="button"
          />
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            aria-label={`Watch ${video.title}`}
            aria-modal="true"
            className="fixed inset-x-0 bottom-0 z-[81] mx-auto max-w-lg rounded-t-3xl border border-white/10 bg-[#121212] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-20px_60px_rgba(0,0,0,0.55)] sm:inset-x-auto sm:bottom-8 sm:left-1/2 sm:w-full sm:-translate-x-1/2 sm:rounded-3xl sm:pb-5"
            exit={{ opacity: 0, y: 24 }}
            initial={{ opacity: 0, y: 24 }}
            role="dialog"
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20 sm:hidden" aria-hidden />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-[#FF1010]">Watch</p>
                <h2 className="mt-1 line-clamp-2 text-base font-semibold leading-snug text-white">{video.title}</h2>
              </div>
              <button
                aria-label="Close"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-white/5 hover:text-white"
                onClick={onClose}
                type="button"
              >
                <X size={18} aria-hidden />
              </button>
            </div>

            <div className="mt-5 grid gap-2.5">
              <button
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#FF1010] px-5 text-sm font-bold text-white transition hover:bg-[#ff2a2a] active:scale-[0.99]"
                onClick={onWatchHere}
                type="button"
              >
                <Play size={16} fill="currentColor" aria-hidden />
                Watch here
              </button>
              <a
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 text-sm font-bold text-white transition hover:bg-white/[0.08] active:scale-[0.99]"
                href={youtubeHref}
                onClick={onClose}
                rel="noopener noreferrer"
                target="_blank"
              >
                <ExternalLink size={16} aria-hidden />
                Open in YouTube
              </a>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
