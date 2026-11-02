"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { copy } from "@/lib/i18n";
import KeregeFillers from "@/components/kerege-fillers";
import { latticeCell, latticeWidth } from "@/lib/kerege";

// The media page: pictures set in a кереге lattice (as in the federation's photo archive), coloured
// "threads" filter by category, and pictures open like the lid of a carved "сандык" (chest).

export type MediaCategory = "tournaments" | "players" | "horses" | "federation";
export type MediaEntry = { id: string; src: string; caption: string; category: MediaCategory; videoUrl?: string };

type MediaPageProps = { locale: Locale; items: MediaEntry[] };

// YouTube link → video id (watch, youtu.be and shorts links), for the privacy-friendly embed.
export function youtubeId(url = "") {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return match?.[1] ?? null;
}

export default function MediaPage({ locale, items }: MediaPageProps) {
  const labels = copy[locale];
  const threads: [MediaCategory | "all", string][] = [
    ["all", labels.threadAll],
    ["tournaments", labels.threadTournaments],
    ["players", labels.threadPlayers],
    ["horses", labels.threadHorses],
    ["federation", labels.threadFederation],
  ];
  const [thread, setThread] = useState<MediaCategory | "all">("all");
  const [open, setOpen] = useState<number | null>(null);
  const shown = thread === "all" ? items : items.filter((item) => item.category === thread);
  const desktopK = latticeWidth(shown.length, 5);
  const current = open === null ? null : shown[open];
  const videoId = youtubeId(current?.videoUrl);

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
    <section className="media-page section-wrap" id="media">
      <div className="section-heading">
        <div><p className="eyebrow">{labels.mediaLabel}</p><h2>{labels.mediaTitle}</h2></div>
      </div>

      {/* Жиптер: coloured threads that filter the tapestry */}
      <div className="media-threads" role="tablist" aria-label={labels.mediaTitle}>
        {threads.filter(([id]) => id === "all" || items.some((item) => item.category === id)).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={thread === id} className={`thread thread-${id}${thread === id ? " is-active" : ""}`} onClick={() => { setThread(id); setOpen(null); }}>
            {label}
          </button>
        ))}
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
                  {item.videoUrl && <span className="kerege-play" aria-hidden="true"><Play size={20} /></span>}
                  <span className="kerege-caption">{item.caption}</span>
                </span>
              </button>
            );
          })}
          <KeregeFillers count={shown.length} desktopK={desktopK} usedPhotos={shown.map((item) => item.src)} />
        </div>
      </div>
      {!shown.length && <p className="empty-note">{labels.mediaEmpty}</p>}

      {/* Сандык: the viewer opens like a chest lid */}
      {current && open !== null && <div className="sandyk" role="dialog" aria-modal="true" aria-label={current.caption} onClick={() => setOpen(null)}>
        <figure className="sandyk-lid" key={current.id} onClick={(event) => event.stopPropagation()}>
          {videoId
            ? <div className="sandyk-video"><iframe src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`} title={current.caption} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /></div>
            : <Image src={current.src} alt={current.caption} width={1800} height={1200} unoptimized />}
          <figcaption>{current.caption}<span>{open + 1} / {shown.length}</span></figcaption>
        </figure>
        <button type="button" className="sandyk-close" onClick={() => setOpen(null)} aria-label={labels.close} autoFocus><X size={24} /></button>
        {shown.length > 1 && <>
          <button type="button" className="sandyk-arrow is-prev" onClick={(event) => { event.stopPropagation(); setOpen((open - 1 + shown.length) % shown.length); }} aria-label={labels.prevPhoto}><ChevronLeft size={30} /></button>
          <button type="button" className="sandyk-arrow is-next" onClick={(event) => { event.stopPropagation(); setOpen((open + 1) % shown.length); }} aria-label={labels.nextPhoto}><ChevronRight size={30} /></button>
        </>}
      </div>}
    </section>
  );
}
