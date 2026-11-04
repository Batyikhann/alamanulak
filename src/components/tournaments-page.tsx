"use client";

import { useEffect, useState } from "react";
import type { SiteSettings } from "@prisma/client";
import TournamentCard, { dayLabel, months, type LocalizedTournament } from "@/components/tournament-card";
import type { Locale } from "@/lib/i18n";
import { copy, text } from "@/lib/i18n";

// The tournaments page as "жыл айланасы" (the turning year): nomads live by the seasons, so the page
// opens with a round season wheel beside the federation's word on its tournaments. The wheel is a
// picture of the year, not a control: a dot per upcoming race this year (races days apart share one). Below it,
// the tournaments are cards like the news (photo, then dates, title, place and prize or winner), each opening the
// tournament's own page: first the upcoming ones, ordered by their date (the nearest first, each with the time
// left), then, on another background, the finished ones (the most recent first).

type TournamentsPageProps = { locale: Locale; settings: SiteSettings; tournaments: LocalizedTournament[] };

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
    {/* Жыл айланасы: the federation's text about its tournaments, with the season wheel beside it */}
    <section className="home-row tn-wheel" id="calendar">
      <div className="section-wrap wheel-layout">
        <div className="wheel-intro">
          <h1 className="sr-only">{text(locale, settings.calendarTitleKy, settings.calendarTitleRu)}</h1>
          <p className="wheel-intro-text">{text(locale, settings.calendarTextKy, settings.calendarTextRu)}</p>
        </div>

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
      </div>
    </section>

    {/* Алдагы мелдештер: one card per tournament, the nearest first */}
    <section className="home-row tn-section tn-upcoming">
      <div className="section-wrap">
        <div className="section-heading fed-heading"><h2>{labels.upcomingTitle}</h2></div>
        {!upcoming.length && <p className="empty-note">{labels.upcomingEmpty}</p>}
        {upcoming.length > 0 && <div className="news-grid tn-grid">
          {upcoming.map((item) => <TournamentCard key={item.id} item={item} locale={locale} now={now} isNext={item.id === next?.id} />)}
        </div>}
      </div>
    </section>

    {/* Аяктаган мелдештер: the same cards on another background, the most recent first */}
    <section className="home-row tn-section tn-finished">
      <div className="section-wrap">
        <div className="section-heading fed-heading"><h2>{labels.finishedTitle}</h2></div>
        {!results.length && <p className="empty-note">{labels.finishedEmpty}</p>}
        {results.length > 0 && <div className="news-grid tn-grid">
          {results.map((item) => <TournamentCard key={item.id} item={item} locale={locale} />)}
        </div>}
      </div>
    </section>
  </>;
}
