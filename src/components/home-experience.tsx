"use client";

import {
  ArrowRight,
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
  MapPin,
  Menu,
  MessageCircle,
  Moon,
  Newspaper,
  Phone,
  Play,
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
import HomeBand from "@/components/home-band";
import KeregeFillers from "@/components/kerege-fillers";
import MediaPage, { youtubeId, type MediaCategory, type MediaEntry, type MediaVideo } from "@/components/media-page";
import RulesPage from "@/components/rules-page";
import TournamentsPage from "@/components/tournaments-page";
import LocaleSync from "@/components/locale-sync";
import { MultiSelect } from "@/components/multi-select";
import BazaarVideos from "@/components/bazaar-videos";
import type {
  AboutPhoto,
  FederationMember,
  HistoryMilestone,
  MediaItem,
  HorseCategory,
  HorseListing,
  NewsArticle,
  Player,
  PlayerCard,
  RuleSection,
  SiteSettings,
  Tournament,
} from "@prisma/client";
import type { Locale, PublicSection } from "@/lib/i18n";
import { copy, foundedYear, text } from "@/lib/i18n";
import { latticeCell } from "@/lib/kerege";
import { toggleTheme } from "@/components/theme-toggle";
import { demoPortrait } from "@/lib/portraits";

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
type PriceBand = "low" | "mid" | "high";
type PlayerFilterKey = "club" | "city" | "position";
// Each filter holds the ticked values; an empty list means "any".
const noPlayerFilters: Record<PlayerFilterKey, string[]> = { club: [], city: [], position: [] };
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
  // The signed-in admin (null for visitors): their avatar in the header opens the admin settings.
  admin?: { name: string; photoUrl: string } | null;
  settings: SiteSettings;
  articles: LocalizedArticle[];
  tournaments: LocalizedTournament[];
  players: PlayerWithCards[];
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


const priceBands: Record<PriceBand, [number, number]> = {
  low: [0, 800000],
  mid: [800000, 1500000],
  high: [1500000, Number.POSITIVE_INFINITY],
};

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

function dayMonth(value: string, locale: Locale) {
  const date = new Date(value);
  return `${date.getUTCDate()} ${monthLabels[locale][date.getUTCMonth()]}`;
}

// Player photo, or a demo portrait until the admin uploads one; the shirt number sits on the edge.
function PlayerPortrait({ player, size }: { player: Player; size: number }) {
  return (
    <span className="player-portrait" style={{ "--portrait": `${size}px` } as CSSProperties}>
      <Image src={player.imageUrl || demoPortrait(player.name)} alt="" width={size * 2} height={size * 2} unoptimized />
      {player.number !== null && <span className="player-number">{player.number}</span>}
    </span>
  );
}

// A player's card: tap to turn it over for the details; it turns back by itself once it scrolls out of view.
// A player with their yellow and red cards, newest first (the admin preview passes them without tournaments).
type PlayerWithCards = Player & { cards?: (PlayerCard & { tournament?: { titleKy: string; titleRu: string } | null })[] };

// A yellow or red card as a small coloured rectangle, with a count or alone.
function CardChip({ color, count }: { color: string; count?: number }) {
  return <span className={`card-chip is-${color === "red" ? "red" : "yellow"}`} aria-hidden="true">{count}</span>;
}

function PlayerFlipCard({ player, locale, labels }: { player: PlayerWithCards; locale: Locale; labels: Labels }) {
  const [flipped, setFlipped] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);
  const city = text(locale, player.cityKy, player.cityRu);
  const club = text(locale, player.clubKy, player.clubRu);
  const position = text(locale, player.positionKy, player.positionRu);
  const achievements = text(locale, player.achievementsKy, player.achievementsRu);
  const bio = text(locale, player.bioKy, player.bioRu);
  const age = player.birthYear ? new Date().getFullYear() - player.birthYear : null;
  const cards = player.cards ?? [];
  const yellow = cards.filter((card) => card.color !== "red").length;
  const red = cards.length - yellow;

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
          {cards.length > 0 && <span className="player-discipline" title={labels.cardsTitle}>
            {yellow > 0 && <span><CardChip color="yellow" count={yellow} /><span className="sr-only">{labels.cardYellow}: {yellow}</span></span>}
            {red > 0 && <span><CardChip color="red" count={red} /><span className="sr-only">{labels.cardRed}: {red}</span></span>}
          </span>}
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
          {/* Cards: the newest three, with the date, tournament and reason */}
          {cards.length > 0 && <span className="player-back-block player-back-cards"><small>{labels.cardsTitle}</small>
            {cards.slice(0, 3).map((card) => (
              <span className="player-card-line" key={card.id}>
                <CardChip color={card.color} />
                <span><b>{card.color === "red" ? labels.cardRed : labels.cardYellow} · {numericDate(new Date(card.date).toISOString())}</b>
                  {(card.tournament || card.reasonKy) && <em>{[card.tournament && text(locale, card.tournament.titleKy, card.tournament.titleRu), text(locale, card.reasonKy, card.reasonRu)].filter(Boolean).join(" · ")}</em>}
                </span>
              </span>
            ))}
            {cards.length > 3 && <span className="player-card-more">{labels.cardsMore.replace("{n}", String(cards.length - 3))}</span>}
          </span>}
          {!achievements && !bio && !cards.length && <span className="player-back-empty">{labels.playerNoDetails}</span>}
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

// A home row's heading, centred like the about page's: a label between rosettes, the title, an
// ornament band and a line about the section; tabs (if any) sit under it.
// The signed-in admin's round avatar: their photo, or a demo picture until they upload one in the settings.
function AdminAvatar({ admin }: { admin: { name: string; photoUrl: string } }) {
  return (
    <span className="admin-avatar" aria-hidden="true">
      <Image src={admin.photoUrl || "/images/admin-demo.svg"} alt="" width={80} height={80} unoptimized />
    </span>
  );
}

function RowHeading({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle: string; children?: ReactNode }) {
  return (
    <div className="row-heading">
      <p className="row-heading-eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <span className="row-heading-band" aria-hidden="true"><i /></span>
      <p className="row-heading-text">{subtitle}</p>
      {children}
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

export default function HomeExperience({
  locale,
  section,
  newsPage,
  admin,
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
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeRegions, setActiveRegions] = useState<string[]>([]);
  const [activePrices, setActivePrices] = useState<string[]>([]);
  const [playerQuery, setPlayerQuery] = useState("");
  const [playerFilters, setPlayerFilters] = useState(noPlayerFilters);
  const [discipline, setDiscipline] = useState("all");
  const [eventTab, setEventTab] = useState<"upcoming" | "past">("upcoming");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [slidePaused, setSlidePaused] = useState(false);
  const regions = [...new Set(horses.map((horse) => text(locale, horse.locationKy, horse.locationRu)))];
  const visibleHorses = horses.filter((horse) => {
    if (activeCategories.length && !activeCategories.includes(horse.categoryId)) return false;
    if (activeRegions.length && !activeRegions.includes(text(locale, horse.locationKy, horse.locationRu))) return false;
    if (activePrices.length) {
      const price = horse.price;
      if (price === null || !activePrices.some((band) => price >= priceBands[band as PriceBand][0] && price < priceBands[band as PriceBand][1])) return false;
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
  // The homepage shows at most six tournaments per tab; the rest are on the tournaments page.
  const listedEvents = (eventTab === "upcoming" ? upcoming : past).slice(0, 6);
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
    ] as { src: string; caption: string; category: MediaCategory }[])
      .filter((item, index, list) => item.src && list.findIndex((other) => other.src === item.src) === index)
      .map((item) => ({ ...item, id: item.src }));
  // The bazaar's photos (its header and every listing's) stay in the bazaar: they are not part of the media section.
  const bazaarPhotos = new Set([marketImage, ...horses.map((horse) => horse.imageUrl)]);
  const mediaGallery = gallery.filter((item) => item.category !== "horses" && !bazaarPhotos.has(item.src));
  // The media page's videos: admin media items with a YouTube link (until there are some, the page shows demo videos).
  const mediaVideos: MediaVideo[] = mediaItems.flatMap((item) => {
    const id = youtubeId(item.videoUrl);
    return id ? [{ id: item.id, youtubeId: id, title: text(locale, item.captionKy, item.captionRu), date: new Date(item.createdAt).toISOString() }] : [];
  });

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

  // The homepage's media row: the newest seven of the media page's items, as a view-only кереге lattice
  // (4 diamonds per wide row, so seven make two full rows; ornament diamonds fill any places left empty).
  const homeMedia = mediaGallery.slice(0, 7);
  const homeMediaK = 4;

  // The header sits transparently over the photo header (home slider, horse market) until the page scrolls.
  const photoHeader = !section || section === "horses" || section === "about";
  useEffect(() => {
    if (!photoHeader) return;
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [photoHeader]);


  // Players page filters: name, club, city, position and discipline (has yellow / has red / no cards).
  const clubOptions = [...new Set(players.map((player) => text(locale, player.clubKy, player.clubRu)).filter(Boolean))].sort();
  const cityOptions = [...new Set(players.map((player) => text(locale, player.cityKy, player.cityRu)).filter(Boolean))].sort();
  const positionOptions = [...new Set(players.map((player) => text(locale, player.positionKy, player.positionRu)).filter(Boolean))].sort();
  const disciplineOptions: [string, string][] = [["yellow", labels.disciplineYellow], ["red", labels.disciplineRed], ["clean", labels.disciplineClean]];
  const playerFilterFields: [PlayerFilterKey, string, LucideIcon, [string, string][]][] = [
    ["club", labels.playerClub, Flag, clubOptions.map((option) => [option, option])],
    ["city", labels.playerCity, MapPin, cityOptions.map((option) => [option, option])],
    ["position", labels.playerPosition, User, positionOptions.map((option) => [option, option])],
  ];
  const playerSearch = playerQuery.trim().toLocaleLowerCase();
  const matchesDiscipline = (player: PlayerWithCards, discipline: string) => {
    const cards = player.cards ?? [];
    if (discipline === "yellow") return cards.some((card) => card.color !== "red");
    if (discipline === "red") return cards.some((card) => card.color === "red");
    if (discipline === "clean") return !cards.length;
    return true;
  };
  // Players matching everything but the discipline: the discipline buttons count within these.
  const filteredPlayers = players.filter((player) => (!playerSearch || player.name.toLocaleLowerCase().includes(playerSearch))
    && (!playerFilters.club.length || playerFilters.club.includes(text(locale, player.clubKy, player.clubRu)))
    && (!playerFilters.city.length || playerFilters.city.includes(text(locale, player.cityKy, player.cityRu)))
    && (!playerFilters.position.length || playerFilters.position.includes(text(locale, player.positionKy, player.positionRu))));
  const visiblePlayers = filteredPlayers.filter((player) => matchesDiscipline(player, discipline));
  const disciplineButtons: [string, string][] = [["all", labels.anyOption], ...disciplineOptions];
  const priceLabels: Record<PriceBand, string> = { low: labels.priceLow, mid: labels.priceMid, high: labels.priceHigh };

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
          {/* The signed-in admin, beside the light/dark switch: opens the admin settings */}
          {admin && <a className="admin-chip" href={`/admin/settings?lang=${locale}`} aria-label={`${labels.adminSettings}: ${admin.name}`} title={`${admin.name} · ${labels.adminSettings}`}>
            <AdminAvatar admin={admin} />
          </a>}
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
          {/* In the burger, the admin sits beside the light/dark switch as it does in the header */}
          {admin && <a className="menu-drawer-admin" href={`/admin/settings?lang=${locale}`} onClick={() => setMenuOpen(false)}>
            <AdminAvatar admin={admin} />
            <span><strong>{admin.name}</strong><small>{labels.adminRole} · {labels.adminSettings}</small></span>
            <ArrowRight size={17} aria-hidden="true" />
          </a>}
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
          <RowHeading eyebrow={labels.wheelTitle} title={labels.homeTournaments} subtitle={labels.rowTournamentsText}>
            <div className="tabs" role="tablist">
              <button type="button" role="tab" aria-selected={eventTab === "upcoming"} className={eventTab === "upcoming" ? "is-active" : undefined} onClick={() => setEventTab("upcoming")}>{labels.upcomingTab}</button>
              <button type="button" role="tab" aria-selected={eventTab === "past"} className={eventTab === "past" ? "is-active" : undefined} onClick={() => setEventTab("past")}>{labels.pastTab}</button>
            </div>
          </RowHeading>
          <RowTrack labels={labels} key={eventTab}>
            {listedEvents.map((item) => (
              // A tall poster: the date large on an ornamented top, then title, place, dates and result.
              <a className={`row-card event-poster${item.isPast ? " is-past" : ""}`} key={item.id} href={`/${locale}/calendar`}>
                <span className="event-poster-top">
                  <span className="event-poster-status">{item.isPast ? labels.result : item.id === upcoming[0]?.id ? labels.nextRace : labels.upcoming}</span>
                  <strong>{new Date(item.startsAt).getUTCDate()}</strong>
                  <span>{monthLabels[locale][new Date(item.startsAt).getUTCMonth()]} {new Date(item.startsAt).getUTCFullYear()}</span>
                </span>
                <span className="event-poster-body">
                  <strong>{text(locale, item.titleKy, item.titleRu)}</strong>
                  <small><MapPin size={14} />{text(locale, item.locationKy, item.locationRu)}</small>
                  <small><CalendarDays size={14} />{dayMonth(item.startsAt, locale)} — {dayMonth(item.endsAt, locale)}</small>
                  {/* A finished tournament names its winner (1st place), or else the result note */}
                  {item.isPast && (text(locale, item.winner1Ky, item.winner1Ru) || text(locale, item.resultSummaryKy, item.resultSummaryRu)) && <em><Trophy size={14} />{text(locale, item.winner1Ky, item.winner1Ru) || text(locale, item.resultSummaryKy, item.resultSummaryRu)}</em>}
                  <span className="event-poster-more">{labels.openSection}<ArrowRight size={15} /></span>
                </span>
              </a>
            ))}
          </RowTrack>
          {!listedEvents.length && <p className="empty-note row-empty">{locale === "ky" ? "Азырынча маалымат жок." : "Пока нет данных."}</p>}
          <div className="row-action">
            <a className="button button-outline" href={`/${locale}/calendar`}>{labels.allTournaments}<ArrowRight size={16} /></a>
          </div>
        </section>

        {settings.bandShown && <HomeBand image={settings.bandImageUrl} title={text(locale, settings.bandTitleKy, settings.bandTitleRu)}
          text={text(locale, settings.bandTextKy, settings.bandTextRu)} videoUrl={settings.bandVideoUrl} eyebrow={settings.brandName} labels={labels} />}

        {/* Players: a row of the players page's flip cards, the first eight */}
        <section className="home-row">
          <RowHeading eyebrow={labels.rowPlayersLabel} title={labels.homePlayers} subtitle={labels.rowPlayersText} />
          <RowTrack labels={labels}>
            {players.slice(0, 8).map((player) => (
              <div className="row-card player-row-card" key={player.id}><PlayerFlipCard player={player} locale={locale} labels={labels} /></div>
            ))}
          </RowTrack>
          {players.length > 0 && <div className="row-action">
            <a className="button button-outline" href={`/${locale}/players`}>{labels.allPlayers}<ArrowRight size={16} /></a>
          </div>}
          {!players.length && <p className="empty-note row-empty">{locale === "ky" ? "Азырынча маалымат жок." : "Пока нет данных."}</p>}
        </section>

        <section className="home-row">
          <RowHeading eyebrow={labels.rowMediaLabel} title={labels.homeMedia} subtitle={labels.rowMediaText} />
          <div className="kerege home-kerege" style={{ "--cols-d": homeMediaK * 2, "--cols-m": 4 } as CSSProperties}>
            <div className="kerege-grid">
              {homeMedia.map((item, index) => {
                const desktop = latticeCell(index, homeMediaK);
                const mobile = latticeCell(index, 2);
                return (
                  <span className="kerege-cell" key={item.id}
                    style={{ "--dc": desktop.col, "--dr": desktop.row, "--mc": mobile.col, "--mr": mobile.row } as CSSProperties}>
                    <span className="kerege-photo">
                      <Image src={item.src} alt={item.caption} width={800} height={800} unoptimized />
                      {/* Marks a video; the lattice is view-only, so it does not play here */}
                      {item.videoUrl && <span className="kerege-play" aria-hidden="true"><Play size={20} /></span>}
                    </span>
                  </span>
                );
              })}
              <KeregeFillers count={homeMedia.length} desktopK={homeMediaK} usedPhotos={homeMedia.map((item) => item.src)} total={7} />
            </div>
          </div>
          <div className="row-action">
            <a className="button button-outline" href={`/${locale}/media`}>{labels.allMedia}<ArrowRight size={16} /></a>
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
        {/* Filter: name search, club, city, position and discipline (yellow / red cards), applied as you choose */}
        {players.length > 0 && <div className="players-filter">
          <div className="quick-find-bar players-filter-bar">
            <label className="quick-field">
              <span className="quick-field-label"><Search size={14} />{labels.playersSearch}</span>
              <input type="search" value={playerQuery} onChange={(event) => setPlayerQuery(event.target.value)} placeholder={labels.playersSearchPlaceholder} />
            </label>
            {playerFilterFields.map(([key, label, Icon, options]) => (
              <MultiSelect key={key} label={label} icon={Icon} options={options} value={playerFilters[key]} anyLabel={labels.anyOption}
                onChange={(value) => setPlayerFilters({ ...playerFilters, [key]: value })} />
            ))}
          </div>
          {/* Discipline: segmented buttons with card icons, each counting the players it would show */}
          <div className="discipline-row">
            <span className="quick-field-label"><Ribbon size={14} />{labels.filterDiscipline}</span>
            <div className="discipline-buttons" role="group" aria-label={labels.filterDiscipline}>
              {disciplineButtons.map(([value, label]) => (
                <button type="button" key={value} className={discipline === value ? "is-active" : undefined} aria-pressed={discipline === value}
                  onClick={() => setDiscipline(value)}>
                  {(value === "yellow" || value === "red") && <CardChip color={value} />}
                  {label}
                  <span className="discipline-count">{filteredPlayers.filter((player) => matchesDiscipline(player, value)).length}</span>
                </button>
              ))}
            </div>
          </div>
        </div>}
        <div className="player-grid">
          {visiblePlayers.map((player) => <PlayerFlipCard key={player.id} player={player} locale={locale} labels={labels} />)}
          {!players.length && <p className="empty-note">{locale === "ky" ? "Оюнчулар жакында кошулат." : "Игроки скоро появятся."}</p>}
          {players.length > 0 && !visiblePlayers.length && <p className="empty-note">{labels.noPlayersFound}</p>}
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

      {section === "media" && <MediaPage locale={locale} items={mediaGallery} videos={mediaVideos} channel={settings.brandName} />}

      {section === "rules" && <RulesPage locale={locale} settings={settings} rules={rules} />}

      {section === "horses" && <>
        <div className="hero-shell">
        <div className="hero-rail" aria-hidden="true"><span className="hero-rail-pattern" /></div>
        <section className="market-hero page-hero">
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
        </section>
        </div>

        {/* Quick find: a full-width filter band under the header, above the horse videos */}
        <div className="quick-find-band">
          <form className="quick-find" id="quick-find" onSubmit={(event) => { event.preventDefault(); document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" }); }}>
            <div className="quick-find-inner">
              {/* One raised bar: each field shows its label above the value, the search button at the end */}
              <div className="quick-find-bar">
                <MultiSelect label={labels.breed} icon={Ribbon} value={activeCategories} onChange={setActiveCategories} anyLabel={labels.anyOption}
                  options={categories.map((category) => [category.id, text(locale, category.nameKy, category.nameRu)])} />
                <MultiSelect label={labels.region} icon={MapPin} value={activeRegions} onChange={setActiveRegions} anyLabel={labels.anyOption}
                  options={regions.map((region) => [region, region])} />
                <MultiSelect label={labels.priceLabel} icon={Gem} value={activePrices} onChange={setActivePrices} anyLabel={labels.priceAny}
                  options={(Object.keys(priceLabels) as PriceBand[]).map((band) => [band, priceLabels[band]])} />
                <button className="button button-accent quick-find-submit" type="submit"><Search size={18} />{labels.search}</button>
              </div>
            </div>
          </form>
        </div>

        {/* The catalogue (the listings as videos) shares the filter band's shade, so filter and videos read as one block */}
        <div className="catalog-band">
          <section className="horses-section section-wrap" id="catalog">
            <BazaarVideos horses={visibleHorses} locale={locale} price={(value) => moneyLabel(value, locale, labels.som)}
              contacts={{ phone: settings.contactPhone, email: settings.contactEmail, social: settings.socialUrl }} />
            {!visibleHorses.length && <p className="empty-note horse-empty">{labels.noHorses}</p>}
          </section>
        </div>
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
