"use client";

import { ArrowUpRight, ExternalLink, Mic2, Newspaper, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { MotionSection } from "@/components/MotionSection";
import { newsArticles, mediaClips, podcastEpisodes } from "@/data/media-assets";
import { getYouTubeThumbnailFallbacks } from "@/data/featured-videos";

type VideoItem = { id: string; title: string; href: string; youtubeId: string };

function formatPublishedDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Manila",
  });
}

function YouTubeThumbnail({ youtubeId, title }: { youtubeId: string; title: string }) {
  const fallbacks = getYouTubeThumbnailFallbacks(youtubeId);
  const [srcIndex, setSrcIndex] = useState(0);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- YouTube CDN thumbnails
    <img
      alt=""
      aria-hidden
      className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
      onError={() => setSrcIndex((current) => (current < fallbacks.length - 1 ? current + 1 : current))}
      src={fallbacks[srcIndex]}
      title={title}
    />
  );
}

function VideoLibrarySection({
  id,
  eyebrow,
  title,
  description,
  videos,
  badgeLabel,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  videos: VideoItem[];
  badgeLabel: string;
}) {
  const [activeId, setActiveId] = useState(videos[0]?.id ?? "");
  const activeVideo = videos.find((video) => video.id === activeId) ?? videos[0];

  if (!activeVideo) {
    return null;
  }

  return (
    <section className="scroll-mt-28" id={id}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#FF1010]">{eyebrow}</p>
          <h2 className="font-display mt-2 text-4xl uppercase leading-none text-white sm:text-5xl">{title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">{description}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-300">
          {videos.length} {badgeLabel}
        </span>
      </div>

      <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-black shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
        <div className="relative aspect-video w-full bg-black">
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?rel=0&modestbranding=1`}
            title={activeVideo.title}
          />
        </div>
        <div className="flex flex-col gap-3 border-t border-white/[0.08] bg-[#0a0a0a] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-5">
          <div className="min-w-0">
            <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-[#FF1010]">Latest</p>
            <h3 className="mt-1 font-display text-2xl uppercase leading-none text-white sm:text-3xl">
              {activeVideo.title}
            </h3>
          </div>
          <a
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-200 transition hover:border-[#FF1010]/40 hover:text-white"
            href={activeVideo.href}
            rel="noopener noreferrer"
            target="_blank"
          >
            Watch on YouTube
            <ExternalLink size={14} aria-hidden />
          </a>
        </div>
      </div>

      <div className="-mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:thin] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((video) => {
          const isActive = video.id === activeId;
          return (
            <button
              className={`group relative min-w-[16rem] snap-start overflow-hidden rounded-[1.25rem] border text-left transition sm:min-w-0 ${
                isActive
                  ? "border-[#FF1010]/60 shadow-[0_0_28px_rgba(255,16,16,0.25)]"
                  : "border-white/[0.08] hover:border-[#FF1010]/30"
              }`}
              key={video.id}
              onClick={() => setActiveId(video.id)}
              type="button"
            >
              <div className="relative aspect-video overflow-hidden bg-zinc-900">
                <YouTubeThumbnail title={video.title} youtubeId={video.youtubeId} />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(0,0,0,0.88))]" />
                <span
                  className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full p-2.5 transition ${
                    isActive ? "bg-[#FF1010] text-white" : "bg-black/55 text-white group-hover:bg-[#FF1010]"
                  }`}
                >
                  <Play size={18} aria-hidden />
                </span>
              </div>
              <div className="bg-[#0D0D0D] p-3">
                <p className="line-clamp-3 text-sm font-semibold leading-5 text-white">{video.title}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function NewsSection() {
  const [featured, ...rest] = newsArticles;

  return (
    <section className="scroll-mt-28" id="news">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#FF1010]">Press & Coverage</p>
          <h2 className="font-display mt-2 text-4xl uppercase leading-none text-white sm:text-5xl">News</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            Official articles and media coverage on Juego Todo, Filipino weaponized combat sports, and the JTGC
            movement.
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-300">
          {newsArticles.length} Articles
        </span>
      </div>

      {featured ? (
        <a
          className="group mt-6 block overflow-hidden rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_80%_0%,rgba(229,9,20,0.35),transparent_28rem),linear-gradient(135deg,#120305,#050506)] transition hover:border-[#FF1010]/40"
          href={featured.href}
          rel="noopener noreferrer"
          target="_blank"
        >
          <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-end sm:p-8">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.16em] text-emerald-200">
                  Latest
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  {formatPublishedDate(featured.publishedAt)}
                </span>
              </div>
              <h3 className="font-display mt-4 text-3xl uppercase leading-none text-white sm:text-5xl">
                {featured.title}
              </h3>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base">
                Read the full article in our official media archive.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#FF1010] px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-white transition group-hover:bg-[#ff2828]">
              Read Article
              <ArrowUpRight size={16} aria-hidden />
            </span>
          </div>
        </a>
      ) : null}

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((article) => (
          <a
            className="glass-panel group flex h-full flex-col rounded-[1.35rem] p-5 transition hover:-translate-y-1 hover:border-[#FF1010]/35"
            href={article.href}
            key={article.id}
            rel="noopener noreferrer"
            target="_blank"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-3 text-red-300">
                <Newspaper size={20} aria-hidden />
              </div>
              <span className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                {formatPublishedDate(article.publishedAt)}
              </span>
            </div>
            <h3 className="mt-5 flex-1 font-display text-2xl uppercase leading-tight text-white">{article.title}</h3>
            <span className="mt-5 inline-flex items-center text-xs font-black uppercase tracking-[0.16em] text-red-200 transition group-hover:text-white">
              Open Article
              <ExternalLink className="ml-2" size={14} aria-hidden />
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

export function MediaHub() {
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) {
      return;
    }
    const target = document.getElementById(hash);
    if (target) {
      window.setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    }
  }, []);

  return (
    <MotionSection className="mx-auto max-w-7xl space-y-16 pb-14 sm:space-y-20 sm:pb-20">
      <nav
        aria-label="Media sections"
        className="sticky top-20 z-20 -mx-1 flex flex-wrap gap-2 rounded-full border border-white/10 bg-black/80 p-2 backdrop-blur-md"
      >
        {[
          { label: "News", href: "#news" },
          { label: "Media Clips", href: "#clips" },
          { label: "Podcast", href: "#podcast" },
        ].map((item) => (
          <a
            className="rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-300 transition hover:bg-white/10 hover:text-white"
            href={item.href}
            key={item.href}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <NewsSection />

      <VideoLibrarySection
        badgeLabel="Clips"
        description="Fight highlights, event coverage, athlete features, and viral moments from the Juego Todo broadcast library."
        eyebrow="YouTube"
        id="clips"
        title="Media Clips"
        videos={mediaClips}
      />

      <VideoLibrarySection
        badgeLabel="Episodes"
        description="Goatism — league interviews, fight-week breakdowns, and coach roundtables from the official Juego Todo podcast."
        eyebrow="Goatism Podcast"
        id="podcast"
        title="Podcast"
        videos={podcastEpisodes}
      />

      <section className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-3 text-red-300">
            <Mic2 size={20} aria-hidden />
          </div>
          <div>
            <h2 className="font-display text-3xl uppercase text-white sm:text-4xl">Subscribe & Follow</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-400">
              New clips and podcast episodes are added to this hub as they publish. Follow Juego Todo on YouTube for
              the latest fight coverage.
            </p>
            <a
              className="mt-4 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-red-200 transition hover:text-white"
              href="https://www.youtube.com/@JuegoTodo"
              rel="noopener noreferrer"
              target="_blank"
            >
              Juego Todo on YouTube
              <ExternalLink size={14} aria-hidden />
            </a>
          </div>
        </div>
      </section>
    </MotionSection>
  );
}
