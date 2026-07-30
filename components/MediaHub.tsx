"use client";

import { ChevronRight, Play } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MotionSection } from "@/components/MotionSection";
import { JsonLd } from "@/components/JsonLd";
import { YouTubeVideoPopup, YouTubeWatchChooser } from "@/components/YouTubeVideoPopup";
import { newsArticles, mediaClips, podcastEpisodes } from "@/data/media-assets";
import { getYouTubeThumbnailFallbacks } from "@/data/featured-videos";
import { mediaHubJsonLd } from "@/lib/seo/json-ld";

type Channel = "news" | "clips" | "podcast";
type VideoItem = { id: string; title: string; href: string; youtubeId: string };

const CHANNELS: { id: Channel; label: string; hash: string }[] = [
  { id: "news", label: "News", hash: "news" },
  { id: "clips", label: "Clips", hash: "clips" },
  { id: "podcast", label: "Podcast", hash: "podcast" },
];

const INITIAL_VISIBLE = 8;

function formatPublishedDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Manila",
  });
}

function hashToChannel(hash: string): Channel | null {
  if (hash === "news" || hash === "clips" || hash === "podcast") {
    return hash;
  }
  return null;
}

function YouTubeThumbnail({ youtubeId, title, className }: { youtubeId: string; title: string; className?: string }) {
  const fallbacks = getYouTubeThumbnailFallbacks(youtubeId);
  const [srcIndex, setSrcIndex] = useState(0);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- YouTube CDN thumbnails
    <img
      alt=""
      aria-hidden
      className={className ?? "h-full w-full object-cover"}
      decoding="async"
      loading="lazy"
      onError={() => setSrcIndex((current) => (current < fallbacks.length - 1 ? current + 1 : current))}
      src={fallbacks[srcIndex]}
      title={title}
    />
  );
}

function SegmentedControl({
  value,
  onChange,
}: {
  value: Channel;
  onChange: (channel: Channel) => void;
}) {
  return (
    <div
      className="flex rounded-full bg-white/[0.08] p-1"
      role="tablist"
      aria-label="Media channels"
    >
      {CHANNELS.map((channel) => {
        const active = value === channel.id;
        return (
          <button
            aria-selected={active}
            className={`flex-1 rounded-full px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
              active
                ? "bg-white text-black shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
            key={channel.id}
            onClick={() => onChange(channel.id)}
            role="tab"
            type="button"
          >
            {channel.label}
          </button>
        );
      })}
    </div>
  );
}

function ListRow({
  title,
  subtitle,
  onClick,
  href,
  leading,
}: {
  title: string;
  subtitle?: string;
  onClick?: () => void;
  href?: string;
  leading: ReactNode;
}) {
  const className =
    "flex w-full items-center gap-3 border-b border-white/[0.06] py-3.5 text-left transition hover:bg-white/[0.03] active:scale-[0.99]";

  const content = (
    <>
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-900">{leading}</div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[0.9375rem] font-medium leading-snug text-white">{title}</p>
        {subtitle ? <p className="mt-0.5 truncate text-xs text-zinc-500">{subtitle}</p> : null}
      </div>
      <ChevronRight className="shrink-0 text-zinc-600" size={18} aria-hidden />
    </>
  );

  if (href) {
    return (
      <a className={className} href={href} rel="noopener noreferrer" target="_blank">
        {content}
      </a>
    );
  }

  return (
    <button className={className} onClick={onClick} type="button">
      {content}
    </button>
  );
}

function NewsChannel() {
  const [featured, ...rest] = newsArticles;

  return (
    <div className="space-y-6" id="news" role="tabpanel">
      {featured ? (
        <a
          className="block overflow-hidden rounded-2xl bg-white/[0.04] p-5 transition active:scale-[0.99] sm:p-6"
          href={featured.href}
          rel="noopener noreferrer"
          target="_blank"
        >
          <p className="text-xs font-medium text-zinc-500">{formatPublishedDate(featured.publishedAt)}</p>
          <h3 className="mt-2 text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl">
            {featured.title}
          </h3>
          <p className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#FF1010]">
            Read story
            <ChevronRight size={16} aria-hidden />
          </p>
        </a>
      ) : null}

      {rest.length > 0 ? (
        <div className="overflow-hidden rounded-2xl bg-white/[0.03] px-4">
          {rest.map((article) => (
            <ListRow
              href={article.href}
              key={article.id}
              leading={
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950">
                  <span className="text-lg font-semibold text-zinc-500">News</span>
                </div>
              }
              subtitle={formatPublishedDate(article.publishedAt)}
              title={article.title}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function VideoChannel({
  id,
  videos,
  emptyLabel,
}: {
  id: string;
  videos: VideoItem[];
  emptyLabel: string;
}) {
  const [chooserVideo, setChooserVideo] = useState<VideoItem | null>(null);
  const [playingVideo, setPlayingVideo] = useState<VideoItem | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const visibleVideos = useMemo(() => videos.slice(0, visibleCount), [videos, visibleCount]);
  const hasMore = visibleCount < videos.length;
  const closeChooser = useCallback(() => setChooserVideo(null), []);
  const closePlayer = useCallback(() => setPlayingVideo(null), []);

  if (videos.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4" id={id} role="tabpanel">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-zinc-400">{emptyLabel}</h3>
        <span className="text-xs text-zinc-600">{videos.length} total</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {visibleVideos.map((video) => (
          <button
            className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] text-left transition hover:border-[#FF1010]/35 hover:bg-white/[0.05] active:scale-[0.99]"
            key={video.id}
            onClick={() => setChooserVideo(video)}
            type="button"
          >
            <div className="relative aspect-video overflow-hidden bg-zinc-950">
              <YouTubeThumbnail
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                title={video.title}
                youtubeId={video.youtubeId}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-black shadow-lg transition group-hover:scale-105">
                <Play size={20} fill="currentColor" aria-hidden />
              </span>
            </div>
            <div className="px-3.5 py-3">
              <p className="line-clamp-2 text-sm font-semibold leading-snug text-white">{video.title}</p>
              <p className="mt-1 text-xs font-medium text-zinc-500">Watch here or on YouTube</p>
            </div>
          </button>
        ))}
      </div>

      {hasMore ? (
        <button
          className="w-full rounded-2xl bg-white/[0.06] py-3.5 text-sm font-semibold text-white transition hover:bg-white/[0.1] active:scale-[0.99]"
          onClick={() => setVisibleCount((count) => count + INITIAL_VISIBLE)}
          type="button"
        >
          Show more
        </button>
      ) : null}

      <YouTubeWatchChooser
        onClose={closeChooser}
        onWatchHere={() => {
          if (chooserVideo) {
            setPlayingVideo(chooserVideo);
          }
          setChooserVideo(null);
        }}
        video={chooserVideo}
      />
      <YouTubeVideoPopup onClose={closePlayer} video={playingVideo} />
    </div>
  );
}

export function MediaHub() {
  const [channel, setChannel] = useState<Channel>(() => {
    if (typeof window === "undefined") {
      return "news";
    }
    return hashToChannel(window.location.hash.replace("#", "")) ?? "news";
  });

  const selectChannel = useCallback((next: Channel) => {
    setChannel(next);
    const hash = CHANNELS.find((entry) => entry.id === next)?.hash;
    if (hash) {
      window.history.replaceState(null, "", `#${hash}`);
    }
  }, []);

  useEffect(() => {
    function onHashChange() {
      const fromHash = hashToChannel(window.location.hash.replace("#", ""));
      if (fromHash) {
        setChannel(fromHash);
      }
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <MotionSection className="mx-auto max-w-2xl pb-14 sm:max-w-3xl sm:pb-20 lg:max-w-4xl">
      <JsonLd
        data={mediaHubJsonLd({
          articles: newsArticles,
          clips: mediaClips,
          podcasts: podcastEpisodes,
        })}
      />

      <div className="sticky top-[4.5rem] z-20 -mx-4 bg-[#050505]/90 px-4 pb-4 pt-1 backdrop-blur-xl sm:top-24 sm:mx-0 sm:px-0">
        <SegmentedControl onChange={selectChannel} value={channel} />
      </div>

      <div className="mt-2">
        {channel === "news" ? <NewsChannel /> : null}
        {channel === "clips" ? (
          <VideoChannel emptyLabel="All clips" id="clips" videos={mediaClips} />
        ) : null}
        {channel === "podcast" ? (
          <VideoChannel emptyLabel="All episodes" id="podcast" videos={podcastEpisodes} />
        ) : null}
      </div>

      <p className="mt-10 text-center text-xs text-zinc-600">
        <a
          className="font-medium text-zinc-500 transition hover:text-zinc-300"
          href="https://www.youtube.com/@JuegoTodo"
          rel="noopener noreferrer"
          target="_blank"
        >
          Follow @JuegoTodo on YouTube
        </a>
      </p>
    </MotionSection>
  );
}
