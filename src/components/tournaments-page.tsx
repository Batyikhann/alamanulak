"use client";

import { useEffect, useState } from "react";
import { CalendarDays, CalendarPlus, MapPin, Trophy } from "lucide-react";
import type { SiteSettings, Tournament } from "@prisma/client";
import type { Locale } from "@/lib/i18n";
import { copy, text } from "@/lib/i18n";

// The tournaments page as "жыл айланасы" (the turning year): nomads live by the seasons, so the page
// opens with a round season wheel beside the federation's word on its tournaments. The wheel is a
// picture of the year, not a control: a dot per upcoming race this year (races days apart share one). Below it,
// the tournaments are plain lines of text divided by thin rules: first the upcoming ones (the nearest first,
// each with the time left), then, on another background, the finished ones (the most recent first, with their result).

type LocalizedTournament = Omit<Tournament, "startsAt" | "endsAt"> & { startsAt: string; endsAt: string; isPast: boolean };
type TournamentsPageProps = { locale: Locale; settings: SiteSettings; tournaments: LocalizedTournament[] };
type Labels = (typeof copy)[Locale];

const months: Record<Locale, string[]> = {
  ky: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
  ru: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
};

// The wheel is turned half a month anticlockwise, so January's label sits at the top and each season
// is centred on a side (spring right, summer bottom, autumn left, winter top).
const top = -Math.PI / 2 - Math.PI / 12;

// Angle on the wheel: clockwise through the year from the start of January.
function angleOf(date: Date) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1);
  const end = Date.UTC(date.getUTCFullYear() + 1, 0, 1);
  return ((date.getTime() - start) / (end - start)) * Math.PI * 2 + top;
}

// Rounded so the server and the browser produce identical SVG (their trig results differ in the last digits).
function point(angle: number, radius: number) {
  const round = (value: number) => Math.round(value * 100) / 100;
  return { x: round(200 + radius * Math.cos(angle)), y: round(200 + radius * Math.sin(angle)) };
}

function arc(fromMonth: number, toMonth: number, radius: number) {
  const a = (fromMonth / 12) * Math.PI * 2 + top;
  const b = (toMonth / 12) * Math.PI * 2 + top;
  const p = point(a, radius);
  const q = point(b, radius);
  return `M${p.x} ${p.y}A${radius} ${radius} 0 0 1 ${q.x} ${q.y}`;
}

// Races starting within this many days of each other share one dot on the wheel.
const clusterDays = 10;

function clustersOf(items: LocalizedTournament[]) {
  const clusters: LocalizedTournament[][] = [];
  for (const item of items) {
    const last = clusters[clusters.length - 1];
    if (last && new Date(item.startsAt).getTime() - new Date(last[0].startsAt).getTime() < clusterDays * 86_400_000) last.push(item);
    else clusters.push([item]);
  }
  return clusters;
}

const yearOf = (item: LocalizedTournament) => new Date(item.startsAt).getUTCFullYear();

function dayLabel(value: string, locale: Locale) {
  const date = new Date(value);
  return `${date.getUTCDate()} ${months[locale][date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

// A one-event calendar file, so the next race can be added to a phone's calendar.
function calendarFile(item: LocalizedTournament, title: string, place: string) {
  const stamp = (value: string) => new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Alaman Ulak//KY", "BEGIN:VEVENT", `UID:${item.id}@alamanulak`, `DTSTAMP:${stamp(item.startsAt)}`,
    `DTSTART:${stamp(item.startsAt)}`, `DTEND:${stamp(item.endsAt)}`, `SUMMARY:${title}`, `LOCATION:${place}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

// Days, hours and minutes until a start, or null once it has begun.
function timeLeft(startsAt: string, now: number, labels: Labels): [number, string][] | null {
  const left = new Date(startsAt).getTime() - now;
  if (left <= 0) return null;
  const minutes = Math.floor(left / 60_000);
  return [[Math.floor(minutes / 1440), labels.unitDays], [Math.floor((minutes % 1440) / 60), labels.unitHours], [minutes % 60, labels.unitMinutes]];
}

// One tournament as a line of text: the date, the title with its place and dates and the three prize places
// (the prizes before it, the winning teams after it), then the time left and "add to calendar" (upcoming).
// Rows are divided by thin lines.
function TournamentRow({ item, locale, labels, now, isNext = false }: { item: LocalizedTournament; locale: Locale; labels: Labels; now: number | null; isNext?: boolean }) {
  const title = text(locale, item.titleKy, item.titleRu);
  const place = text(locale, item.locationKy, item.locationRu);
  const start = new Date(item.startsAt);
  const left = !item.isPast && now !== null ? timeLeft(item.startsAt, now, labels) : null;
  const running = !item.isPast && now !== null && !left;
  // The three prize places: before the tournament only the prizes, after it the winning teams as well.
  const places = ([1, 2, 3] as const).map((rank) => ({
    place: rank,
    prize: text(locale, item[`prize${rank}Ky`], item[`prize${rank}Ru`]),
    winner: item.isPast ? text(locale, item[`winner${rank}Ky`], item[`winner${rank}Ru`]) : "",
  })).filter((entry) => entry.prize || entry.winner);
  const note = text(locale, item.resultSummaryKy, item.resultSummaryRu);
  return (
    <li className={`tn-row${isNext ? " is-next" : ""}`}>
      <span className="tn-row-date"><b>{start.getUTCDate()}</b><span>{months[locale][start.getUTCMonth()]} {start.getUTCFullYear()}</span></span>
      <div className="tn-row-main">
        {isNext && <p className="eyebrow">{labels.nextRace}</p>}
        <h3>{title}</h3>
        <p className="tn-row-meta">
          <span><MapPin size={13} />{place}</span>
          <span><CalendarDays size={13} />{dayLabel(item.startsAt, locale)} — {dayLabel(item.endsAt, locale)}</span>
        </p>
        {places.length > 0 && <ol className={`tn-prizes${item.isPast ? " is-results" : ""}`} aria-label={item.isPast ? labels.winners : labels.prizes}>
          {places.map(({ place: rank, prize, winner }) => (
            <li key={rank}>
              <span className={`tn-medal is-${rank}`} aria-label={`${rank}`}>{rank}</span>
              {winner && <strong>{winner}</strong>}
              {prize && <span className="tn-prize">{prize}</span>}
            </li>
          ))}
        </ol>}
        {item.isPast && note && <p className="tn-row-note"><Trophy size={14} aria-hidden="true" />{note}</p>}
      </div>
      {!item.isPast && <div className="tn-row-side">
          <span className="tn-row-left">{running ? labels.raceRunning : left ? left.map(([value, unit]) => `${value} ${unit}`).join(" ") : ""}</span>
          <a className="tn-row-ics" href={calendarFile(item, title, place)} download="alaman-ulak.ics" aria-label={`${labels.addToCalendar}: ${title}`} title={labels.addToCalendar}><CalendarPlus size={16} /></a>
        </div>}
    </li>
  );
}

export default function TournamentsPage({ locale, settings, tournaments }: TournamentsPageProps) {
  const labels = copy[locale];
  const seasons = [labels.seasonSpring, labels.seasonSummer, labels.seasonAutumn, labels.seasonWinter];
  const upcoming = tournaments.filter((item) => !item.isPast);
  const next = upcoming[0];
  const results = tournaments.filter((item) => item.isPast).reverse();
  const year = next ? yearOf(next) : null;
  const clusters = clustersOf(upcoming.filter((item) => yearOf(item) === year));
  // The countdown is filled in after mount so the server and browser render the same HTML.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const timer = window.setInterval(tick, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return <>
    {/* Жыл айланасы: the season wheel beside the federation's text about its tournaments */}
    <section className="home-row tn-wheel" id="calendar">
      <div className="section-wrap wheel-layout">
        <div className="season-wheel">
          <svg viewBox="-64 0 528 400" role="img" aria-label={year ? `${labels.wheelTitle} ${year}` : labels.wheelTitle}>
            {[[2, 5], [5, 8], [8, 11], [11, 14]].map(([from, to], season) => (
              <path key={season} className={`wheel-season wheel-season-${season}`} d={arc(from, to, 168)} />
            ))}
            {seasons.map((name, season) => {
              // Spring and autumn sit on the sides: they start (or end) just outside the ring so the word
              // reads outward instead of running into it; the viewBox leaves them room on both sides.
              const side = season === 0 ? "start" : season === 2 ? "end" : "middle";
              const mid = point(((2 + season * 3 + 1.5) / 12) * Math.PI * 2 + top, side === "middle" ? 190 : 184);
              return <text key={name} className="wheel-season-label" x={mid.x} y={mid.y} textAnchor={side}>{name}</text>;
            })}
            <circle className="wheel-ring" cx="200" cy="200" r="140" />
            {months[locale].map((month, index) => {
              const angle = (index / 12) * Math.PI * 2 + top;
              const tick = point(angle, 140);
              const inner = point(angle, 128);
              const label = point(angle + Math.PI / 12, 112);
              return (
                <g key={month}>
                  <line className="wheel-tick" x1={tick.x} y1={tick.y} x2={inner.x} y2={inner.y} />
                  <text className="wheel-month" x={label.x} y={label.y + 4}>{month}</text>
                </g>
              );
            })}
            <circle className="wheel-hub" cx="200" cy="200" r="62" />
            <image href="/ornaments/tunduk.svg" x="158" y="158" width="84" height="84" className="wheel-tunduk" />
            {clusters.map((cluster) => {
              const spot = point(angleOf(new Date(cluster[0].startsAt)), 140);
              const classes = ["wheel-dot", cluster.some((item) => item.id === next?.id) && "is-next"].filter(Boolean).join(" ");
              return (
                <g key={cluster[0].id} className={classes} transform={`translate(${spot.x} ${spot.y})`}>
                  <title>{cluster.map((item) => `${dayLabel(item.startsAt, locale)} — ${text(locale, item.titleKy, item.titleRu)}`).join("\n")}</title>
                  <circle r={cluster.length > 1 ? 11 : 7} />
                  {cluster.length > 1 && <text className="wheel-dot-count" y="4">{cluster.length}</text>}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="section-heading wheel-intro">
          <p className="eyebrow">{labels.calendarLabel}</p>
          <h2>{text(locale, settings.calendarTitleKy, settings.calendarTitleRu)}</h2>
          <p className="wheel-intro-text">{text(locale, settings.calendarTextKy, settings.calendarTextRu)}</p>
        </div>
      </div>
    </section>

    {/* Алдагы мелдештер: one line per tournament, the nearest first */}
    <section className="home-row tn-section tn-upcoming">
      <div className="section-wrap">
        <div className="section-heading fed-heading"><h2>{labels.upcomingTitle}</h2></div>
        {!upcoming.length && <p className="empty-note">{labels.upcomingEmpty}</p>}
        {upcoming.length > 0 && <ul className="tn-rows">
          {upcoming.map((item) => <TournamentRow key={item.id} item={item} locale={locale} labels={labels} now={now} isNext={item.id === next?.id} />)}
        </ul>}
      </div>
    </section>

    {/* Аяктаган мелдештер: the same lines on another background, the most recent first */}
    <section className="home-row tn-section tn-finished">
      <div className="section-wrap">
        <div className="section-heading fed-heading"><h2>{labels.finishedTitle}</h2></div>
        {!results.length && <p className="empty-note">{labels.finishedEmpty}</p>}
        {results.length > 0 && <ul className="tn-rows">
          {results.map((item) => <TournamentRow key={item.id} item={item} locale={locale} labels={labels} now={now} />)}
        </ul>}
      </div>
    </section>
  </>;
}
