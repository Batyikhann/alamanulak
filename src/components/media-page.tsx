"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { copy } from "@/lib/i18n";
import KeregeFillers from "@/components/kerege-fillers";
import { latticeCell } from "@/lib/kerege";

// The media page: pictures set in a кереге lattice (as in the federation's photo archive), opening like
// the lid of a carved "сандык" (chest); the wide lattice is five diamonds across and two lines deep
// (5 + 4 = 9 pictures). Below it, the federation's YouTube videos as YouTube-style cards.

export type MediaCategory = "tournaments" | "players" | "horses" | "federation";
export type MediaEntry = { id: string; src: string; caption: string; category: MediaCategory; videoUrl?: string };

export type MediaVideo = { id: string; youtubeId: string; title: string; date?: string };
type MediaPageProps = { locale: Locale; items: MediaEntry[]; videos: MediaVideo[]; channel: string };

// Demo videos until the federation's own are added in the admin (media items with a YouTube link).
const demoVideos: { youtubeId: string; titleKy: string; titleRu: string; date: string }[] = [
  { youtubeId: "hODzVR8NSCw", titleKy: "Улак тартыш – кыргыздын улуттук ат оюну", titleRu: "Улак тартыш – национальная конная игра кыргызов", date: "2026-10-28" },
  { youtubeId: "MxbTDemgmnU", titleKy: "Дүйнөлүк көчмөндөр оюндары 2016: финал, Кыргызстан – Казакстан", titleRu: "Всемирные игры кочевников 2016: финал, Кыргызстан – Казахстан", date: "2026-10-21" },
  { youtubeId: "7IR6PLjKA7g", titleKy: "Көк бөрү: оюндун эң кызыктуу учурлары", titleRu: "Кок-бору: самые яркие моменты игры", date: "2026-10-14" },
  { youtubeId: "iUXp_OpjJo4", titleKy: "Дүйнөлүк көчмөндөр оюндары 2018 – көк бөрү", titleRu: "Всемирные игры кочевников 2018 – кок-бору", date: "2026-10-07" },
  { youtubeId: "UVPagGN8PFE", titleKy: "Соң-Көлдөгү улак тартыш жана күрөш", titleRu: "Улак тартыш и куреш на Сон-Куле", date: "2026-09-30" },
  { youtubeId: "ryiSfjsF86s", titleKy: "Дүйнөлүк көчмөндөр оюндары 2018: Алтай – Монголия", titleRu: "Всемирные игры кочевников 2018: Алтай – Монголия", date: "2026-09-23" },
  { youtubeId: "GDlf0y_ahwY", titleKy: "Көк бөрү: эң коркунучтуу учурлар", titleRu: "Кок-бору: самые опасные моменты", date: "2026-09-16" },
  { youtubeId: "7jIvE4X6EDY", titleKy: "Дүйнөлүк көчмөндөр оюндары 2018: Красноярск – АКШ", titleRu: "Всемирные игры кочевников 2018: Красноярск – США", date: "2026-09-09" },
];

function videoDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}.${month}.${year}`;
}

// Two lattice lines on wide screens: five diamonds, then four tucked between them.
const mediaPageSize = 9;

// YouTube link → video id (watch, youtu.be and shorts links), for the privacy-friendly embed.
export function youtubeId(url = "") {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return match?.[1] ?? null;
}

export default function MediaPage({ locale, items, videos, channel }: MediaPageProps) {
  const labels = copy[locale];
  const [open, setOpen] = useState<number | null>(null);
  const [openVideo, setOpenVideo] = useState<number | null>(null);
  // Pictures in the lattice; videos have their own section below it.
  const shown = items.filter((item) => !item.videoUrl).slice(0, mediaPageSize);
  const desktopK = 5;
  const current = open === null ? null : shown[open];
  const videoList = videos.length ? videos : demoVideos.map((video) => ({ id: video.youtubeId, youtubeId: video.youtubeId, title: locale === "ky" ? video.titleKy : video.titleRu, date: video.date }));
  const playing = openVideo === null ? null : videoList[openVideo];

  useEffect(() => {
    if (openVideo === null) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpenVideo(null); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openVideo]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
      if (event.key === "ArrowRight") setOpen((index) => index === null ? null : (index + 1) % shown.length);
      if (event.key === "ArrowLeft") setOpen((index) => index === null ? null : (index - 1 + shown.length) % shown.length);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, shown.length]);

  return (
    <>
    {/* Photos and videos are separate home-row bands: their shades alternate, a brass rule between them */}
    <section className="home-row media-photos" id="media">
      <div className="section-wrap">
        <div className="section-heading">
          <div><p className="eyebrow">{labels.mediaLabel}</p><h2>{labels.mediaTitle}</h2></div>
        </div>

        {/* Кереге: the pictures as the yurt's lattice wall, like the federation's photo archive */}
        <div className="kerege" style={{ "--cols-d": desktopK * 2, "--cols-m": 4 } as CSSProperties}>
          <div className="kerege-grid">
            {shown.map((item, index) => {
              const desktop = latticeCell(index, desktopK);
              const mobile = latticeCell(index, 2);
              return (
                <button
                  type="button"
                  className="kerege-cell"
                  key={item.id}
                  style={{ "--dc": desktop.col, "--dr": desktop.row, "--mc": mobile.col, "--mr": mobile.row } as CSSProperties}
                  onClick={() => setOpen(index)}
                  aria-label={item.caption}
                >
                  <span className="kerege-photo">
                    <Image src={item.src} alt="" width={800} height={800} unoptimized />
                    <span className="kerege-caption">{item.caption}</span>
                  </span>
                </button>
              );
            })}
            <KeregeFillers count={shown.length} desktopK={desktopK} usedPhotos={shown.map((item) => item.src)} total={mediaPageSize} />
          </div>
        </div>
        {!shown.length && <p className="empty-note">{labels.mediaEmpty}</p>}
      </div>
    </section>

    {/* Videos: YouTube-style cards (thumbnail, then the channel, title and date below it) */}
    <section className="home-row media-videos">
      <div className="section-wrap">
        <div className="section-heading">
          <div><p className="eyebrow">{labels.videosLabel}</p><h2>{labels.videosTitle}</h2></div>
        </div>
        <div className="video-grid">
          {videoList.map((video, index) => (
            <button type="button" className="video-card" key={video.id} onClick={() => setOpenVideo(index)}>
              <span className="video-thumb">
                <Image src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`} alt="" width={480} height={360} unoptimized />
                <span className="video-play" aria-hidden="true"><Play size={22} /></span>
              </span>
              <span className="video-meta">
                <span className="video-avatar" aria-hidden="true" />
                <span className="video-text">
                  <strong>{video.title}</strong>
                  <small>{channel}</small>
                  {video.date && <small>{videoDate(video.date)}</small>}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>

    {playing && <div className="sandyk" role="dialog" aria-modal="true" aria-label={playing.title} onClick={() => setOpenVideo(null)}>
        <figure className="sandyk-lid" key={playing.id} onClick={(event) => event.stopPropagation()}>
          <div className="sandyk-video"><iframe src={`https://www.youtube-nocookie.com/embed/${playing.youtubeId}?autoplay=1`} title={playing.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /></div>
          <figcaption>{playing.title}<span>{channel}</span></figcaption>
        </figure>
        <button type="button" className="sandyk-close" onClick={() => setOpenVideo(null)} aria-label={labels.close} autoFocus><X size={24} /></button>
      </div>}

      {/* Сандык: the viewer opens like a chest lid */}
      {current && open !== null && <div className="sandyk" role="dialog" aria-modal="true" aria-label={current.caption} onClick={() => setOpen(null)}>
        <figure className="sandyk-lid" key={current.id} onClick={(event) => event.stopPropagation()}>
          <Image src={current.src} alt={current.caption} width={1800} height={1200} unoptimized />
          <figcaption>{current.caption}<span>{open + 1} / {shown.length}</span></figcaption>
        </figure>
        <button type="button" className="sandyk-close" onClick={() => setOpen(null)} aria-label={labels.close} autoFocus><X size={24} /></button>
        {shown.length > 1 && <>
          <button type="button" className="sandyk-arrow is-prev" onClick={(event) => { event.stopPropagation(); setOpen((open - 1 + shown.length) % shown.length); }} aria-label={labels.prevPhoto}><ChevronLeft size={30} /></button>
          <button type="button" className="sandyk-arrow is-next" onClick={(event) => { event.stopPropagation(); setOpen((open + 1) % shown.length); }} aria-label={labels.nextPhoto}><ChevronRight size={30} /></button>
        </>}
      </div>}
    </>
  );
}
