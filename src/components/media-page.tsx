"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, FolderOpen, Images, Maximize2, Play, X } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { copy } from "@/lib/i18n";
import { type FilterField } from "@/components/filter-bar";
import PageLead from "@/components/page-lead";
import { SearchPanel, useHashKind } from "@/components/search-panel";
import { shuffled } from "@/lib/shuffle";

// The media page: a Video / Photo switch on top, then one of the two (videos until one is chosen). Videos are the federation's YouTube videos
// as YouTube-style cards; photos are a Pinterest-style wall of pins in columns, each opening like the lid of a
// carved "сандык" (chest). On phones, a keyword search with a line above it: Video / Photo as text links on the
// left, the filter (section and year) on the right.
// Wider screens have room for all of it in one row: a button that switches to the other kind (it
// names only that one), the search, and the filter. The choice is kept in the address (#videos, #photos).
// Each visit has its own order: the first 20 show, and 12 more each time the end of the list comes into view.

export type MediaCategory = "tournaments" | "players" | "horses" | "federation";
export type MediaEntry = { id: string; src: string; caption: string; category: MediaCategory; videoUrl?: string; date?: string };

export type MediaVideo = { id: string; youtubeId: string; title: string; date?: string; category?: MediaCategory };
type MediaPageProps = { locale: Locale; items: MediaEntry[]; videos: MediaVideo[]; orderSeed: number };

// Demo videos until the federation's own are added in the admin (media items with a YouTube link).
const demoVideos: { youtubeId: string; titleKy: string; titleRu: string; date: string; category: MediaCategory }[] = [
  { youtubeId: "hODzVR8NSCw", titleKy: "Улак тартыш – кыргыздын улуттук ат оюну", titleRu: "Улак тартыш – национальная конная игра кыргызов", date: "2026-10-28", category: "federation" },
  { youtubeId: "MxbTDemgmnU", titleKy: "Дүйнөлүк көчмөндөр оюндары 2016: финал, Кыргызстан – Казакстан", titleRu: "Всемирные игры кочевников 2016: финал, Кыргызстан – Казахстан", date: "2026-10-21", category: "tournaments" },
  { youtubeId: "7IR6PLjKA7g", titleKy: "Көк бөрү: оюндун эң кызыктуу учурлары", titleRu: "Кок-бору: самые яркие моменты игры", date: "2026-10-14", category: "players" },
  { youtubeId: "iUXp_OpjJo4", titleKy: "Дүйнөлүк көчмөндөр оюндары 2018 – көк бөрү", titleRu: "Всемирные игры кочевников 2018 – кок-бору", date: "2026-10-07", category: "tournaments" },
  { youtubeId: "UVPagGN8PFE", titleKy: "Соң-Көлдөгү улак тартыш жана күрөш", titleRu: "Улак тартыш и куреш на Сон-Куле", date: "2026-09-30", category: "federation" },
  { youtubeId: "ryiSfjsF86s", titleKy: "Дүйнөлүк көчмөндөр оюндары 2018: Алтай – Монголия", titleRu: "Всемирные игры кочевников 2018: Алтай – Монголия", date: "2026-09-23", category: "tournaments" },
  { youtubeId: "GDlf0y_ahwY", titleKy: "Көк бөрү: эң коркунучтуу учурлар", titleRu: "Кок-бору: самые опасные моменты", date: "2025-09-16", category: "players" },
  { youtubeId: "7jIvE4X6EDY", titleKy: "Дүйнөлүк көчмөндөр оюндары 2018: Красноярск – АКШ", titleRu: "Всемирные игры кочевников 2018: Красноярск – США", date: "2025-09-09", category: "tournaments" },
  { youtubeId: "vl4qXI-YGO8", titleKy: "Көк бөрү финалы: Кыргызстан – Казакстан, 2026", titleRu: "Финал кок-бору: Кыргызстан – Казахстан, 2026", date: "2026-11-01", category: "tournaments" },
  { youtubeId: "mjDbz-F_zWE", titleKy: "Кыргызстан 6-Дүйнөлүк көчмөндөр оюндарында көк бөрүдөн чемпион болду", titleRu: "Кыргызстан — чемпион по кок-бору на 6-х Всемирных играх кочевников", date: "2026-10-25", category: "tournaments" },
  { youtubeId: "Cbafh1kyPfU", titleKy: "Көчмөндөр оюндары: Орусия – Тажикстан, көк бөрү", titleRu: "Игры кочевников: Россия – Таджикистан, кок-бору", date: "2026-10-18", category: "tournaments" },
  { youtubeId: "bqP0eecPQ1o", titleKy: "Дүйнөлүк көчмөндөр оюндарынын ичинде: жаа атуу, аркан тартуу, көк бөрү", titleRu: "Внутри Всемирных игр кочевников: стрельба из лука, перетягивание каната, кок-бору", date: "2026-10-11", category: "federation" },
  { youtubeId: "9un2eWLisCo", titleKy: "Байыркы оюндар жанданган Кыргызстандын көчмөндөр оюндары", titleRu: "Игры кочевников Кыргызстана, где оживают древние состязания", date: "2026-10-04", category: "federation" },
  { youtubeId: "ahlEwJr7vRc", titleKy: "Көк бөрү-2025, I лига: Жаш-Тилек – Алайку (түз эфир)", titleRu: "Кок-бору-2025, I лига: Жаш-Тилек – Алайку (прямой эфир)", date: "2026-09-27", category: "tournaments" },
  { youtubeId: "IMOSERKgfeo", titleKy: "Чек арасыз көк бөрү: улуттук оюн Орусияда", titleRu: "Кок-бору без границ: как национальная игра Кыргызстана покоряет Россию", date: "2026-09-20", category: "federation" },
  { youtubeId: "yNyQc_UnlJU", titleKy: "Аламан улак тартыш – байгеге Мерседес", titleRu: "Аламан улак тартыш — приз Мерседес", date: "2026-09-13", category: "tournaments" },
  { youtubeId: "28fitk_3Y7M", titleKy: "Алайкуудагы улак тартыш", titleRu: "Улак тартыш в Алайкуу", date: "2026-09-06", category: "federation" },
  { youtubeId: "uN63p5XP5SY", titleKy: "Улак тартыш. Кыргыз жигиттери", titleRu: "Улак тартыш. Кыргызские джигиты", date: "2026-08-30", category: "players" },
  { youtubeId: "csqlPrO0H0w", titleKy: "Көчмөндөрдүн руху! Улак тартыш", titleRu: "Дух кочевников! Улак тартыш", date: "2026-08-23", category: "federation" },
  { youtubeId: "OEDJPiKv5DY", titleKy: "Кыргызстан. Көк бөрү – эр жүрөктөрдүн оюну", titleRu: "Кыргызстан. Кок-бору — мужские игры бесстрашных", date: "2026-08-16", category: "players" },
  { youtubeId: "vYcU9P_I9nc", titleKy: "Көк бөрү – дүйнөдөгү эң катаал спорт (көчмөндөр оюндары, 4-күн)", titleRu: "Кок-бору — самый жёсткий спорт в мире (игры кочевников, 4-й день)", date: "2025-09-02", category: "players" },
  { youtubeId: "xBiNh9pq4uw", titleKy: "Көк бөрү, ДКО-2018 финалы: Кыргызстан – Өзбекстан", titleRu: "Кок-бору, финал ВИК-2018: Кыргызстан – Узбекистан", date: "2025-08-26", category: "tournaments" },
  { youtubeId: "NB_Yj-6FeEM", titleKy: "Көкпар / көк бөрү финалы: Казакстан – Кыргызстан", titleRu: "Финал кокпар / кок-бору: Казахстан – Кыргызстан", date: "2025-08-19", category: "tournaments" },
  { youtubeId: "UAbRxwAxG6s", titleKy: "Ботобек улак тартыш, 16.12.2024", titleRu: "Улак тартыш Ботобек, 16.12.2024", date: "2024-12-16", category: "tournaments" },
];

const firstPage = 20;
const nextPage = 12;
// How long the loading mark turns at the end of the list before the next page shows (or, at the very end, before it goes).
const loadDelay = 5000;

type MediaFilterKey = "category" | "year";
const noMediaFilters: Record<MediaFilterKey, string[]> = { category: [], year: [] };

// Pins take turns at these shapes, so the columns fall unevenly like a Pinterest board.
const pinShapes = ["4 / 5", "1 / 1", "3 / 4", "2 / 3", "5 / 6", "1 / 1", "3 / 4", "4 / 5"];

type MediaTab = "videos" | "photos";
const mediaTabs = ["videos", "photos"] as const;

// YouTube link → video id (watch, youtu.be and shorts links), for the privacy-friendly embed.
export function youtubeId(url = "") {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return match?.[1] ?? null;
}

export default function MediaPage({ locale, items, videos, orderSeed }: MediaPageProps) {
  const labels = copy[locale];
  const [open, setOpen] = useState<number | null>(null);
  const [openVideo, setOpenVideo] = useState<number | null>(null);
  const { kind: tab, choose: chooseTab } = useHashKind<MediaTab>(mediaTabs);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(noMediaFilters);
  // Every picture is a pin; items with a YouTube link are videos instead. Both lists come in this visit's own order.
  const photos = shuffled(items.filter((item) => !item.videoUrl), orderSeed);
  const allVideos: MediaVideo[] = shuffled(videos.length ? videos : demoVideos.map((video) => ({ id: video.youtubeId, youtubeId: video.youtubeId, title: locale === "ky" ? video.titleKy : video.titleRu, date: video.date, category: video.category })), orderSeed);
  // Search by keyword in the caption or title; filter by section and year (the options come from both tabs, so a
  // filter keeps working when you switch between them).
  const categoryNames: Record<MediaCategory, string> = { tournaments: labels.categoryTournaments, players: labels.categoryPlayers, federation: labels.categoryFederation, horses: labels.categoryHorses };
  const entries = [...photos.map((item) => ({ category: item.category, date: item.date })), ...allVideos.map((video) => ({ category: video.category, date: video.date }))];
  const categories = (Object.keys(categoryNames) as MediaCategory[]).filter((key) => entries.some((entry) => entry.category === key));
  const years = [...new Set(entries.flatMap((entry) => entry.date ? [entry.date.slice(0, 4)] : []))].sort().reverse();
  const fields: FilterField<MediaFilterKey>[] = [
    { key: "category", label: labels.mediaCategory, icon: FolderOpen, options: categories.map((key) => [key, categoryNames[key]]) },
    // A year to choose only once the media spans more than one
    { key: "year", label: labels.filterYear, icon: CalendarDays, options: years.length > 1 ? years.map((year) => [year, year]) : [] },
  ];
  const needle = query.trim().toLocaleLowerCase(locale);
  const matches = (words: string, category?: MediaCategory, date?: string) => (!needle || words.toLocaleLowerCase(locale).includes(needle))
    && (!filters.category.length || (!!category && filters.category.includes(category)))
    && (!filters.year.length || (!!date && filters.year.includes(date.slice(0, 4))));
  const shown = photos.filter((item) => matches(item.caption, item.category, item.date));
  const videoList = allVideos.filter((video) => matches(video.title, video.category, video.date));
  // Endless scrolling: how many of the list show, and whether its end has been reached (the loading mark gone); a
  // new tab, search or filter starts again from the first page.
  const listKey = `${tab}|${needle}|${filters.category.join(",")}|${filters.year.join(",")}`;
  const [paging, setPaging] = useState({ key: listKey, limit: firstPage, done: false });
  const { limit, done } = paging.key === listKey ? paging : { limit: firstPage, done: false };
  const total = tab === "videos" ? videoList.length : shown.length;
  const more = limit < total;
  const endRef = useRef<HTMLDivElement>(null);
  // A new tab, search or filter goes back to the top, where its first page starts (not on first load).
  const shownKey = useRef(listKey);
  useEffect(() => {
    if (shownKey.current === listKey) return;
    shownKey.current = listKey;
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [listKey]);
  // Once the loading mark at the end comes into view it turns for loadDelay, then the next 12 show; when there are
  // no more, it turns just the same and then goes.
  useEffect(() => {
    const end = endRef.current;
    if (!end || done) return;
    let timer: number | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || timer !== undefined) return;
      timer = window.setTimeout(() => setPaging(more ? { key: listKey, limit: limit + nextPage, done: false } : { key: listKey, limit, done: true }), loadDelay);
    });
    observer.observe(end);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [listKey, limit, more, done]);
  const current = open === null ? null : shown[open];
  const playing = openVideo === null ? null : videoList[openVideo];
  const results = tab === "videos" ? videoList.length : shown.length;

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
    <section className="home-row media-page" id="media">
      <div className="section-wrap">
        {/* The page's name is already in the menu, so it is not shown again as a title (screen readers still get it) */}
        <h1 className="sr-only">{labels.mediaTitle}</h1>
        <PageLead title={labels.mediaLeadTitle} text={labels.mediaLeadText} />
        <SearchPanel kinds={[{ key: "videos", label: labels.mediaTabVideos, icon: Play }, { key: "photos", label: labels.mediaTabPhotos, icon: Images }]}
          kind={tab} onChoose={chooseTab} switchLabel={labels.mediaSwitch}
          query={query} onQuery={setQuery} fields={fields} filters={filters} onFilters={setFilters}
          showLabel={labels.mediaShow.replace("{n}", String(results))}
          labels={{ search: labels.searchLabel, placeholder: labels.mediaSearchPlaceholder, filterButton: labels.filterButton, filterTitle: labels.filterTitle, filterReset: labels.filterReset, close: labels.close }} />

        {/* Videos: YouTube-style cards (thumbnail, then the title below it) */}
        {tab === "videos" && !videoList.length && <p className="empty-note" role="tabpanel" id="kind-panel-videos" aria-label={labels.mediaTabVideos}>{labels.mediaNoResults}</p>}
        {tab === "videos" && videoList.length > 0 && <div className="video-grid" role="tabpanel" id="kind-panel-videos" aria-label={labels.mediaTabVideos}>
          {videoList.slice(0, limit).map((video, index) => (
            <button type="button" className="video-card" key={video.id} onClick={() => setOpenVideo(index)}>
              <span className="video-thumb">
                <Image src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`} alt="" width={480} height={360} unoptimized />
                <span className="video-play" aria-hidden="true"><Play size={22} /></span>
              </span>
              <span className="video-meta">
                <span className="video-avatar" aria-hidden="true" />
                <span className="video-text">
                  <strong>{video.title}</strong>
                </span>
              </span>
            </button>
          ))}
        </div>}

        {/* Photos: Pinterest-style pins in columns, the caption under each */}
        {tab === "photos" && <div role="tabpanel" id="kind-panel-photos" aria-label={labels.mediaTabPhotos}>
          {shown.length > 0
            ? <div className="pin-board">
                {shown.slice(0, limit).map((item, index) => (
                  <button type="button" className="pin" key={item.id} onClick={() => setOpen(index)} aria-label={item.caption}>
                    <span className="pin-photo" style={{ "--pin-shape": pinShapes[index % pinShapes.length] } as CSSProperties}>
                      <Image src={item.src} alt="" width={800} height={1000} unoptimized />
                      <span className="pin-zoom" aria-hidden="true"><Maximize2 size={17} /></span>
                    </span>
                    {item.caption && <span className="pin-caption">{item.caption}</span>}
                  </button>
                ))}
              </div>
            : <p className="empty-note">{photos.length ? labels.mediaNoResults : labels.mediaEmpty}</p>}
        </div>}
        {/* The end of the list: reaching it loads the next 12 */}
        {!done && <div className="media-more" ref={endRef} aria-hidden="true"><span /></div>}
      </div>
    </section>

    {playing && <div className="sandyk" role="dialog" aria-modal="true" aria-label={playing.title} onClick={() => setOpenVideo(null)}>
        <figure className="sandyk-lid" key={playing.id} onClick={(event) => event.stopPropagation()}>
          <div className="sandyk-video"><iframe src={`https://www.youtube-nocookie.com/embed/${playing.youtubeId}?autoplay=1`} title={playing.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /></div>
          <figcaption>{playing.title}</figcaption>
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
