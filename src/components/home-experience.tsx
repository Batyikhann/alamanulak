"use client";

import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  ChevronDown,
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
  Trophy,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import FederationPage from "@/components/federation-page";
import LocaleSync from "@/components/locale-sync";
import type {
  AboutPhoto,
  FederationMember,
  HistoryMilestone,
  HorseCategory,
  HorseListing,
  NewsArticle,
  Player,
  RuleSection,
  SiteSettings,
  Team,
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
type TeamWithPlayers = Team & { players: Player[] };
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

type HomeExperienceProps = {
  locale: Locale;
  section?: PublicSection;
  contactHorse?: string;
  settings: SiteSettings;
  articles: LocalizedArticle[];
  tournaments: LocalizedTournament[];
  teams: TeamWithPlayers[];
  rules: RuleSection[];
  categories: HorseCategory[];
  horses: HorseWithCategory[];
  members: FederationMember[];
  aboutPhotos: AboutPhoto[];
  milestones: HistoryMilestone[];
};

// Yurt, flag and mountains: the federation's "who we are" picture.
const federationImage = "/images/yurt-flag.jpg";

// Full-width slides need photos at least ~2400px wide; this is the sharpest one on the site.
const tournamentSlideImage = "/images/hero-horse.jpg";

// Riders in kalpaks at sunset, for the "heritage and future" card.
const legacyImage = "/images/riders-sunset.jpg";

const monthLabels: Record<Locale, string[]> = {
  ky: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
  ru: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
};

// Emblem colours follow the team order, which is stable (sorted by name).
const teamColors = ["#b3262e", "#2d5fa8", "#2f7d4f", "#c9a35c", "#7b3fa0", "#1f7f86"];

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

function TeamEmblem({ index, size = "md" }: { index: number; size?: "md" | "lg" }) {
  return (
    <span
      className={`team-emblem team-emblem-${size}`}
      style={{ "--team-color": teamColors[index % teamColors.length] } as CSSProperties}
      aria-hidden="true"
    />
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
  onContact,
}: {
  horse: HorseWithCategory;
  locale: Locale;
  labels: Labels;
  onContact: (name: string) => void;
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
        <button className="button button-outline horse-contact" type="button" onClick={() => onContact(name)}>{labels.openSection}</button>
      </div>
    </article>
  );
}

export default function HomeExperience({
  locale,
  section,
  contactHorse,
  settings,
  articles,
  tournaments,
  teams,
  rules,
  categories,
  horses,
  members,
  aboutPhotos,
  milestones,
}: HomeExperienceProps) {
  const labels = copy[locale];
  const router = useRouter();
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
  const [messageDraft, setMessageDraft] = useState(() => {
    if (!contactHorse) return "";
    return locale === "ky"
      ? `Саламатсызбы, «${contactHorse}» жылкысы боюнча маалымат алгым келет.`
      : `Здравствуйте, хочу узнать подробнее о лошади «${contactHorse}».`;
  });
  const [formState, setFormState] = useState<"idle" | "sending" | "sent" | "error">("idle");
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
  const playerCount = teams.reduce((total, team) => total + team.players.length, 0);
  const [horsesTitle, ...horsesSubtitle] = text(locale, settings.horsesTitleKy, settings.horsesTitleRu).split("\n");
  const navItems: [PublicSection | "home", string, LucideIcon][] = [
    ["home", labels.navHome, House],
    ["about", labels.navAbout, Info],
    ["calendar", labels.navCalendar, Trophy],
    ["teams", labels.navTeams, Users],
    ["news", labels.navNews, Newspaper],
    ["media", labels.navMedia, Images],
    ["rules", labels.navRules, BookOpen],
    ["horses", labels.navHorses, Store],
    ["contact", labels.navContact, Phone],
  ];
  const stats = [
    { icon: Flag, value: String(foundedYear), label: labels.statFounded },
    { icon: Users, value: String(teams.length), label: labels.statTeams },
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
    ...teams.map((item) => ({ title: text(locale, item.nameKy, item.nameRu), kind: labels.navTeams, href: `/${locale}/teams` })),
    ...horses.map((item) => ({ title: text(locale, item.nameKy, item.nameRu), kind: labels.navHorses, href: `/${locale}/horses` })),
    ...rules.map((item) => ({ title: text(locale, item.titleKy, item.titleRu), kind: labels.navRules, href: `/${locale}/rules` })),
  ];
  const needle = query.trim().toLocaleLowerCase(locale);
  const searchResults = needle ? searchIndex.filter((item) => item.title.toLocaleLowerCase(locale).includes(needle)).slice(0, 8) : [];
  const gallery = [
    { src: settings.heroImageUrl, caption: labels.heroKicker },
    { src: federationImage, caption: labels.country },
    { src: legacyImage, caption: labels.legacyTitle },
    ...articles.map((item) => ({ src: item.imageUrl, caption: text(locale, item.titleKy, item.titleRu) })),
    ...teams.map((item) => ({ src: item.imageUrl, caption: text(locale, item.nameKy, item.nameRu) })),
    ...horses.map((item) => ({ src: item.imageUrl, caption: text(locale, item.nameKy, item.nameRu) })),
  ].filter((item, index, list) => item.src && list.findIndex((other) => other.src === item.src) === index);

  // Home hero slides, in the spirit of a streaming-site carousel: federation, next event, latest news, horse market.
  const nextEvent = upcoming[0];
  const latestArticle = articles[0];
  const marketHorse = horses[0];
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
      image: latestArticle.imageUrl,
      kicker: labels.newsLabel,
      title: text(locale, latestArticle.titleKy, latestArticle.titleRu),
      meta: latestArticle.publishedAt ? [numericDate(latestArticle.publishedAt)] : undefined,
      tagline: text(locale, latestArticle.excerptKy, latestArticle.excerptRu),
      primary: { href: `/${locale}/news`, label: labels.readMore },
    }] : []),
    ...(marketHorse ? [{
      key: "market",
      image: marketHorse.imageUrl,
      kicker: labels.horsesLabel,
      title: text(locale, marketHorse.nameKy, marketHorse.nameRu),
      meta: [text(locale, marketHorse.category.nameKy, marketHorse.category.nameRu), text(locale, marketHorse.ageKy, marketHorse.ageRu), moneyLabel(marketHorse.price, locale, labels.som)],
      tagline: text(locale, marketHorse.descriptionKy, marketHorse.descriptionRu),
      primary: { href: `/${locale}/horses`, label: labels.toMarket },
    }] : []),
  ];
  const activeSlide = heroSlides[slideIndex % heroSlides.length];

  function stepSlide(direction: 1 | -1) {
    setSlideIndex((current) => (current % heroSlides.length + direction + heroSlides.length) % heroSlides.length);
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
    ...teams.map((item) => ({ src: item.imageUrl, caption: text(locale, item.nameKy, item.nameRu), at: new Date(item.updatedAt).getTime() })),
    { src: settings.heroImageUrl, caption: labels.heroKicker, at: new Date(settings.updatedAt).getTime() },
    { src: federationImage, caption: labels.country, at: 0 },
    { src: legacyImage, caption: labels.legacyTitle, at: 0 },
  ]
    .filter((item) => item.src)
    .sort((a, b) => b.at - a.at)
    .filter((item, index, list) => list.findIndex((other) => other.src === item.src) === index)
    .slice(0, 6);

  // The home header sits transparently over the hero photo until the page scrolls.
  useEffect(() => {
    if (section) return;
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [section]);

  async function submitInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormState("sending");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        message: formData.get("message"),
        locale,
      }),
    }).catch(() => null);

    if (response?.ok) {
      setFormState("sent");
      setMessageDraft("");
      form.reset();
    } else {
      setFormState("error");
    }
  }

  function chooseHorse(name: string) {
    router.push(`/${locale}/contact?horse=${encodeURIComponent(name)}`);
  }

  function resetHorseFilters() {
    setActiveCategory("all");
    setActiveRegion("all");
    setActivePrice("any");
  }

  return (
    <main className={`site-shell${section ? ` section-page section-page-${section}` : " home-page"}`}>
      <LocaleSync locale={locale} />
      <header className={`site-header${!section && !scrolled && !menuOpen && !searchOpen ? " is-transparent" : ""}`}>
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
          <div className="lang-toggle" aria-label="Language">
            {(["ky", "ru"] as const).map((code) => (
              <a key={code} className={code === locale ? "is-active" : undefined} aria-current={code === locale ? "true" : undefined} href={`/${code}${section ? `/${section}` : ""}`}>
                {code === "ky" ? "KG" : "RU"}
              </a>
            ))}
          </div>
          <button className="icon-button theme-toggle" type="button" onClick={toggleTheme} aria-label={labels.themeLabel} title={labels.themeLabel}>
            <Sun className="theme-icon-sun" size={19} aria-hidden="true" />
            <Moon className="theme-icon-moon" size={19} aria-hidden="true" />
          </button>
          <span className="header-divider" aria-hidden="true" />
          <button className="icon-button" type="button" onClick={() => { setSearchOpen(!searchOpen); setMenuOpen(false); }} aria-label={labels.searchLabel} aria-expanded={searchOpen} aria-controls="site-search">
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
          <div className="hero-country">
            <span><strong>{labels.country}</strong><small>{labels.footerTagline}</small></span>
            <span className="flag-kg" aria-hidden="true" />
          </div>
        </section>
        </div>

        <section className="home-row home-row-lead">
          <div className="lead-row">
            <article className="lead-card about-card">
              <div className="about-card-copy">
                <p className="eyebrow">{labels.navAbout}</p>
                <h2>{labels.homeAbout}</h2>
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
          <RowHeading title={labels.homeTeams} icon={Users} href={`/${locale}/teams`} linkLabel={labels.allTeams} />
          <RowTrack labels={labels}>
            {teams.map((team, index) => (
              <a className="row-card team-tile" key={team.id} href={`/${locale}/teams`}>
                <TeamEmblem index={index} />
                <strong>{text(locale, team.nameKy, team.nameRu)}</strong>
                <small><MapPin size={12} />{text(locale, team.locationKy, team.locationRu)}</small>
                <small className="team-tile-count">{team.players.length} {labels.players}</small>
              </a>
            ))}
          </RowTrack>
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
                <HorseCard horse={horse} locale={locale} labels={labels} onContact={chooseHorse} />
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
        stats={[...stats, { icon: Ribbon, value: String(playerCount), label: labels.statPlayers }]}
        crownImage={federationImage}
      />}

      {section === "calendar" && <section className="calendar-section section-wrap" id="calendar">
        <div className="section-heading">
          <div><p className="eyebrow">{labels.calendarLabel}</p><h2>{text(locale, settings.calendarTitleKy, settings.calendarTitleRu)}</h2></div>
        </div>
        <div className="calendar-grid">
          <div className="tournament-list">
            {upcoming.length ? upcoming.map((item) => (
              <article className="card tournament-row" key={item.id}>
                <DateBlock value={item.startsAt} locale={locale} />
                <div className="tournament-info">
                  <h3>{text(locale, item.titleKy, item.titleRu)}</h3>
                  <p><MapPin size={14} />{text(locale, item.locationKy, item.locationRu)}</p>
                  <p><CalendarDays size={14} />{dateLabel(item.startsAt, locale)} — {dateLabel(item.endsAt, locale, true)}</p>
                </div>
                <span className="event-status">{labels.upcoming}</span>
                <ArrowRight className="row-arrow" size={19} />
              </article>
            )) : <p className="empty-note">{locale === "ky" ? "Мелдештер жакында жарыяланат." : "Расписание скоро появится."}</p>}
          </div>
          <aside className="result-panel">
            <p className="eyebrow">{labels.latestResult}</p>
            {past[0] ? (
              <>
                <span className="result-date">{dateLabel(past[0].startsAt, locale, true)}</span>
                <h3>{text(locale, past[0].titleKy, past[0].titleRu)}</h3>
                <p className="result-location"><MapPin size={14} />{text(locale, past[0].locationKy, past[0].locationRu)}</p>
                <div className="result-score"><Trophy size={18} /><span>{text(locale, past[0].resultSummaryKy, past[0].resultSummaryRu) || labels.result}</span></div>
              </>
            ) : <p>{locale === "ky" ? "Жыйынтыктар жарыяланганда бул жерде көрсөтүлөт." : "Результаты появятся здесь после турнира."}</p>}
            <span className="result-watermark" aria-hidden="true" />
          </aside>
        </div>
      </section>}

      {section === "teams" && <section className="teams-section section-wrap" id="teams">
        <div className="section-heading">
          <div><p className="eyebrow">{labels.teamLabel}</p><h2>{text(locale, settings.teamTitleKy, settings.teamTitleRu)}</h2></div>
        </div>
        <div className="team-grid">
          {teams.map((team, index) => (
            <article className="card team-card" key={team.id}>
              <div className="team-image-wrap">
                {team.imageUrl ? <Image src={team.imageUrl} alt={text(locale, team.nameKy, team.nameRu)} width={900} height={500} unoptimized /> : <div className="team-image-placeholder" />}
              </div>
              <div className="team-card-body">
                <TeamEmblem index={index} size="lg" />
                <div className="team-card-heading">
                  <h3>{text(locale, team.nameKy, team.nameRu)}</h3>
                  <span><MapPin size={13} />{text(locale, team.locationKy, team.locationRu)}</span>
                </div>
                <p>{text(locale, team.descriptionKy, team.descriptionRu)}</p>
                <div className="player-list">
                  {team.players.slice(0, 4).map((player) => <div key={player.id}><span>{player.number ? String(player.number).padStart(2, "0") : "—"}</span><strong>{player.name}</strong><small>{text(locale, player.positionKy, player.positionRu)}</small></div>)}
                </div>
              </div>
            </article>
          ))}
          {!teams.length && <p className="empty-note">{locale === "ky" ? "Командалар жакында кошулат." : "Команды скоро появятся."}</p>}
        </div>
      </section>}

      {section === "news" && <section className="news-section section-wrap" id="news">
        <div className="section-heading">
          <div><p className="eyebrow">{labels.newsLabel}</p><h2>{text(locale, settings.newsTitleKy, settings.newsTitleRu)}</h2></div>
        </div>
        <div className="news-grid">
          {articles.map((article) => (
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
          {!articles.length && <p className="empty-note">{locale === "ky" ? "Жаңылыктар жакында жарыяланат." : "Новости скоро появятся."}</p>}
        </div>
      </section>}

      {section === "media" && <section className="media-section section-wrap" id="media">
        <div className="section-heading">
          <div><p className="eyebrow">{labels.mediaLabel}</p><h2>{labels.mediaTitle}</h2></div>
        </div>
        <div className="gallery-grid">
          {gallery.map((item) => (
            <figure className="card gallery-item" key={item.src}>
              <Image src={item.src} alt={item.caption} width={900} height={640} unoptimized />
              <figcaption>{item.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>}

      {section === "rules" && <section className="rules-section section-wrap" id="rules">
        <div className="rules-intro">
          <p className="eyebrow">{labels.rulesLabel}</p>
          <h2>{text(locale, settings.rulesTitleKy, settings.rulesTitleRu)}</h2>
          <span className="rules-tunduk" aria-hidden="true" />
        </div>
        <div className="rules-list">
          {rules.map((rule, index) => (
            <details className="card rule-item" key={rule.id} open={index === 0}>
              <summary><span className="rule-index">{String(index + 1).padStart(2, "0")}</span><strong>{text(locale, rule.titleKy, rule.titleRu)}</strong><ChevronDown size={19} /></summary>
              <p>{text(locale, rule.bodyKy, rule.bodyRu)}</p>
            </details>
          ))}
          {!rules.length && <p className="empty-note">{locale === "ky" ? "Эрежелер жаңыртылууда." : "Правила обновляются."}</p>}
        </div>
      </section>}

      {section === "horses" && <>
        <section className="market-hero">
          <Image className="hero-image" src={horses[0]?.imageUrl ?? settings.heroImageUrl} alt="" width={2200} height={1466} priority unoptimized />
          <div className="market-hero-inner section-wrap">
            <div className="market-hero-copy">
              <p className="eyebrow">{labels.horsesLabel}</p>
              <h1>{horsesTitle}</h1>
              {horsesSubtitle.length > 0 && <p className="market-subtitle">{horsesSubtitle.join(" ")}</p>}
              <p className="market-intro">{labels.horsesIntro}</p>
              <div className="hero-actions">
                <a className="button button-accent" href={`/${locale}/contact`}>{labels.navContact}<ArrowRight size={17} /></a>
                <a className="text-link" href="#catalog">{labels.browseCatalog}<ArrowRight size={15} /></a>
              </div>
              <ul className="market-features">
                {horseFeatures.map(([Icon, label]) => <li key={label}><span><Icon size={20} /></span>{label}</li>)}
              </ul>
            </div>
            <form className="card quick-find" onSubmit={(event) => { event.preventDefault(); document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" }); }}>
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
              <HorseCard key={horse.id} horse={horse} locale={locale} labels={labels} onContact={chooseHorse} />
            ))}
          </div>
          {!visibleHorses.length && <p className="empty-note horse-empty">{labels.noHorses}</p>}
        </section>
      </>}

      {section === "contact" && <section className="contact-section section-wrap" id="contact">
        <div className="contact-layout">
          <div className="contact-copy">
            <p className="eyebrow">{labels.contactLabel}</p>
            <h2>{text(locale, settings.contactTitleKy, settings.contactTitleRu)}</h2>
            <p>{labels.contactIntro}</p>
            <div className="contact-links">
              <p><MapPin size={18} />{text(locale, settings.addressKy, settings.addressRu)}</p>
              <a href={`tel:${settings.contactPhone}`}><Phone size={18} />{settings.contactPhone}<ArrowUpRight size={14} /></a>
              <a href={`mailto:${settings.contactEmail}`}><Mail size={18} />{settings.contactEmail}<ArrowUpRight size={14} /></a>
              {settings.socialUrl && <a href={settings.socialUrl} target="_blank" rel="noreferrer"><MessageCircle size={18} />{labels.social}<ArrowUpRight size={14} /></a>}
            </div>
            <span className="contact-art" aria-hidden="true" />
          </div>
          <form className="card contact-form" onSubmit={submitInquiry}>
            <div className="form-two-col">
              <label>{labels.name}<input name="name" autoComplete="name" required maxLength={100} /></label>
              <label>{labels.phone}<input name="phone" type="tel" autoComplete="tel" required maxLength={40} /></label>
            </div>
            <label>{labels.email}<input name="email" type="email" autoComplete="email" maxLength={150} /></label>
            <label>{labels.message}<textarea name="message" rows={3} required maxLength={2000} value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} /></label>
            <div className="form-submit-row">
              <button className="button button-accent" type="submit" disabled={formState === "sending"}>{formState === "sending" ? "..." : labels.sendMessage}<ArrowRight size={17} /></button>
              <span className={`form-feedback ${formState === "error" ? "is-error" : ""}`} aria-live="polite">{formState === "sent" ? labels.messageSent : formState === "error" ? labels.messageError : ""}</span>
            </div>
          </form>
        </div>
      </section>}

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
