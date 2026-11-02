"use client";

import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Flag,
  Gem,
  House,
  Images,
  Info,
  Mail,
  Map as MapIcon,
  MapPin,
  Menu,
  MessageCircle,
  Moon,
  Newspaper,
  Phone,
  Ribbon,
  Search,
  Store,
  Sun,
  RotateCw,
  Trophy,
  User,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import FederationPage from "@/components/federation-page";
import MediaPage, { type MediaCategory, type MediaEntry } from "@/components/media-page";
import RulesPage from "@/components/rules-page";
import TournamentsPage from "@/components/tournaments-page";
import LocaleSync from "@/components/locale-sync";
import type {
  AboutPhoto,
  FederationMember,
  HistoryMilestone,
  MediaItem,
  HorseCategory,
  HorseListing,
  NewsArticle,
  Player,
  RuleSection,
  SiteSettings,
  Tournament,
} from "@prisma/client";
import type { Locale, PublicSection } from "@/lib/i18n";
import { copy, foundedYear, text } from "@/lib/i18n";

type LocalizedArticle = Omit<NewsArticle, "publishedAt"> & {
  publishedAt: string | null;
};
type LocalizedTournament = Omit<Tournament, "startsAt" | "endsAt"> & {
  startsAt: string;
  endsAt: string;
  isPast: boolean;
};
type HorseWithCategory = HorseListing & { category: HorseCategory };
type Labels = (typeof copy)[Locale];
type PriceBand = "any" | "low" | "mid" | "high";
type HeroSlide = {
  key: string;
  image: string;
  kicker: string;
  title: string;
  meta?: string[];
  tagline?: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
  isMain?: boolean;
};

type NewsPage = { articles: LocalizedArticle[]; page: number; pageCount: number; archive: boolean; archiveTotal: number };

type HomeExperienceProps = {
  locale: Locale;
  section?: PublicSection;
  newsPage?: NewsPage;
  settings: SiteSettings;
  articles: LocalizedArticle[];
  tournaments: LocalizedTournament[];
  players: Player[];
  rules: RuleSection[];
  categories: HorseCategory[];
  horses: HorseWithCategory[];
  members: FederationMember[];
  aboutPhotos: AboutPhoto[];
  milestones: HistoryMilestone[];
  mediaItems: MediaItem[];
};

// Yurt, flag and mountains: the federation's "who we are" picture.
const federationImage = "/images/yurt-flag.jpg";

// A full field of riders racing across the steppe, for the tournament slides.
const tournamentSlideImage = "/images/ulak-steppe-race.jpg";

// Riders in red and blue racing for the goat before a full stand: the news slide's background.
const newsSlideImage = "/images/season-ulak.jpg";

// A black stallion against the Tian Shan: the horse market's slide and page header.
const marketImage = "/images/argymak-stallion.jpg";

// Inside a yurt, the door open onto the mountains and grazing horses: the federation page header.
const aboutHeaderImage = "/images/yurt-interior.jpg";

// Riders in kalpaks at sunset, for the "heritage and future" card.
const legacyImage = "/images/riders-sunset.jpg";

const monthLabels: Record<Locale, string[]> = {
  ky: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
  ru: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
};


const priceBands: Record<Exclude<PriceBand, "any">, [number, number]> = {
  low: [0, 800000],
  mid: [800000, 1500000],
  high: [1500000, Number.POSITIVE_INFINITY],
};

// The theme lives on <html data-theme>; the inline script in app/layout.tsx restores it before paint.
function toggleTheme() {
  const root = document.documentElement;
  const next = root.dataset.theme === "light" ? "dark" : "light";
  if (next === "light") root.dataset.theme = "light";
  else delete root.dataset.theme;
  try { localStorage.setItem("theme", next); } catch {}
}

function dateLabel(value: string, locale: Locale, withYear = false) {
  const date = new Date(value);
  return `${date.getUTCDate()} ${monthLabels[locale][date.getUTCMonth()]}${withYear ? ` ${date.getUTCFullYear()}` : ""}`;
}

function numericDate(value: string) {
  const date = new Date(value);
  return `${String(date.getUTCDate()).padStart(2, "0")}.${String(date.getUTCMonth() + 1).padStart(2, "0")}.${date.getUTCFullYear()}`;
}

function moneyLabel(value: number | null, locale: Locale, som: string) {
  if (value === null) return locale === "ky" ? "Баасы сүйлөшүлөт" : "Цена договорная";
  // Grouped by hand: browsers without Kyrgyz locale data would format differently from the server.
  return `${String(value).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ${som}`;
}

function DateBlock({ value, locale }: { value: string; locale: Locale }) {
  const date = new Date(value);
  return (
    <span className="date-block">
      <strong>{date.getUTCDate()}</strong>
      <span>{monthLabels[locale][date.getUTCMonth()]}</span>
      <small>{date.getUTCFullYear()}</small>
    </span>
  );
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

// Player photo, or gold initials on a rosette when there is none; the shirt number sits on the edge.
function PlayerPortrait({ player, size }: { player: Player; size: number }) {
  return (
    <span className="player-portrait" style={{ "--portrait": `${size}px` } as CSSProperties}>
      {player.imageUrl
        ? <Image src={player.imageUrl} alt="" width={size * 2} height={size * 2} unoptimized />
        : <span className="player-initials">{initials(player.name)}</span>}
      {player.number !== null && <span className="player-number">{player.number}</span>}
    </span>
  );
}

// A player's card: tap to turn it over for the details; it turns back by itself once it scrolls out of view.
function PlayerFlipCard({ player, locale, labels }: { player: Player; locale: Locale; labels: Labels }) {
  const [flipped, setFlipped] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);
  const city = text(locale, player.cityKy, player.cityRu);
  const club = text(locale, player.clubKy, player.clubRu);
  const position = text(locale, player.positionKy, player.positionRu);
  const achievements = text(locale, player.achievementsKy, player.achievementsRu);
  const bio = text(locale, player.bioKy, player.bioRu);
  const age = player.birthYear ? new Date().getFullYear() - player.birthYear : null;

  useEffect(() => {
    const node = cardRef.current;
    if (!node || !flipped) return;
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) setFlipped(false); });
    observer.observe(node);
    return () => observer.disconnect();
  }, [flipped]);

  const facts: [string, string][] = [
    [labels.playerNumber, player.number !== null ? String(player.number) : ""],
    [labels.playerPosition, position],
    [labels.playerClub, club],
    [labels.playerCity, city],
    [labels.playerBorn, player.birthYear ? `${player.birthYear} (${age} ${labels.playerYears})` : ""],
  ].filter((fact): fact is [string, string] => Boolean(fact[1]));

  return (
    <button ref={cardRef} type="button" className={`player-flip${flipped ? " is-flipped" : ""}`} onClick={() => setFlipped(!flipped)} aria-pressed={flipped} aria-label={`${player.name}: ${flipped ? labels.cardFront : labels.cardBack}`}>
      <span className="player-flip-inner">
        <span className="player-face player-face-front" aria-hidden={flipped}>
          <PlayerPortrait player={player} size={128} />
          <strong className="player-face-name">{player.name}</strong>
          {city && <span className="player-face-city"><MapPin size={13} />{city}</span>}
          {position && <span className="player-face-role">{position}</span>}
          {club && <span className="player-club">{club}</span>}
          <span className="player-flip-hint"><RotateCw size={13} />{labels.cardMore}</span>
        </span>
        <span className="player-face player-face-back" aria-hidden={!flipped}>
          <span className="player-back-head">
            <strong>{player.name}</strong>
            {player.number !== null && <span className="player-back-number">{player.number}</span>}
          </span>
          <span className="player-facts">
            {facts.map(([label, value]) => <span key={label}><small>{label}</small>{value}</span>)}
          </span>
          {achievements && <span className="player-back-block"><small>{labels.playerAchievements}</small>{achievements}</span>}
          {bio && <span className="player-back-block"><small>{labels.playerAbout}</small>{bio}</span>}
          {!achievements && !bio && <span className="player-back-empty">{labels.playerNoDetails}</span>}
          <span className="player-flip-hint"><RotateCw size={13} />{labels.cardFront}</span>
        </span>
      </span>
    </button>
  );
}

// Page numbers under the news grid, plus the way into (or back out of) the archive.
function NewsPager({ newsPage, locale, labels }: { newsPage: NewsPage; locale: Locale; labels: Labels }) {
  const { page, pageCount, archive, archiveTotal } = newsPage;
  const href = (target: number) => `/${locale}/news?${archive ? "archive=1&" : ""}page=${target}#news`;
  return (
    <div className="news-pager">
      {pageCount > 1 && <nav className="pagination" aria-label={labels.pagination}>
        {page > 1 ? <a href={href(page - 1)} aria-label={labels.prevPage}><ChevronLeft size={18} /></a> : <span className="is-disabled" aria-hidden="true"><ChevronLeft size={18} /></span>}
        {Array.from({ length: pageCount }, (_, index) => index + 1).map((target) => (
          target === page
            ? <span key={target} className="is-current" aria-current="page">{target}</span>
            : <a key={target} href={href(target)} aria-label={`${labels.pageLabel} ${target}`}>{target}</a>
        ))}
        {page < pageCount ? <a href={href(page + 1)} aria-label={labels.nextPage}><ChevronRight size={18} /></a> : <span className="is-disabled" aria-hidden="true"><ChevronRight size={18} /></span>}
      </nav>}
      {archive
        ? <a className="text-link news-archive-link" href={`/${locale}/news#news`}><ChevronLeft size={16} />{labels.backToNews}</a>
        : archiveTotal > 0 && <a className="text-link news-archive-link" href={`/${locale}/news?archive=1#news`}>{labels.newsArchive} · {archiveTotal}<ArrowRight size={16} /></a>}
    </div>
  );
}

function RowHeading({
  title,
  icon: Icon,
  href,
  linkLabel,
  children,
}: {
  title: string;
  icon?: LucideIcon;
  href: string;
  linkLabel: string;
  children?: ReactNode;
}) {
  return (
    <div className="row-heading">
      <h2>{Icon && <Icon size={22} />}{title}</h2>
      {children}
      <a href={href}>{linkLabel}<ArrowRight size={15} /></a>
    </div>
  );
}

// A full-width horizontal row that scrolls sideways, with edge arrows like otv.kg's rows.
function RowTrack({ labels, children }: { labels: Labels; children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const update = () => setEdges({
      start: track.scrollLeft <= 4,
      end: track.scrollLeft + track.clientWidth >= track.scrollWidth - 4,
    });
    update();
    track.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(track);
    return () => {
      track.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  function scroll(direction: 1 | -1) {
    const track = trackRef.current;
    if (track) track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <div className="row-track-wrap">
      <div className="row-track" ref={trackRef}>{children}</div>
      {!edges.start && <button className="track-arrow track-arrow-prev" type="button" onClick={() => scroll(-1)} aria-label={labels.prevSlide}><ChevronLeft size={32} strokeWidth={1.75} /></button>}
      {!edges.end && <button className="track-arrow track-arrow-next" type="button" onClick={() => scroll(1)} aria-label={labels.nextSlide}><ChevronRight size={32} strokeWidth={1.75} /></button>}
    </div>
  );
}

function HorseCard({
  horse,
  locale,
  labels,
}: {
  horse: HorseWithCategory;
  locale: Locale;
  labels: Labels;
}) {
  const name = text(locale, horse.nameKy, horse.nameRu);
  return (
    <article className="horse-card">
      <div className="horse-image-wrap">
        <Image src={horse.imageUrl} alt={name} width={700} height={500} unoptimized />
      </div>
      <div className="horse-card-body">
        <h3>{name}</h3>
        <ul className="horse-facts">
          <li><Ribbon size={15} />{text(locale, horse.category.nameKy, horse.category.nameRu)}</li>
          <li><CalendarDays size={15} />{text(locale, horse.ageKy, horse.ageRu)}</li>
          <li><MapPin size={15} />{text(locale, horse.locationKy, horse.locationRu)}</li>
        </ul>
        <strong className="horse-price">{moneyLabel(horse.price, locale, labels.som)}</strong>
        {horse.sellerPhone && <div className="horse-seller">
          {horse.sellerName && <span><User size={14} />{horse.sellerName}</span>}
          <a className="button button-outline horse-contact" href={`tel:${horse.sellerPhone.replace(/[^+\d]/g, "")}`}><Phone size={15} />{horse.sellerPhone}</a>
        </div>}
      </div>
    </article>
  );
}

export default function HomeExperience({
  locale,
  section,
  newsPage,
  settings,
  articles,
  tournaments,
  players,
  rules,
  categories,
  horses,
  members,
  aboutPhotos,
  milestones,
  mediaItems,
}: HomeExperienceProps) {
  const labels = copy[locale];
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeRegion, setActiveRegion] = useState("all");
  const [activePrice, setActivePrice] = useState<PriceBand>("any");
  const [eventTab, setEventTab] = useState<"upcoming" | "past">("upcoming");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [slidePaused, setSlidePaused] = useState(false);
  const regions = [...new Set(horses.map((horse) => text(locale, horse.locationKy, horse.locationRu)))];
  const visibleHorses = horses.filter((horse) => {
    if (activeCategory !== "all" && horse.categoryId !== activeCategory) return false;
    if (activeRegion !== "all" && text(locale, horse.locationKy, horse.locationRu) !== activeRegion) return false;
    if (activePrice !== "any") {
      if (horse.price === null) return false;
      const [min, max] = priceBands[activePrice];
      if (horse.price < min || horse.price >= max) return false;
    }
    return true;
  });
  const upcoming = tournaments.filter((item) => !item.isPast);
  const past = tournaments.filter((item) => item.isPast).reverse();
  const [horsesTitle, ...horsesSubtitle] = text(locale, settings.horsesTitleKy, settings.horsesTitleRu).split("\n");
  const navItems: [PublicSection | "home", string, LucideIcon][] = [
    ["home", labels.navHome, House],
    ["about", labels.navAbout, Info],
    ["calendar", labels.navCalendar, Trophy],
    ["players", labels.navPlayers, Users],
    ["news", labels.navNews, Newspaper],
    ["media", labels.navMedia, Images],
    ["rules", labels.navRules, BookOpen],
    ["horses", labels.navHorses, Store],
  ];
  const stats = [
    { icon: Flag, value: String(foundedYear), label: labels.statFounded },
    { icon: Users, value: String(players.length), label: labels.statPlayers },
    { icon: Trophy, value: String(tournaments.length), label: labels.statTournaments },
  ];
  const horseFeatures: [LucideIcon, string][] = [
    [BadgeCheck, labels.featureOne],
    [Gem, labels.featureTwo],
    [MapIcon, labels.featureThree],
    [MessageCircle, labels.featureFour],
  ];
  const listedEvents = (eventTab === "upcoming" ? upcoming : past).slice(0, 3);
  const searchIndex: { title: string; kind: string; href: string }[] = [
    ...articles.map((item) => ({ title: text(locale, item.titleKy, item.titleRu), kind: labels.navNews, href: `/${locale}/news` })),
    ...tournaments.map((item) => ({ title: text(locale, item.titleKy, item.titleRu), kind: labels.navCalendar, href: `/${locale}/calendar` })),
    ...players.map((item) => ({ title: item.name, kind: labels.navPlayers, href: `/${locale}/players` })),
    ...horses.map((item) => ({ title: text(locale, item.nameKy, item.nameRu), kind: labels.navHorses, href: `/${locale}/horses` })),
    ...rules.map((item) => ({ title: text(locale, item.titleKy, item.titleRu), kind: labels.navRules, href: `/${locale}/rules` })),
  ];
  const needle = query.trim().toLocaleLowerCase(locale);
  const searchResults = needle ? searchIndex.filter((item) => item.title.toLocaleLowerCase(locale).includes(needle)).slice(0, 8) : [];
  // Media page: the admin's media list; until it has items, photos gathered from the rest of the site.
  const gallery: MediaEntry[] = mediaItems.length
    ? mediaItems.map((item) => ({ id: item.id, src: item.imageUrl, caption: text(locale, item.captionKy, item.captionRu), category: item.category as MediaCategory, videoUrl: item.videoUrl }))
    : ([
      { src: settings.heroImageUrl, caption: labels.heroKicker, category: "federation" },
      { src: tournamentSlideImage, caption: labels.homeTournaments, category: "tournaments" },
      { src: federationImage, caption: labels.country, category: "federation" },
      { src: legacyImage, caption: labels.legacyTitle, category: "federation" },
      ...articles.map((item) => ({ src: item.imageUrl, caption: text(locale, item.titleKy, item.titleRu), category: "tournaments" })),
      ...players.map((item) => ({ src: item.imageUrl, caption: item.name, category: "players" })),
      ...horses.map((item) => ({ src: item.imageUrl, caption: text(locale, item.nameKy, item.nameRu), category: "horses" })),
    ] as { src: string; caption: string; category: MediaCategory }[])
      .filter((item, index, list) => item.src && list.findIndex((other) => other.src === item.src) === index)
      .map((item) => ({ ...item, id: item.src }));

  // Home hero slides, in the spirit of a streaming-site carousel: federation, next event, latest news, horse market.
  const nextEvent = upcoming[0];
  const latestArticle = articles[0];
  const heroSlides: HeroSlide[] = [
    {
      key: "federation",
      image: settings.heroImageUrl,
      kicker: labels.heroKicker,
      title: text(locale, settings.heroTitleKy, settings.heroTitleRu),
      tagline: text(locale, settings.heroTextKy, settings.heroTextRu),
      primary: { href: `/${locale}/calendar`, label: labels.heroAction },
      secondary: { href: `/${locale}/about`, label: labels.heroSecondary },
      isMain: true,
    },
    ...(nextEvent ? [{
      key: "event",
      image: tournamentSlideImage,
      kicker: labels.nextEvent,
      title: text(locale, nextEvent.titleKy, nextEvent.titleRu),
      meta: [`${dateLabel(nextEvent.startsAt, locale)} — ${dateLabel(nextEvent.endsAt, locale, true)}`, text(locale, nextEvent.locationKy, nextEvent.locationRu)],
      primary: { href: `/${locale}/calendar`, label: labels.heroAction },
    }] : []),
    ...(latestArticle ? [{
      key: "news",
      image: newsSlideImage,
      kicker: labels.newsLabel,
      title: text(locale, latestArticle.titleKy, latestArticle.titleRu),
      meta: latestArticle.publishedAt ? [numericDate(latestArticle.publishedAt)] : undefined,
      tagline: text(locale, latestArticle.excerptKy, latestArticle.excerptRu),
      primary: { href: `/${locale}/news`, label: labels.readMore },
    }] : []),
    {
      key: "market",
      image: marketImage,
      kicker: labels.horsesLabel,
      title: [horsesTitle, ...horsesSubtitle].join(" "),
      tagline: labels.horsesIntro,
      primary: { href: `/${locale}/horses`, label: labels.toMarket },
    },
  ];
  const activeSlide = heroSlides[slideIndex % heroSlides.length];

  function stepSlide(direction: 1 | -1) {
    setSlideIndex((current) => (current % heroSlides.length + direction + heroSlides.length) % heroSlides.length);
  }

  // Touch screens change slides by swiping; a mostly-horizontal move of 40px or more counts.
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  function endSwipe(x: number, y: number) {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start || heroSlides.length < 2) return;
    const dx = x - start.x;
    if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(y - start.y) * 1.5) stepSlide(dx < 0 ? 1 : -1);
  }

  useEffect(() => {
    if (section || slidePaused || heroSlides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => setSlideIndex((current) => (current + 1) % heroSlides.length), 6500);
    return () => window.clearTimeout(timer);
  }, [section, slidePaused, slideIndex, heroSlides.length]);

  const latestMedia = [
    ...articles.map((item) => ({ src: item.imageUrl, caption: text(locale, item.titleKy, item.titleRu), at: new Date(item.updatedAt).getTime() })),
    ...horses.map((item) => ({ src: item.imageUrl, caption: text(locale, item.nameKy, item.nameRu), at: new Date(item.updatedAt).getTime() })),
    ...players.map((item) => ({ src: item.imageUrl, caption: item.name, at: new Date(item.updatedAt).getTime() })),
    { src: settings.heroImageUrl, caption: labels.heroKicker, at: new Date(settings.updatedAt).getTime() },
    { src: federationImage, caption: labels.country, at: 0 },
    { src: legacyImage, caption: labels.legacyTitle, at: 0 },
  ]
    .filter((item) => item.src)
    .sort((a, b) => b.at - a.at)
    .filter((item, index, list) => list.findIndex((other) => other.src === item.src) === index)
    .slice(0, 6);

  // The header sits transparently over the photo header (home slider, horse market) until the page scrolls.
  const photoHeader = !section || section === "horses" || section === "about";
  useEffect(() => {
    if (!photoHeader) return;
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [photoHeader]);


  function resetHorseFilters() {
    setActiveCategory("all");
    setActiveRegion("all");
    setActivePrice("any");
  }

  return (
    <main className={`site-shell${section ? ` section-page section-page-${section}` : " home-page"}`}>
      <LocaleSync locale={locale} />
      <header className={`site-header${photoHeader && !scrolled && !menuOpen && !searchOpen ? " is-transparent" : ""}`}>
        <a className="brand-lockup" href={`/${locale}`} aria-label={`${settings.brandName} — ${labels.navHome}`}>
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">{settings.brandName}</span>
        </a>
        <nav className="primary-nav" aria-label="Main navigation">
          {navItems.map(([id, label]) => {
            const active = id === "home" ? !section : section === id;
            return <a key={id} className={active ? "is-active" : undefined} aria-current={active ? "page" : undefined} href={id === "home" ? `/${locale}` : `/${locale}/${id}`}>{label}</a>;
          })}
        </nav>
        <div className="header-actions">
          {/* Only the other language is offered, named in that language so its readers recognise it: "Русский" on the Kyrgyz site, "Кыргызча" on the Russian one. */}
          <div className="lang-toggle">
            <a href={`/${locale === "ky" ? "ru" : "ky"}${section ? `/${section}` : ""}`} hrefLang={locale === "ky" ? "ru" : "ky"} aria-label={`${labels.languageLabel}: ${locale === "ky" ? "Русский" : "Кыргызча"}`}>
              <span className="lang-full">{locale === "ky" ? "Русский" : "Кыргызча"}</span><span className="lang-short">{locale === "ky" ? "РУС" : "КЫР"}</span>
            </a>
          </div>
          <button className="icon-button theme-toggle" type="button" onClick={toggleTheme} aria-label={labels.themeLabel} title={labels.themeLabel}>
            <Sun className="theme-icon-sun" size={19} aria-hidden="true" />
            <Moon className="theme-icon-moon" size={19} aria-hidden="true" />
          </button>
          <span className="header-divider" aria-hidden="true" />
          <button className="icon-button search-toggle" type="button" onClick={() => { setSearchOpen(!searchOpen); setMenuOpen(false); }} aria-label={labels.searchLabel} aria-expanded={searchOpen} aria-controls="site-search">
            {searchOpen ? <X size={20} /> : <Search size={20} />}
          </button>
          <button className="icon-button" type="button" onClick={() => { setMenuOpen(!menuOpen); setSearchOpen(false); }} aria-label={menuOpen ? labels.close : labels.menu} aria-expanded={menuOpen} aria-controls="site-menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {searchOpen && <div id="site-search" className="search-panel">
        <div className="section-wrap">
          <label className="search-field">
            <Search size={20} />
            <span className="sr-only">{labels.searchLabel}</span>
            <input autoFocus type="search" value={query} placeholder={labels.searchPlaceholder} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") setSearchOpen(false); }} />
          </label>
          {needle && <ul className="search-results">
            {searchResults.map((item) => <li key={`${item.kind}-${item.title}`}><a href={item.href}><strong>{item.title}</strong><span>{item.kind}</span><ArrowRight size={15} /></a></li>)}
            {!searchResults.length && <li className="search-empty">{labels.noResults}</li>}
          </ul>}
        </div>
      </div>}

      {menuOpen && <>
        <button className="menu-backdrop" type="button" aria-label={labels.close} onClick={() => setMenuOpen(false)} />
        <nav id="site-menu" className="menu-drawer" aria-label="Menu">
          {navItems.map(([id, label, Icon]) => {
            const active = id === "home" ? !section : section === id;
            return (
              <a key={id} className={active ? "is-active" : undefined} aria-current={active ? "page" : undefined} href={id === "home" ? `/${locale}` : `/${locale}/${id}`} onClick={() => setMenuOpen(false)}>
                <Icon size={19} aria-hidden="true" />{label}
              </a>
            );
          })}
          <button className="menu-drawer-theme" type="button" onClick={toggleTheme}>
            <Sun className="theme-icon-sun" size={19} aria-hidden="true" />
            <Moon className="theme-icon-moon" size={19} aria-hidden="true" />
            <span className="theme-label-dark">{labels.themeToLight}</span>
            <span className="theme-label-light">{labels.themeToDark}</span>
          </button>
          <div className="menu-drawer-contacts">
            <a href={`tel:${settings.contactPhone}`}><Phone size={16} />{settings.contactPhone}</a>
            <a href={`mailto:${settings.contactEmail}`}><Mail size={16} />{settings.contactEmail}</a>
          </div>
          <span className="menu-drawer-mountains" aria-hidden="true" />
        </nav>
      </>}

      {!section && <>
        <div className="hero-shell">
        <div className="hero-rail" aria-hidden="true">
          <span className="hero-rail-pattern" />
        </div>
        <section
          className={`hero${slidePaused ? " is-paused" : ""}`}
          aria-roledescription="carousel"
          onMouseEnter={() => setSlidePaused(true)}
          onMouseLeave={() => setSlidePaused(false)}
          onFocus={() => setSlidePaused(true)}
          onBlur={() => setSlidePaused(false)}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") stepSlide(-1);
            if (event.key === "ArrowRight") stepSlide(1);
          }}
          onTouchStart={(event) => { swipeStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }}
          onTouchEnd={(event) => endSwipe(event.changedTouches[0].clientX, event.changedTouches[0].clientY)}
        >
          {heroSlides.map((slide, index) => (
            <Image key={slide.key} className={`hero-image${slide === activeSlide ? " is-active" : ""}`} src={slide.image} alt="" width={2200} height={1466} priority={index === 0} unoptimized />
          ))}
          <div className={`hero-content${activeSlide.isMain ? "" : " hero-content-slide"}`} key={activeSlide.key} aria-live="polite">
            <p className="eyebrow">{activeSlide.kicker}</p>
            {activeSlide.isMain ? <h1>{activeSlide.title}</h1> : <h2 className="hero-slide-title">{activeSlide.title}</h2>}
            {activeSlide.meta && <p className="hero-meta">{activeSlide.meta.map((item) => <span key={item}>{item}</span>)}</p>}
            {activeSlide.tagline && <p className={activeSlide.isMain ? "hero-tagline" : "hero-slide-text"}>{activeSlide.tagline}</p>}
            <div className="hero-actions">
              <a className="button button-outline" href={activeSlide.primary.href}>{activeSlide.primary.label}<ArrowRight size={17} /></a>
              {activeSlide.secondary && <a className="hero-round-link" href={activeSlide.secondary.href}><span><ArrowRight size={16} /></span>{activeSlide.secondary.label}</a>}
            </div>
          </div>
          {heroSlides.length > 1 && <>
            <button className="hero-arrow hero-arrow-prev" type="button" onClick={() => stepSlide(-1)} aria-label={labels.prevSlide}><ChevronLeft size={32} strokeWidth={1.75} /></button>
            <button className="hero-arrow hero-arrow-next" type="button" onClick={() => stepSlide(1)} aria-label={labels.nextSlide}><ChevronRight size={32} strokeWidth={1.75} /></button>
          </>}
          {heroSlides.length > 1 && <div className="hero-dots" role="tablist" aria-label={labels.slideLabel}>
            {heroSlides.map((slide, index) => (
              <button key={slide.key} type="button" role="tab" aria-selected={slide === activeSlide} aria-label={`${labels.slideLabel} ${index + 1}: ${slide.title.replace("\n", " ")}`} className={slide === activeSlide ? "is-active" : undefined} onClick={() => setSlideIndex(index)}><span /></button>
            ))}
          </div>}
        </section>
        </div>


        <section className="home-row home-row-lead">
          <div className="lead-row">
            <article className="lead-card about-card">
              <div className="about-card-copy">
                <h2>{labels.federationName}</h2>
                <p>{text(locale, settings.aboutTextKy, settings.aboutTextRu)}</p>
                <div className="mini-stats">
                  {stats.map(({ icon: Icon, value, label }) => <div key={label}><Icon size={20} /><strong>{value}</strong><span>{label}</span></div>)}
                </div>
                <a className="button button-outline" href={`/${locale}/about`}>{labels.openSection}<ArrowRight size={16} /></a>
              </div>
              <div className="about-card-art">
                <Image src={federationImage} alt={text(locale, "Боз үй жана Кыргызстандын туусу", "Юрта и флаг Кыргызстана")} width={1672} height={941} unoptimized />
                <span className="home-about-emblem" aria-hidden="true" />
              </div>
            </article>

            <div className="lead-card news-panel">
              <div className="news-panel-heading"><h3>{labels.navNews}</h3><a href={`/${locale}/news`}>{labels.allNews}<ArrowRight size={14} /></a></div>
              {articles.slice(0, 3).map((article) => (
                <a className="news-line" key={article.id} href={`/${locale}/news`}>
                  <Image src={article.imageUrl} alt="" width={240} height={160} unoptimized />
                  <span>
                    {article.publishedAt && <time>{numericDate(article.publishedAt)}</time>}
                    <strong>{text(locale, article.titleKy, article.titleRu)}</strong>
                  </span>
                </a>
              ))}
              {!articles.length && <p className="empty-note">{locale === "ky" ? "Жаңылыктар жакында жарыяланат." : "Новости скоро появятся."}</p>}
            </div>

            <a className="lead-card legacy-card" href={`/${locale}/rules`}>
              <span className="legacy-ornament" aria-hidden="true" />
              <Image src={legacyImage} alt={text(locale, "Калпак кийген чабандестер тоодо", "Всадники в калпаках в горах")} width={1086} height={1448} unoptimized />
              <span className="legacy-card-copy">
                <strong>{labels.legacyTitle}</strong>
                <span className="hero-round-link"><span><ArrowRight size={16} /></span>{labels.legacyAction}</span>
              </span>
            </a>
          </div>
        </section>

        <section className="home-row">
          <RowHeading title={labels.homeTournaments} icon={CalendarDays} href={`/${locale}/calendar`} linkLabel={labels.allTournaments}>
            <div className="tabs" role="tablist">
              <button type="button" role="tab" aria-selected={eventTab === "upcoming"} className={eventTab === "upcoming" ? "is-active" : undefined} onClick={() => setEventTab("upcoming")}>{labels.upcomingTab}</button>
              <button type="button" role="tab" aria-selected={eventTab === "past"} className={eventTab === "past" ? "is-active" : undefined} onClick={() => setEventTab("past")}>{labels.pastTab}</button>
            </div>
          </RowHeading>
          <RowTrack labels={labels} key={eventTab}>
            {(eventTab === "upcoming" ? upcoming : past).map((item) => (
              <a className="row-card event-tile" key={item.id} href={`/${locale}/calendar`}>
                <DateBlock value={item.startsAt} locale={locale} />
                <span className="event-tile-info">
                  <strong>{text(locale, item.titleKy, item.titleRu)}</strong>
                  <small><MapPin size={13} />{text(locale, item.locationKy, item.locationRu)}</small>
                  {item.isPast && text(locale, item.resultSummaryKy, item.resultSummaryRu) && <em><Trophy size={13} />{text(locale, item.resultSummaryKy, item.resultSummaryRu)}</em>}
                </span>
                <ArrowRight className="event-tile-arrow" size={17} />
              </a>
            ))}
          </RowTrack>
          {!listedEvents.length && <p className="empty-note row-empty">{locale === "ky" ? "Азырынча маалымат жок." : "Пока нет данных."}</p>}
        </section>

        <section className="home-row">
          <RowHeading title={labels.homePlayers} icon={Users} href={`/${locale}/players`} linkLabel={labels.allPlayers} />
          <RowTrack labels={labels}>
            {players.map((player) => (
              <a className="row-card player-tile" key={player.id} href={`/${locale}/players`}>
                <PlayerPortrait player={player} size={84} />
                <strong>{player.name}</strong>
                <small>{text(locale, player.positionKy, player.positionRu)}</small>
                {text(locale, player.clubKy, player.clubRu) && <small className="player-club">{text(locale, player.clubKy, player.clubRu)}</small>}
              </a>
            ))}
          </RowTrack>
          {!players.length && <p className="empty-note row-empty">{locale === "ky" ? "Азырынча маалымат жок." : "Пока нет данных."}</p>}
        </section>

        {horses.length > 0 && <section className="home-row">
          <RowHeading title={labels.featuredHorses} href={`/${locale}/horses`} linkLabel={labels.allHorses} />
          <RowTrack labels={labels}>
            <aside className="row-card horses-motto">
              <span className="horses-motto-mark" aria-hidden="true" />
              <p>{labels.goodHorse}</p>
              <span className="horses-motto-mountains" aria-hidden="true" />
            </aside>
            {horses.map((horse) => (
              <div className="row-card horse-tile" key={horse.id}>
                <HorseCard horse={horse} locale={locale} labels={labels} />
              </div>
            ))}
          </RowTrack>
        </section>}

        <section className="home-row">
          <RowHeading title={labels.homeMedia} href={`/${locale}/media`} linkLabel={labels.allMedia} />
          <div className="media-grid">
            {latestMedia.map((item) => (
              <a className="media-card" key={item.src} href={`/${locale}/media`}>
                <Image src={item.src} alt={item.caption} width={720} height={480} unoptimized />
                <span>{item.caption}</span>
              </a>
            ))}
          </div>
        </section>
      </>}

      {section === "about" && <FederationPage
        locale={locale}
        settings={settings}
        members={members}
        photos={aboutPhotos}
        milestones={milestones}
        stats={[...stats, { icon: MapPin, value: String(new Set(members.map((member) => member.region).filter(Boolean)).size), label: labels.statRegions }]}
        crownImage={federationImage}
        headerImage={aboutHeaderImage}
      />}

      {section === "calendar" && <TournamentsPage locale={locale} settings={settings} tournaments={tournaments} />}

      {section === "players" && <section className="players-section section-wrap" id="players">
        <div className="section-heading">
          <div><p className="eyebrow">{labels.playersLabel}</p><h2>{text(locale, settings.teamTitleKy, settings.teamTitleRu)}</h2></div>
        </div>
        <div className="player-grid">
          {players.map((player) => <PlayerFlipCard key={player.id} player={player} locale={locale} labels={labels} />)}
          {!players.length && <p className="empty-note">{locale === "ky" ? "Оюнчулар жакында кошулат." : "Игроки скоро появятся."}</p>}
        </div>
      </section>}

      {section === "news" && newsPage && <section className="news-section section-wrap" id="news">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{labels.newsLabel}</p>
            <h2>{newsPage.archive ? labels.newsArchive : text(locale, settings.newsTitleKy, settings.newsTitleRu)}</h2>
          </div>
        </div>
        <div className="news-grid">
          {newsPage.articles.map((article) => (
            <article className="card news-card" key={article.id}>
              <div className="news-image-wrap"><Image src={article.imageUrl} alt="" width={900} height={500} unoptimized /></div>
              <div className="news-card-body">
                <time>{article.publishedAt ? numericDate(article.publishedAt) : labels.federation}</time>
                <h3>{text(locale, article.titleKy, article.titleRu)}</h3>
                <p>{text(locale, article.excerptKy, article.excerptRu)}</p>
                <details className="news-details"><summary>{labels.readMore}<ArrowRight size={15} /></summary><p>{text(locale, article.bodyKy, article.bodyRu)}</p></details>
              </div>
            </article>
          ))}
          {!newsPage.articles.length && <p className="empty-note">{locale === "ky" ? "Жаңылыктар жакында жарыяланат." : "Новости скоро появятся."}</p>}
        </div>
        <NewsPager newsPage={newsPage} locale={locale} labels={labels} />
      </section>}

      {section === "media" && <MediaPage locale={locale} items={gallery} />}

      {section === "rules" && <RulesPage locale={locale} settings={settings} rules={rules} />}

      {section === "horses" && <>
        <div className="hero-shell">
        <div className="hero-rail" aria-hidden="true"><span className="hero-rail-pattern" /></div>
        <section className="market-hero">
          <Image className="market-hero-image" src={marketImage} alt="" width={1672} height={941} priority unoptimized />
          {/* A short slide-style caption on the photo; the details follow below it */}
          <div className="photo-caption">
            <p className="eyebrow">{labels.horsesLabel}</p>
            <h1 className="photo-caption-title">{[horsesTitle, ...horsesSubtitle].join(" ")}</h1>
            <p className="photo-caption-text">{labels.marketCaption}</p>
            <div className="hero-actions">
              <a className="button button-accent" href="#catalog">{labels.browseCatalog}<ArrowRight size={17} /></a>
              <a className="hero-round-link" href="#quick-find"><span><Search size={16} /></span>{labels.quickFind}</a>
            </div>
          </div>
          <div className="market-hero-inner section-wrap">
            <div className="market-hero-copy">
              <p className="market-intro">{labels.horsesIntro}</p>
              <ul className="market-features">
                {horseFeatures.map(([Icon, label]) => <li key={label}><span><Icon size={20} /></span>{label}</li>)}
              </ul>
            </div>
            <form className="card quick-find" id="quick-find" onSubmit={(event) => { event.preventDefault(); document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" }); }}>
              <h2>{labels.quickFind}</h2>
              <label><Ribbon size={16} /><span className="sr-only">{labels.breed}</span>
                <select value={activeCategory} onChange={(event) => setActiveCategory(event.target.value)}>
                  <option value="all">{labels.breed}: {labels.anyOption}</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{text(locale, category.nameKy, category.nameRu)}</option>)}
                </select>
              </label>
              <label><MapPin size={16} /><span className="sr-only">{labels.region}</span>
                <select value={activeRegion} onChange={(event) => setActiveRegion(event.target.value)}>
                  <option value="all">{labels.region}: {labels.anyOption}</option>
                  {regions.map((region) => <option key={region} value={region}>{region}</option>)}
                </select>
              </label>
              <label><Gem size={16} /><span className="sr-only">{labels.priceLabel}</span>
                <select value={activePrice} onChange={(event) => setActivePrice(event.target.value as PriceBand)}>
                  <option value="any">{labels.priceLabel}: {labels.priceAny}</option>
                  <option value="low">{labels.priceLow}</option>
                  <option value="mid">{labels.priceMid}</option>
                  <option value="high">{labels.priceHigh}</option>
                </select>
              </label>
              <button className="button button-accent" type="submit"><Search size={17} />{labels.search} · {visibleHorses.length}</button>
              <button className="quick-find-reset" type="button" onClick={resetHorseFilters}>{labels.resetFilters}</button>
            </form>
          </div>
        </section>
        </div>

        <section className="horses-section section-wrap" id="catalog">
          <div className="catalog-toolbar">
            <div className="category-filters" role="group" aria-label={labels.horsesTitle}>
              <button className={activeCategory === "all" ? "filter-button is-active" : "filter-button"} type="button" onClick={() => setActiveCategory("all")}>{labels.allCategories}<span>{horses.length}</span></button>
              {categories.map((category) => {
                const count = horses.filter((horse) => horse.categoryId === category.id).length;
                return <button className={activeCategory === category.id ? "filter-button is-active" : "filter-button"} type="button" key={category.id} onClick={() => setActiveCategory(category.id)}>{text(locale, category.nameKy, category.nameRu)}<span>{count}</span></button>;
              })}
            </div>
            <span className="listing-count">{visibleHorses.length} {locale === "ky" ? "жарыя" : "объявлений"}</span>
          </div>
          <div className="horse-grid">
            {visibleHorses.map((horse) => (
              <HorseCard key={horse.id} horse={horse} locale={locale} labels={labels} />
            ))}
          </div>
          {!visibleHorses.length && <p className="empty-note horse-empty">{labels.noHorses}</p>}
        </section>
      </>}


      <footer className="site-footer">
        <div className="footer-scene" aria-hidden="true" />
        <div className="footer-main">
          <div className="footer-brand">
            <a className="brand-lockup" href={`/${locale}`}>
              <span className="brand-mark" aria-hidden="true" />
              <span className="brand-name">{settings.brandName}</span>
            </a>
            <p>{labels.federation}</p>
          </div>
          <div className="footer-column">
            <h2>{labels.homeContacts}</h2>
            <p><MapPin size={17} />{text(locale, settings.addressKy, settings.addressRu)}</p>
            <a href={`tel:${settings.contactPhone}`}><Phone size={17} />{settings.contactPhone}</a>
            <a href={`mailto:${settings.contactEmail}`}><Mail size={17} />{settings.contactEmail}</a>
            {settings.socialUrl && <a href={settings.socialUrl} target="_blank" rel="noreferrer"><MessageCircle size={17} />{labels.social}</a>}
          </div>
        </div>
        <div className="footer-base">
          <span>© {new Date().getFullYear()} {settings.brandName} · {labels.rights}</span>
          <span className="footer-motto"><span className="footer-motto-mark" aria-hidden="true" />{labels.footerTagline}<span className="footer-motto-mark" aria-hidden="true" /></span>
        </div>
      </footer>
    </main>
  );
}
