"use client";

import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Flag,
  House,
  Images,
  Info,
  Languages,
  Mail,
  MapPin,
  Menu,
  Newspaper,
  Phone,
  Play,
  Ribbon,
  Search,
  Store,
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
import TournamentCard, { tournamentHref, type LocalizedTournament } from "@/components/tournament-card";
import TournamentDetail from "@/components/tournament-detail";
import NewsCard, { articleHref, numericDate, type LocalizedArticle } from "@/components/news-card";
import ArticleDetail from "@/components/article-detail";
import PageLead from "@/components/page-lead";
import LocaleSync from "@/components/locale-sync";
import { FilterBar, type FilterField } from "@/components/filter-bar";
import BazaarCatalog from "@/components/bazaar-catalog";
import HorsePage from "@/components/horse-page";
import { FacebookIcon, InstagramIcon, WhatsappIcon } from "@/components/social-icons";
import type {
  FederationMember,
  HistoryMilestone,
  MediaItem,
  HorseCategory,
  HorseListing,
  Player,
  PlayerCard,
  RuleSection,
  SiteSettings,
} from "@prisma/client";
import type { Locale, PublicSection } from "@/lib/i18n";
import { copy, foundedYear, text } from "@/lib/i18n";
import { latticeCell } from "@/lib/kerege";
import { demoPlayerPhoto } from "@/lib/portraits";
import { orderCookie, shuffled } from "@/lib/shuffle";

type HorseWithCategory = HorseListing & { category: HorseCategory };
type Labels = (typeof copy)[Locale];
type PlayerFilterKey = "club" | "city" | "position" | "discipline";
// Each filter holds the ticked values; an empty list means "any".
const noPlayerFilters: Record<PlayerFilterKey, string[]> = { club: [], city: [], position: [], discipline: [] };
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
  // On /[locale]/horses/[id]: the listing whose own page is shown instead of the bazaar.
  horseId?: string;
  // On /[locale]/calendar/[id] and /[locale]/news/[id]: the tournament or article whose own page is shown.
  tournamentId?: string;
  article?: LocalizedArticle;
  // The signed-in admin (null for visitors): their avatar in the header opens the admin settings.
  admin?: { name: string; photoUrl: string } | null;
  // This visit's order for the bazaar, media and players lists (lib/shuffle.ts)
  orderSeed: number;
  settings: SiteSettings;
  articles: LocalizedArticle[];
  tournaments: LocalizedTournament[];
  players: PlayerWithCards[];
  rules: RuleSection[];
  categories: HorseCategory[];
  horses: HorseWithCategory[];
  members: FederationMember[];
  milestones: HistoryMilestone[];
  mediaItems: MediaItem[];
};

// Yurt, flag and mountains: the federation's "who we are" picture.
const federationImage = "/images/yurt-flag.jpg";

// The home hero's video (a herd's hooves on the steppe at dusk): full HD for wide screens, 720p for phones, and a
// still shown until it plays (and instead of it for visitors who ask for less motion). Set to null to bring the
// slides back.
const heroVideo: { src: string; small: string; poster: string } | null = {
  src: "/videos/hero-horses.mp4",
  small: "/videos/hero-horses-720.mp4",
  poster: "/videos/hero-horses.jpg",
};

// A full field of riders racing across the steppe, for the tournament slides.
const tournamentSlideImage = "/images/ulak-steppe-race.jpg";

// Riders in red and blue racing for the goat before a full stand: the news slide's background.
const newsSlideImage = "/images/season-ulak.jpg";

// A herd in low sun, a foal and a mare looking straight at you: the horse market page header.
const marketImage = "/images/bazaar-horses.jpg";
// A bridled chestnut horse before snow peaks: the horse market's slide on the homepage.
const marketSlideImage = "/images/bazaar-slide.jpg";

// A felt yurt on the shore of Son-Kul under a storm sky: the federation page header.
const aboutHeaderImage = "/images/about-yurt-sonkul.jpg";

// Riders in kalpaks at sunset, for the "heritage and future" card.
const legacyImage = "/images/riders-sunset.jpg";
// The site's other photos, which fill out the media page's photo wall until the admin adds photos of their own.
// Kok-boru photos from Wikimedia Commons (credits in /public/images/media/CREDITS.md), for the same wall.
const demoMediaPhotos: [string, string, string, MediaCategory][] = [
  ["/images/media/kokboru-01.jpg", "Дүйнөлүк көчмөндөр оюндары, Чолпон-Ата", "Всемирные игры кочевников, Чолпон-Ата", "tournaments"],
  ["/images/media/kokboru-02.jpg", "Улакты казанга салуу учуру", "Бросок улака в казан", "tournaments"],
  ["/images/media/kokboru-03.jpg", "Командалар талаага чыгышты", "Команды выходят на поле", "tournaments"],
  ["/images/media/kokboru-04.jpg", "Улак үчүн күрөш", "Борьба за улак", "players"],
  ["/images/media/kokboru-05.jpg", "Чабандес улакты алып кетти", "Всадник уносит улак", "players"],
  ["/images/media/kokboru-06.jpg", "Улак менен казанды көздөй", "С улаком к казану", "players"],
  ["/images/media/kokboru-08.jpg", "Беттешүү учуру, Чолпон-Ата", "Момент схватки, Чолпон-Ата", "tournaments"],
  ["/images/media/kokboru-09.jpg", "Көк формадагы чабандес", "Всадник в синей форме", "players"],
  ["/images/media/kokboru-10.jpg", "Кыргызстандын желеги менен", "С флагом Кыргызстана", "federation"],
  ["/images/media/kokboru-11.jpg", "Көк бөрү, 2018-жыл", "Кок-бору, 2018 год", "tournaments"],
  ["/images/media/kokboru-12.jpg", "Көрүүчүлөр улак тартышты карап турушат", "Зрители смотрят улак тартыш", "federation"],
  ["/images/media/kokboru-13.jpg", "Кыргыз көк бөрү фестивалы, Улан-Удэ", "Кыргызский фестиваль кок-бору, Улан-Удэ", "tournaments"],
  ["/images/media/kokboru-14.jpg", "Талаадагы көк бөрү", "Кок-бору в поле", "players"],
  ["/images/media/kokboru-15.jpg", "Көк бөрү, XIX кылым (архив сүрөтү)", "Кок-бору, XIX век (архивное фото)", "federation"],
];
const sitePhotos: [string, string, string][] = [
  ["/images/hero-ulak.jpg", "Улак тартыш", "Улак тартыш"],
  ["/images/band-sonkul.jpg", "Соң-Көл жайлоосу", "Джайлоо Сон-Куль"],
  ["/images/about-yurt-sonkul.jpg", "Соң-Көлдүн жээгиндеги боз үй", "Юрта на берегу Сон-Куля"],
  ["/images/yurt-interior.jpg", "Боз үйдүн ичи", "Внутри юрты"],
  ["/images/season-ulak.jpg", "Мелдештин сезону", "Сезон состязаний"],
];

const monthLabels: Record<Locale, string[]> = {
  ky: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
  ru: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
};



function dateLabel(value: string, locale: Locale, withYear = false) {
  const date = new Date(value);
  return `${date.getUTCDate()} ${monthLabels[locale][date.getUTCMonth()]}${withYear ? ` ${date.getUTCFullYear()}` : ""}`;
}

function moneyLabel(value: number | null, locale: Locale, som: string) {
  if (value === null) return locale === "ky" ? "Баасы сүйлөшүлөт" : "Цена договорная";
  // Grouped by hand: browsers without Kyrgyz locale data would format differently from the server.
  return `${String(value).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ${som}`;
}

// Player photo, or a demo portrait until the admin uploads one; the shirt number sits on the edge.
function PlayerPortrait({ player, size }: { player: Player; size: number }) {
  return (
    <span className="player-portrait" style={{ "--portrait": `${size}px` } as CSSProperties}>
      <Image src={player.imageUrl || demoPlayerPhoto} alt="" width={size * 2} height={size * 2} unoptimized />
      {player.number !== null && <span className="player-number">{player.number}</span>}
    </span>
  );
}

// A player's card: tap to turn it over for the details; it turns back by itself once it scrolls out of view.
// A player with their card: one at most, yellow or red (a second yellow makes it red).
type PlayerWithCards = Player & { card?: (PlayerCard & { tournament?: { titleKy: string; titleRu: string } | null }) | null };

// A yellow or red card as a small coloured rectangle.
function CardChip({ color }: { color: string }) {
  return <span className={`card-chip is-${color === "red" ? "red" : "yellow"}`} aria-hidden="true" />;
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
  const card = player.card;
  const cardName = card?.color === "red" ? labels.cardRed : labels.cardYellow;
  // Both faces take the player's card colour (below the front's blue band): red, yellow, or green with no card.
  const cardStatus = !card ? "clean" : card.color === "red" ? "red" : "yellow";

  useEffect(() => {
    const node = cardRef.current;
    if (!node || !flipped) return;
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) setFlipped(false); });
    observer.observe(node);
    return () => observer.disconnect();
  }, [flipped]);

  // Both faces list the details as label–value pairs, one per line: who the player is on the front, the rest on the back.
  const pairs = (list: [string, string][]) => list.filter((fact) => Boolean(fact[1]));
  const frontFacts = pairs([
    [labels.playerName, player.name],
    [labels.playerAge, age !== null ? String(age) : ""],
    [labels.playerPosition, position],
    [labels.playerClub, club],
    [labels.playerCity, city],
  ]);
  const backFacts = pairs([
    [labels.playerName, player.name],
    [labels.playerNumber, player.number !== null ? String(player.number) : ""],
    [labels.playerBorn, player.birthYear ? String(player.birthYear) : ""],
  ]);
  const factList = (list: [string, string][]) => (
    <span className="player-facts">
      {list.map(([label, value]) => <span key={label}><small>{label}</small><b>{value}</b></span>)}
    </span>
  );

  return (
    <button ref={cardRef} type="button" className={`player-flip is-card-${cardStatus}${flipped ? " is-flipped" : ""}`} onClick={() => setFlipped(!flipped)} aria-pressed={flipped} aria-label={`${player.name}: ${flipped ? labels.cardFront : labels.cardBack}`}>
      <span className="player-flip-inner">
        <span className="player-face player-face-front" aria-hidden={flipped}>
          <PlayerPortrait player={player} size={128} />
          {factList(frontFacts)}
          {card && <span className="sr-only">{cardName}</span>}
          <span className="player-flip-hint"><RotateCw size={13} />{labels.cardMore}</span>
        </span>
        <span className="player-face player-face-back" aria-hidden={!flipped}>
          {factList(backFacts)}
          {achievements && <span className="player-back-block"><small>{labels.playerAchievements}</small>{achievements}</span>}
          {bio && <span className="player-back-block"><small>{labels.playerAbout}</small>{bio}</span>}
          {/* The card, with its date, tournament and reason */}
          {card && <span className="player-back-block player-back-cards"><small>{labels.cardsTitle}</small>
            <span className="player-card-line">
              <CardChip color={card.color} />
              <span><b>{cardName} · {numericDate(new Date(card.date).toISOString())}</b>
                {(card.tournament || card.reasonKy) && <em>{[card.tournament && text(locale, card.tournament.titleKy, card.tournament.titleRu), text(locale, card.reasonKy, card.reasonRu)].filter(Boolean).join(" · ")}</em>}
              </span>
            </span>
          </span>}
          {!achievements && !bio && !card && <span className="player-back-empty">{labels.playerNoDetails}</span>}
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

// A row's heading, on the left like a page's chapter title: the title and a line about the row; tabs (if any)
// and the link to the whole section sit on the right.
function RowHeading({ title, subtitle, link, children }: { title: string; subtitle: string; link?: { href: string; label: string }; children?: ReactNode }) {
  return (
    <div className="row-heading">
      <div className="row-heading-main">
        <h2>{title}</h2>
        <p className="row-heading-text">{subtitle}</p>
      </div>
      {(children || link) && <div className="row-heading-side">
        {children}
        {link && <a className="row-heading-link" href={link.href}>{link.label}<ArrowRight size={16} /></a>}
      </div>}
    </div>
  );
}

// The about section's picture: a түндүк (the yurt's crown) at the centre of a medallion, ringed by ram-horn
// (кочкор мүйүз) motifs and rosettes, inside a dashed кереге lattice ring, over a line of gold mountains.
// Built from the site's ornaments; the rings turn very slowly, in opposite directions.
function AboutMedallion() {
  return (
    <div className="home-about-art" aria-hidden="true">
      <div className="medallion">
        <svg className="medallion-rings" viewBox="0 0 100 100">
          <circle className="is-kerege" cx="50" cy="50" r="48" />
          <circle cx="50" cy="50" r="35.5" />
          <circle className="is-faint" cx="50" cy="50" r="31" />
        </svg>
        <span className="medallion-horns">
          {Array.from({ length: 8 }, (_, index) => <i key={index} style={{ "--i": index } as CSSProperties} />)}
        </span>
        <span className="medallion-rosettes">
          {Array.from({ length: 8 }, (_, index) => <i key={index} style={{ "--i": index } as CSSProperties} />)}
        </span>
        <span className="medallion-tunduk" />
      </div>
      <span className="medallion-mountains" />
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
  horseId,
  tournamentId,
  article,
  admin,
  settings,
  articles,
  tournaments,
  players,
  rules,
  categories,
  horses,
  members,
  milestones,
  mediaItems,
  orderSeed,
}: HomeExperienceProps) {
  const labels = copy[locale];
  const [playerQuery, setPlayerQuery] = useState("");
  const [playerFilters, setPlayerFilters] = useState(noPlayerFilters);
  const [eventTab, setEventTab] = useState<"upcoming" | "past">("upcoming");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Site search: what is typed, and what was last searched (a search runs on the search button or Enter).
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState("");
  const [slideIndex, setSlideIndex] = useState(0);
  const [slidePaused, setSlidePaused] = useState(false);
  const upcoming = tournaments.filter((item) => !item.isPast);
  const past = tournaments.filter((item) => item.isPast).reverse();
  const [horsesTitle, ...horsesSubtitle] = text(locale, settings.horsesTitleKy, settings.horsesTitleRu).split("\n");
  // The navbar's order (the phone menu follows it): about the federation comes last.
  const navItems: [PublicSection | "home", string, LucideIcon][] = [
    ["home", labels.navHome, House],
    ["calendar", labels.navCalendar, Trophy],
    ["players", labels.navPlayers, Users],
    ["news", labels.navNews, Newspaper],
    ["media", labels.navMedia, Images],
    ["rules", labels.navRules, BookOpen],
    ["horses", labels.navHorses, Store],
    ["about", labels.navAbout, Info],
  ];
  const stats = [
    { icon: Flag, value: String(foundedYear), label: labels.statFounded },
    { icon: Users, value: String(players.length), label: labels.statPlayers },
    { icon: Trophy, value: String(tournaments.length), label: labels.statTournaments },
  ];
  // The homepage shows at most six tournaments per tab; the rest are on the tournaments page.
  const listedEvents = (eventTab === "upcoming" ? upcoming : past).slice(0, 6);
  const searchIndex: { title: string; kind: string; href: string }[] = [
    ...articles.map((item) => ({ title: text(locale, item.titleKy, item.titleRu), kind: labels.navNews, href: articleHref(locale, item) })),
    ...tournaments.map((item) => ({ title: text(locale, item.titleKy, item.titleRu), kind: labels.navCalendar, href: tournamentHref(locale, item) })),
    ...players.map((item) => ({ title: item.name, kind: labels.navPlayers, href: `/${locale}/players` })),
    ...horses.map((item) => ({ title: text(locale, item.nameKy, item.nameRu), kind: labels.navHorses, href: `/${locale}/horses` })),
    ...rules.map((item) => ({ title: text(locale, item.titleKy, item.titleRu), kind: labels.navRules, href: `/${locale}/rules` })),
  ];
  const needle = searched.trim().toLocaleLowerCase(locale);
  const searchResults = needle ? searchIndex.filter((item) => item.title.toLocaleLowerCase(locale).includes(needle)).slice(0, 8) : [];
  // Media page: the admin's media list; until it has items, photos gathered from the rest of the site.
  const gallery: MediaEntry[] = mediaItems.length
    ? mediaItems.map((item) => ({ id: item.id, src: item.imageUrl, caption: text(locale, item.captionKy, item.captionRu), category: item.category as MediaCategory, videoUrl: item.videoUrl, date: new Date(item.createdAt).toISOString() }))
    : ([
      { src: settings.heroImageUrl, caption: labels.heroKicker, category: "federation" },
      { src: tournamentSlideImage, caption: labels.homeTournaments, category: "tournaments" },
      { src: federationImage, caption: labels.country, category: "federation" },
      { src: legacyImage, caption: labels.legacyTitle, category: "federation" },
      ...articles.map((item) => ({ src: item.imageUrl, caption: text(locale, item.titleKy, item.titleRu), category: "tournaments" })),
      ...players.map((item) => ({ src: item.imageUrl, caption: item.name, category: "players" })),
      ...sitePhotos.map(([src, ky, ru]) => ({ src, caption: text(locale, ky, ru), category: "federation" })),
      ...demoMediaPhotos.map(([src, ky, ru, category]) => ({ src, caption: text(locale, ky, ru), category })),
    ] as { src: string; caption: string; category: MediaCategory }[])
      .filter((item, index, list) => item.src && list.findIndex((other) => other.src === item.src) === index)
      .map((item) => ({ ...item, id: item.src }));
  // The bazaar's photos (its header and every listing's) stay in the bazaar: they are not part of the media section.
  const bazaarPhotos = new Set([marketImage, marketSlideImage, ...horses.map((horse) => horse.imageUrl)]);
  const mediaGallery = gallery.filter((item) => item.category !== "horses" && !bazaarPhotos.has(item.src));
  // The media page's videos: admin media items with a YouTube link (until there are some, the page shows demo videos).
  const mediaVideos: MediaVideo[] = mediaItems.flatMap((item) => {
    const id = youtubeId(item.videoUrl);
    return id ? [{ id: item.id, youtubeId: id, title: text(locale, item.captionKy, item.captionRu), date: new Date(item.createdAt).toISOString(), category: item.category as MediaCategory }] : [];
  });

  // Home hero slides, in the spirit of a streaming-site carousel: federation, next event, latest news, horse market.
  // While heroVideo is set, the slides are off: the hero is the video with the federation's own slide over it.
  const nextEvent = upcoming[0];
  const latestArticle = articles[0];
  const mainSlide: HeroSlide = {
    key: "federation",
    image: settings.heroImageUrl,
    kicker: labels.heroKicker,
    title: text(locale, settings.heroTitleKy, settings.heroTitleRu),
    tagline: text(locale, settings.heroTextKy, settings.heroTextRu),
    primary: { href: `/${locale}/calendar`, label: labels.heroAction },
    secondary: { href: `/${locale}/horses`, label: labels.toMarket },
    isMain: true,
  };
  const heroSlides: HeroSlide[] = heroVideo ? [mainSlide] : [
    mainSlide,
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
      image: marketSlideImage,
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

  // The visit's list order is kept for the rest of the browser session (no expiry date: it goes when the browser closes).
  useEffect(() => {
    document.cookie = `${orderCookie}=${orderSeed}; path=/; SameSite=Lax`;
  }, [orderSeed]);

  // The header sits transparently over the photo header (home video, horse market, federation, rules) until the page scrolls.
  const photoHeader = !section || (section === "horses" && !horseId) || section === "about" || section === "rules";
  useEffect(() => {
    if (!photoHeader) return;
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [photoHeader]);

  // The hero video plays muted on its own (React doesn't put `muted` in the server HTML, which phones need before
  // they autoplay, so it is set here); for visitors who ask for less motion it stays on its still.
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;
    video.muted = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) video.pause();
    else video.play().catch(() => {});
  }, [section]);

  // Sections rise gently into view as they are scrolled to (once each), and the cards inside follow one after
  // another. Sections already on screen when the page opens are left as they are, and nothing moves for
  // visitors who ask for less motion. Without JavaScript everything simply shows.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const waiting = [...document.querySelectorAll<HTMLElement>(".home-row, .home-band")].filter((node) => node.getBoundingClientRect().top > window.innerHeight * .92);
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.replace("reveal-wait", "reveal-in");
        observer.unobserve(entry.target);
      }
    }, { rootMargin: "0px 0px -10% 0px" });
    for (const node of waiting) {
      node.classList.add("reveal-wait");
      observer.observe(node);
    }
    return () => {
      observer.disconnect();
      for (const node of waiting) node.classList.remove("reveal-wait");
    };
  }, [section]);

  // The homepage's media row: the newest seven of the media page's items, as a view-only кереге lattice
  // (4 diamonds per wide row, so seven make two full rows; ornament diamonds fill any places left empty).
  // The homepage lattice keeps a balanced shape: on wide screens 4 + 3 diamonds, filled top row first, then the
  // bottom row's ends, its middle last (so a missing photo leaves an ornament in the centre); on phones 8 places
  // in rows of 2, 1, 2, 1, 2. The eighth photo is shown on phones only.
  const homeMediaDesktop = 7;
  const homeMediaPhone = 8;
  const homeMedia = mediaGallery.slice(0, homeMediaPhone);
  const homeMediaK = 4;
  const homeMediaOrder = [0, 1, 2, 3, 4, 6, 5];

  const horsePage = horseId ? horses.find((horse) => horse.id === horseId) : undefined;
  const tournamentPage = tournamentId ? tournaments.find((item) => item.id === tournamentId) : undefined;
  // Below a tournament's page: the next upcoming ones (or, with none left, the latest results); below an article, the latest others.
  const otherTournaments = tournamentPage ? [...upcoming, ...past].filter((item) => item.id !== tournamentPage.id).slice(0, 3) : [];
  const otherArticles = article ? articles.filter((item) => item.id !== article.id).slice(0, 3) : [];


  // Players page filters: name, club, city, position and discipline (yellow card / red card / no card). Several can
  // be ticked in each; none ticked means any.
  const clubOptions = [...new Set(players.map((player) => text(locale, player.clubKy, player.clubRu)).filter(Boolean))].sort();
  const cityOptions = [...new Set(players.map((player) => text(locale, player.cityKy, player.cityRu)).filter(Boolean))].sort();
  const positionOptions = [...new Set(players.map((player) => text(locale, player.positionKy, player.positionRu)).filter(Boolean))].sort();
  const playerFilterFields: FilterField<PlayerFilterKey>[] = [
    { key: "club", label: labels.playerClub, icon: Flag, options: clubOptions.map((option) => [option, option]) },
    { key: "city", label: labels.playerCity, icon: MapPin, options: cityOptions.map((option) => [option, option]) },
    { key: "position", label: labels.playerPosition, icon: User, options: positionOptions.map((option) => [option, option]) },
    { key: "discipline", label: labels.filterDiscipline, icon: Ribbon, options: [["yellow", labels.disciplineYellow], ["red", labels.disciplineRed], ["clean", labels.disciplineClean]] },
  ];
  const playerSearch = playerQuery.trim().toLocaleLowerCase();
  const disciplineOf = (player: PlayerWithCards) => !player.card ? "clean" : player.card.color === "red" ? "red" : "yellow";
  const visiblePlayers = shuffled(players, orderSeed).filter((player) => (!playerSearch || player.name.toLocaleLowerCase().includes(playerSearch))
    && (!playerFilters.club.length || playerFilters.club.includes(text(locale, player.clubKy, player.clubRu)))
    && (!playerFilters.city.length || playerFilters.city.includes(text(locale, player.cityKy, player.cityRu)))
    && (!playerFilters.position.length || playerFilters.position.includes(text(locale, player.positionKy, player.positionRu)))
    && (!playerFilters.discipline.length || playerFilters.discipline.includes(disciplineOf(player))));

  // The other language, named in that language so its readers recognise it: "Русский" on the Kyrgyz site, "Кыргызча" on the Russian one.
  const otherLanguage = {
    href: `/${locale === "ky" ? "ru" : "ky"}${section ? `/${section}` : ""}${horsePage ? `/${horsePage.id}` : tournamentPage ? `/${tournamentPage.id}` : article ? `/${article.id}` : ""}`,
    hrefLang: locale === "ky" ? "ru" : "ky",
    name: locale === "ky" ? "Русский" : "Кыргызча",
  };
  // The footer's social pages, by the network's name. Each links to the page the admin set (WhatsApp opens a chat
  // with the number, digits only in its link); until then the name shows without a link.
  const whatsappDigits = settings.whatsappNumber.replace(/\D/g, "");
  const socialLinks = [
    { key: "whatsapp", href: whatsappDigits ? `https://wa.me/${whatsappDigits}` : "", label: "WhatsApp", icon: WhatsappIcon },
    { key: "instagram", href: settings.instagramUrl, label: "Instagram", icon: InstagramIcon },
    { key: "facebook", href: settings.facebookUrl, label: "Facebook", icon: FacebookIcon },
  ];
  const languageLink = (
    <a href={otherLanguage.href} hrefLang={otherLanguage.hrefLang} aria-label={`${labels.languageLabel}: ${otherLanguage.name}`}>
      <span className="lang-full">{otherLanguage.name}</span><span className="lang-short">{locale === "ky" ? "РУС" : "КЫР"}</span>
      <Languages size={16} aria-hidden="true" />
    </a>
  );
  // The site search bar (navbar panel, and the phone menu): the search mark at its right end runs it.
  const searchForm = (onEscape: () => void, autoFocus = false) => (
    <form className="search-field" role="search" onSubmit={(event) => { event.preventDefault(); setSearched(query); }}>
      <label>
        <span className="sr-only">{labels.searchLabel}</span>
        <input autoFocus={autoFocus} type="search" value={query} placeholder={labels.searchPlaceholder}
          onChange={(event) => { setQuery(event.target.value); if (!event.target.value.trim()) setSearched(""); }}
          onKeyDown={(event) => { if (event.key === "Escape") onEscape(); }} />
      </label>
      <button type="submit" className="search-go" aria-label={labels.searchLabel}><Search size={18} aria-hidden="true" /></button>
    </form>
  );
  const searchList = needle && <ul className="search-results">
    {searchResults.map((item) => <li key={`${item.kind}-${item.title}`}><a href={item.href}><strong>{item.title}</strong><span>{item.kind}</span><ArrowRight size={15} /></a></li>)}
    {!searchResults.length && <li className="search-empty">{labels.noResults}</li>}
  </ul>;

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
          {/* Wide screens: the language switch follows the sections, set apart by a thin line */}
          <span className="nav-divider" aria-hidden="true" />
          <span className="lang-toggle">{languageLink}</span>
        </nav>
        <div className="header-actions">
          {/* Narrower screens (no section links in the bar): the language switch beside the search and menu buttons;
              on phones it is in the menu instead. Only the other language is offered. */}
          <span className="lang-toggle">{languageLink}</span>
          {/* The signed-in admin: opens the admin settings */}
          {admin && <a className="admin-chip" href={`/admin/settings?lang=${locale}`} aria-label={`${labels.adminSettings}: ${admin.name}`} title={`${admin.name} · ${labels.adminSettings}`}>
            <AdminAvatar admin={admin} />
          </a>}
          <span className="header-divider" aria-hidden="true" />
          <button className="icon-button search-toggle" type="button" onClick={() => { setSearchOpen(!searchOpen); setMenuOpen(false); }} aria-label={labels.searchLabel} aria-expanded={searchOpen} aria-controls="site-search">
            {searchOpen ? <X size={20} /> : <Search size={20} />}
          </button>
          {/* The menu button */}
          <button className="icon-button menu-toggle" type="button" onClick={() => { setMenuOpen(!menuOpen); setSearchOpen(false); }} aria-label={menuOpen ? labels.close : labels.menu} aria-expanded={menuOpen} aria-controls="site-menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {searchOpen && <div id="site-search" className="search-panel">
        <div className="section-wrap">
          {searchForm(() => setSearchOpen(false), true)}
          {searchList}
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
          {/* In the burger, the admin sits with the contacts, as in the header */}
          {admin && <a className="menu-drawer-admin" href={`/admin/settings?lang=${locale}`} onClick={() => setMenuOpen(false)}>
            <AdminAvatar admin={admin} />
            <span><strong>{admin.name}</strong><small>{labels.adminRole} · {labels.adminSettings}</small></span>
            <ArrowRight size={17} aria-hidden="true" />
          </a>}
          {/* Phones: the language switch lives here instead of the navbar, as one more line named after the other language */}
          <a className="menu-drawer-lang" href={otherLanguage.href} hrefLang={otherLanguage.hrefLang} aria-label={`${labels.languageLabel}: ${otherLanguage.name}`}>
            <Languages size={19} aria-hidden="true" />{otherLanguage.name}
          </a>
          <span className="menu-drawer-mountains" aria-hidden="true" />
        </nav>
      </>}

      {!section && <>
        <div className="hero-shell">
        <div className="hero-rail" aria-hidden="true">
          <span className="hero-rail-pattern" />
        </div>
        <section
          className={`hero${heroVideo ? " hero-video" : ""}${slidePaused ? " is-paused" : ""}`}
          aria-roledescription={heroSlides.length > 1 ? "carousel" : undefined}
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
          {heroVideo
            ? <video ref={heroVideoRef} className="hero-video-media" poster={heroVideo.poster} autoPlay muted loop playsInline preload="auto" aria-hidden="true">
              <source src={heroVideo.small} type="video/mp4" media="(max-width: 760px)" />
              <source src={heroVideo.src} type="video/mp4" />
            </video>
            : heroSlides.map((slide, index) => (
              <Image key={slide.key} className={`hero-image${slide === activeSlide ? " is-active" : ""}`} src={slide.image} alt="" width={2200} height={1466} priority={index === 0} unoptimized />
            ))}
          <div className={`hero-content${activeSlide.isMain ? "" : " hero-content-slide"}`} key={activeSlide.key} aria-live="polite">
            <p className="eyebrow">{activeSlide.kicker}</p>
            {activeSlide.isMain ? <h1>{activeSlide.title}</h1> : <h2 className="hero-slide-title">{activeSlide.title}</h2>}
            {activeSlide.meta && <p className="hero-meta">{activeSlide.meta.map((item) => <span key={item}>{item}</span>)}</p>}
            {activeSlide.tagline && <p className={activeSlide.isMain ? "hero-tagline" : "hero-slide-text"}>{activeSlide.tagline}</p>}
            <div className="hero-actions">
              <a className="button button-accent" href={activeSlide.primary.href}>{activeSlide.primary.label}<ArrowRight size={17} /></a>
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


        {/* Who we are: the federation's purpose, its numbers and a large photo, side by side (stacked on phones) */}
        <section className="home-row home-about">
          <div className="home-about-inner">
            <div className="home-about-copy">
              <h2>{text(locale, settings.aboutTitleKy, settings.aboutTitleRu)}</h2>
              <p className="home-about-text">{text(locale, settings.aboutTextKy, settings.aboutTextRu)}</p>
              <div className="mini-stats">
                {stats.map(({ icon: Icon, value, label }) => <div key={label}><Icon size={20} /><strong>{value}</strong><span>{label}</span></div>)}
              </div>
              <div className="home-about-actions">
                <a className="button button-outline" href={`/${locale}/about`}>{labels.openSection}<ArrowRight size={16} /></a>
                <a className="hero-round-link" href={`/${locale}/rules`}><span><BookOpen size={16} /></span>{labels.legacyAction}</a>
              </div>
            </div>
            <AboutMedallion />
          </div>
        </section>

        <section className="home-row">
          <RowHeading title={labels.homeTournaments} subtitle={labels.rowTournamentsText} link={{ href: `/${locale}/calendar`, label: labels.allTournaments }}>
            <div className="tabs" role="tablist">
              <button type="button" role="tab" aria-selected={eventTab === "upcoming"} className={eventTab === "upcoming" ? "is-active" : undefined} onClick={() => setEventTab("upcoming")}>{labels.upcomingTab}</button>
              <button type="button" role="tab" aria-selected={eventTab === "past"} className={eventTab === "past" ? "is-active" : undefined} onClick={() => setEventTab("past")}>{labels.pastTab}</button>
            </div>
          </RowHeading>
          <RowTrack labels={labels} key={eventTab}>
            {listedEvents.map((item) => (
              // The tournaments page's card: the tournament's photo, then its dates, title, place and prize or winner
              <div className="row-card tn-row-card" key={item.id}><TournamentCard item={item} locale={locale} isNext={item.id === upcoming[0]?.id} /></div>
            ))}
          </RowTrack>
          {!listedEvents.length && <p className="empty-note row-empty">{locale === "ky" ? "Азырынча маалымат жок." : "Пока нет данных."}</p>}
        </section>

        {settings.bandShown && <HomeBand image={settings.bandImageUrl} title={text(locale, settings.bandTitleKy, settings.bandTitleRu)}
          text={text(locale, settings.bandTextKy, settings.bandTextRu)} videoUrl={settings.bandVideoUrl} labels={labels} />}

        {/* Players: a row of the players page's flip cards, the first eight */}
        <section className="home-row">
          <RowHeading title={labels.homePlayers} subtitle={labels.rowPlayersText} link={players.length ? { href: `/${locale}/players`, label: labels.allPlayers } : undefined} />
          <RowTrack labels={labels}>
            {players.slice(0, 8).map((player) => (
              <div className="row-card player-row-card" key={player.id}><PlayerFlipCard player={player} locale={locale} labels={labels} /></div>
            ))}
          </RowTrack>
          {!players.length && <p className="empty-note row-empty">{locale === "ky" ? "Азырынча маалымат жок." : "Пока нет данных."}</p>}
        </section>

        {/* News: the latest articles as a list of lines (thumbnail, date, title), as the homepage always showed them */}
        <section className="home-row">
          <RowHeading title={text(locale, settings.newsTitleKy, settings.newsTitleRu)} subtitle={labels.rowNewsText} link={articles.length ? { href: `/${locale}/news`, label: labels.allNews } : undefined} />
          {articles.length > 0 && <div className="home-news-list">
            {articles.slice(0, 6).map((article) => (
              <a className="news-line" key={article.id} href={articleHref(locale, article)}>
                <Image src={article.imageUrl} alt="" width={360} height={240} unoptimized />
                <span>
                  {article.publishedAt && <time>{numericDate(article.publishedAt)}</time>}
                  <strong>{text(locale, article.titleKy, article.titleRu)}</strong>
                </span>
              </a>
            ))}
          </div>}
          {!articles.length && <p className="empty-note row-empty">{locale === "ky" ? "Жаңылыктар жакында жарыяланат." : "Новости скоро появятся."}</p>}
        </section>

        <section className="home-row">
          <RowHeading title={labels.homeMedia} subtitle={labels.rowMediaText} link={{ href: `/${locale}/media#photos`, label: labels.allMedia }} />
          <div className="kerege home-kerege" style={{ "--cols-d": homeMediaK * 2, "--cols-m": 4 } as CSSProperties}>
            <div className="kerege-grid">
              {homeMedia.map((item, index) => {
                const desktop = latticeCell(homeMediaOrder[index] ?? index, homeMediaK);
                const mobile = latticeCell(index, 2);
                return (
                  <span className={`kerege-cell${index >= homeMediaDesktop ? " is-mobile-only" : ""}`} key={item.id}
                    style={{ "--dc": desktop.col, "--dr": desktop.row, "--mc": mobile.col, "--mr": mobile.row } as CSSProperties}>
                    <span className="kerege-photo">
                      <Image src={item.src} alt={item.caption} width={800} height={800} unoptimized />
                      {/* Marks a video; the lattice is view-only, so it does not play here */}
                      {item.videoUrl && <span className="kerege-play" aria-hidden="true"><Play size={20} /></span>}
                    </span>
                  </span>
                );
              })}
              <KeregeFillers count={Math.min(homeMedia.length, homeMediaDesktop)} desktopK={homeMediaK} usedPhotos={homeMedia.map((item) => item.src)} total={homeMediaDesktop}
                desktopOrder={homeMediaOrder} mobileCount={homeMedia.length} mobileTotal={homeMediaPhone} />
            </div>
          </div>
        </section>
      </>}

      {section === "about" && <FederationPage
        locale={locale}
        settings={settings}
        members={members}
        milestones={milestones}
        stats={[...stats, { icon: MapPin, value: String(new Set(members.map((member) => member.region).filter(Boolean)).size), label: labels.statRegions }]}
        crownImage={federationImage}
        headerImage={aboutHeaderImage}
      />}

      {section === "calendar" && !tournamentPage && <TournamentsPage locale={locale} settings={settings} tournaments={tournaments} />}
      {tournamentPage && <TournamentDetail item={tournamentPage} locale={locale} isNext={tournamentPage.id === upcoming[0]?.id} others={otherTournaments} />}

      {article && <ArticleDetail article={article} locale={locale} others={otherArticles} />}

      {/* Section pages don't repeat their menu name as a visible title; screen readers still get it */}
      {section === "players" && <section className="players-section section-wrap" id="players">
        <h1 className="sr-only">{text(locale, settings.teamTitleKy, settings.teamTitleRu)}</h1>
        {/* A short lead: the headline and how the cards work */}
        {players.length > 0 && <PageLead title={labels.playersLeadTitle} text={labels.playersLeadText} />}
        {/* A name search bar, with a button beside it that opens every other filter in a pop-up form */}
        {players.length > 0 && <FilterBar query={playerQuery} onQuery={setPlayerQuery} fields={playerFilterFields} filters={playerFilters} onFilters={setPlayerFilters}
          showLabel={labels.filterShow.replace("{n}", String(visiblePlayers.length))}
          labels={{ search: labels.playersSearch, placeholder: labels.playersSearchPlaceholder, filterButton: labels.filterButton, filterTitle: labels.filterTitle, filterReset: labels.filterReset, close: labels.close }} />}
        <div className="player-grid">
          {visiblePlayers.map((player) => <PlayerFlipCard key={player.id} player={player} locale={locale} labels={labels} />)}
          {!players.length && <p className="empty-note">{locale === "ky" ? "Оюнчулар жакында кошулат." : "Игроки скоро появятся."}</p>}
          {players.length > 0 && !visiblePlayers.length && <p className="empty-note">{labels.noPlayersFound}</p>}
        </div>
      </section>}

      {section === "news" && newsPage && <section className="news-section section-wrap" id="news">
        {newsPage.archive
          ? <div className="section-heading"><div><h1>{labels.newsArchive}</h1></div></div>
          : <>
            <h1 className="sr-only">{text(locale, settings.newsTitleKy, settings.newsTitleRu)}</h1>
            <PageLead title={labels.newsLeadTitle} text={labels.newsLeadText} />
          </>}
        <div className="news-grid">
          {newsPage.articles.map((item) => <NewsCard key={item.id} article={item} locale={locale} />)}
          {!newsPage.articles.length && <p className="empty-note">{locale === "ky" ? "Жаңылыктар жакында жарыяланат." : "Новости скоро появятся."}</p>}
        </div>
        <NewsPager newsPage={newsPage} locale={locale} labels={labels} />
      </section>}

      {section === "media" && <MediaPage locale={locale} items={mediaGallery} videos={mediaVideos} orderSeed={orderSeed} />}

      {section === "rules" && <RulesPage locale={locale} settings={settings} rules={rules} />}

      {horsePage && <HorsePage horse={horsePage} locale={locale} price={moneyLabel(horsePage.price, locale, labels.som)}
        contacts={{ phone: settings.contactPhone, email: settings.contactEmail, social: settings.socialUrl }} />}

      {section === "horses" && !horsePage && <>
        <div className="hero-shell">
        <div className="hero-rail" aria-hidden="true"><span className="hero-rail-pattern" /></div>
        <section className="market-hero page-hero bazaar-hero">
          <Image className="market-hero-image" src={marketImage} alt="" width={2400} height={1600} priority unoptimized />
          {/* A short slide-style caption on the photo; the details follow below it */}
          <div className="photo-caption">
            <p className="eyebrow">{labels.horsesLabel}</p>
            <h1 className="photo-caption-title">{[horsesTitle, ...horsesSubtitle].join(" ")}</h1>
            <p className="photo-caption-text">{labels.marketCaption}</p>
            <div className="hero-actions">
              {/* These scroll to the catalogue without changing the address (its hash holds horses or equipment) */}
              <button type="button" className="button button-accent" onClick={() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })}>{labels.browseCatalog}<ArrowRight size={17} /></button>
              <button type="button" className="hero-round-link" onClick={() => { document.getElementById("quick-find")?.scrollIntoView({ behavior: "smooth", block: "center" }); document.querySelector<HTMLInputElement>("#quick-find .filter-search input")?.focus({ preventScroll: true }); }}><span><Search size={16} /></span>{labels.quickFind}</button>
            </div>
          </div>
        </section>
        </div>

        {/* The catalogue: horses and riders' equipment, with the search panel above them */}
        <div className="catalog-band">
          <section className="horses-section section-wrap" id="catalog">
            <BazaarCatalog horses={horses} categories={categories} locale={locale} orderSeed={orderSeed} price={(value) => moneyLabel(value, locale, labels.som)}
              contacts={{ phone: settings.contactPhone, email: settings.contactEmail, social: settings.socialUrl }} />
          </section>
        </div>
      </>}


      {/* The media page scrolls on and on (more loads as you reach the end), so it has no footer */}
      {section !== "media" && <footer className="site-footer">
        <div className="footer-scene" aria-hidden="true" />
        {/* Left: address, phone and email; right: the social pages */}
        <div className="footer-main">
          <address className="footer-column">
            <p><MapPin size={17} />{text(locale, settings.addressKy, settings.addressRu)}</p>
            <a href={`tel:${settings.contactPhone}`}><Phone size={17} />{settings.contactPhone}</a>
            <a href={`mailto:${settings.contactEmail}`}><Mail size={17} />{settings.contactEmail}</a>
          </address>
          <div className="footer-column footer-social">
            {socialLinks.map(({ key, href, label, icon: Icon }) => href
              ? <a key={key} href={href} target="_blank" rel="noreferrer"><Icon size={17} />{label}</a>
              : <p key={key}><Icon size={17} />{label}</p>)}
          </div>
        </div>
        <div className="footer-base">
          <span>© {new Date().getFullYear()} {settings.brandName} · {labels.rights}</span>
        </div>
      </footer>}
    </main>
  );
}
