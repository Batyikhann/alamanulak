"use client";

import { useEffect, useState } from "react";
import { CalendarPlus, MapPin, Trophy } from "lucide-react";
import type { SiteSettings, Tournament } from "@prisma/client";
import type { Locale } from "@/lib/i18n";
import { copy, text } from "@/lib/i18n";

// The tournaments page as "жыл айланасы" (the turning year): nomads live by the seasons, so the calendar
// is a round season wheel; the next race gets a countdown, results are "байге" (prize) cards, and the
// full list is grouped by season.

type LocalizedTournament = Omit<Tournament, "startsAt" | "endsAt"> & { startsAt: string; endsAt: string; isPast: boolean };
type TournamentsPageProps = { locale: Locale; settings: SiteSettings; tournaments: LocalizedTournament[] };
type Season = 0 | 1 | 2 | 3; // spring, summer, autumn, winter

const months: Record<Locale, string[]> = {
  ky: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
  ru: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
};

// Spring Mar–May, summer Jun–Aug, autumn Sep–Nov, winter Dec–Feb (December counts toward next year's winter).
function seasonOf(date: Date): { season: Season; year: number } {
  const month = date.getUTCMonth();
  if (month === 11) return { season: 3, year: date.getUTCFullYear() + 1 };
  return { season: (month < 2 ? 3 : Math.floor((month - 2) / 3)) as Season, year: date.getUTCFullYear() };
}

// Angle on the wheel: January at the top, clockwise through the year.
function angleOf(date: Date) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1);
  const end = Date.UTC(date.getUTCFullYear() + 1, 0, 1);
  return ((date.getTime() - start) / (end - start)) * Math.PI * 2 - Math.PI / 2;
}

// Rounded so the server and the browser produce identical SVG (their trig results differ in the last digits).
function point(angle: number, radius: number) {
  const round = (value: number) => Math.round(value * 100) / 100;
  return { x: round(200 + radius * Math.cos(angle)), y: round(200 + radius * Math.sin(angle)) };
}

function arc(fromMonth: number, toMonth: number, radius: number) {
  const a = (fromMonth / 12) * Math.PI * 2 - Math.PI / 2;
  const b = (toMonth / 12) * Math.PI * 2 - Math.PI / 2;
  const p = point(a, radius);
  const q = point(b, radius);
  return `M${p.x} ${p.y}A${radius} ${radius} 0 0 1 ${q.x} ${q.y}`;
}

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

export default function TournamentsPage({ locale, settings, tournaments }: TournamentsPageProps) {
  const labels = copy[locale];
  const seasons = [labels.seasonSpring, labels.seasonSummer, labels.seasonAutumn, labels.seasonWinter];
  const upcoming = tournaments.filter((item) => !item.isPast);
  const next = upcoming[0];
  const results = tournaments.filter((item) => item.isPast).reverse();
  const [selectedId, setSelectedId] = useState(next?.id ?? tournaments[tournaments.length - 1]?.id);
  const selected = tournaments.find((item) => item.id === selectedId);
  // The countdown is filled in after mount so the server and browser render the same HTML.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const timer = window.setInterval(tick, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const groups = new Map<string, { label: string; items: LocalizedTournament[] }>();
  for (const item of tournaments) {
    const { season, year } = seasonOf(new Date(item.startsAt));
    const key = `${year}-${season}`;
    if (!groups.has(key)) groups.set(key, { label: `${seasons[season]} ${year}`, items: [] });
    groups.get(key)?.items.push(item);
  }

  let countdown: [number, string][] | null = null;
  let running = false;
  if (next && now !== null) {
    const left = new Date(next.startsAt).getTime() - now;
    running = left <= 0;
    const minutes = Math.max(0, Math.floor(left / 60_000));
    countdown = [[Math.floor(minutes / 1440), labels.unitDays], [Math.floor((minutes % 1440) / 60), labels.unitHours], [minutes % 60, labels.unitMinutes]];
  }

  return (
    <section className="tournaments-page section-wrap" id="calendar">
      <div className="section-heading">
        <div><p className="eyebrow">{labels.calendarLabel}</p><h2>{text(locale, settings.calendarTitleKy, settings.calendarTitleRu)}</h2></div>
      </div>

      {/* Жыл айланасы: the season wheel, a dot per tournament */}
      <div className="wheel-layout">
        <div className="season-wheel">
          <svg viewBox="0 0 400 400" role="img" aria-label={labels.wheelTitle}>
            {[[2, 5], [5, 8], [8, 11], [11, 14]].map(([from, to], season) => (
              <path key={season} className={`wheel-season wheel-season-${season}`} d={arc(from, to, 168)} />
            ))}
            {seasons.map((name, season) => {
              const mid = point(((2 + season * 3 + 1.5) / 12) * Math.PI * 2 - Math.PI / 2, 190);
              return <text key={name} className="wheel-season-label" x={mid.x} y={mid.y + 5}>{name}</text>;
            })}
            <circle className="wheel-ring" cx="200" cy="200" r="140" />
            {months[locale].map((month, index) => {
              const angle = (index / 12) * Math.PI * 2 - Math.PI / 2;
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
            {tournaments.map((item) => {
              const spot = point(angleOf(new Date(item.startsAt)), 140);
              const classes = ["wheel-dot", item.isPast && "is-past", item.id === next?.id && "is-next", item.id === selectedId && "is-selected"].filter(Boolean).join(" ");
              return (
                <g key={item.id} className={classes} onClick={() => setSelectedId(item.id)} transform={`translate(${spot.x} ${spot.y})`}>
                  <title>{text(locale, item.titleKy, item.titleRu)}</title>
                  <circle r="16" className="wheel-dot-hit" />
                  <circle r={item.id === selectedId ? 9 : 7} />
                </g>
              );
            })}
          </svg>
        </div>

        <div className="wheel-side">
          {selected && <article className="card wheel-selected" aria-live="polite">
            <p className="eyebrow">{selected.isPast ? labels.latestResult : selected.id === next?.id ? labels.nextRace : labels.upcoming}</p>
            <h3>{text(locale, selected.titleKy, selected.titleRu)}</h3>
            <p><MapPin size={14} />{text(locale, selected.locationKy, selected.locationRu)}</p>
            <p className="wheel-dates">{dayLabel(selected.startsAt, locale)} — {dayLabel(selected.endsAt, locale)}</p>
            {selected.isPast && text(locale, selected.resultSummaryKy, selected.resultSummaryRu) && <p className="wheel-result"><Trophy size={15} />{text(locale, selected.resultSummaryKy, selected.resultSummaryRu)}</p>}
          </article>}

          {/* Кийинки чабыш: countdown to the next tournament */}
          {next && <div className="next-race">
            <p className="eyebrow">{labels.nextRace}</p>
            <strong>{text(locale, next.titleKy, next.titleRu)}</strong>
            <div className="countdown" aria-live="off">
              {running ? <span className="countdown-live">{labels.raceRunning}</span>
                : (countdown ?? [[0, labels.unitDays], [0, labels.unitHours], [0, labels.unitMinutes]]).map(([value, unit]) => (
                  <span key={unit}><b>{countdown ? String(value).padStart(2, "0") : "--"}</b><small>{unit}</small></span>
                ))}
            </div>
            <a className="button button-outline" href={calendarFile(next, text(locale, next.titleKy, next.titleRu), text(locale, next.locationKy, next.locationRu))} download="alaman-ulak.ics">
              <CalendarPlus size={16} />{labels.addToCalendar}
            </a>
          </div>}
        </div>
      </div>

      {/* Байге: results as prize cards */}
      {results.length > 0 && <div className="bayge">
        <h3 className="bayge-title">{labels.baygeTitle}</h3>
        <div className="bayge-grid">
          {results.map((item) => (
            <article className="bayge-card" key={item.id}>
              <span className="bayge-medal" aria-hidden="true"><Trophy size={22} /></span>
              <p className="bayge-date">{dayLabel(item.startsAt, locale)}</p>
              <h4>{text(locale, item.titleKy, item.titleRu)}</h4>
              <p className="bayge-place"><MapPin size={13} />{text(locale, item.locationKy, item.locationRu)}</p>
              <p className="bayge-result">{text(locale, item.resultSummaryKy, item.resultSummaryRu) || labels.result}</p>
            </article>
          ))}
        </div>
      </div>}

      {/* Сезон боюнча: every tournament, grouped by season */}
      <div className="season-list">
        <h3 className="bayge-title">{labels.bySeason}</h3>
        {[...groups.values()].map((group) => (
          <div className="season-group" key={group.label}>
            <h4>{group.label}</h4>
            {group.items.map((item) => (
              <button type="button" key={item.id} className={`season-row${item.isPast ? " is-past" : ""}${item.id === selectedId ? " is-selected" : ""}`} onClick={() => { setSelectedId(item.id); document.getElementById("calendar")?.scrollIntoView({ behavior: "smooth" }); }}>
                <span className="season-row-date">{dayLabel(item.startsAt, locale)}</span>
                <strong>{text(locale, item.titleKy, item.titleRu)}</strong>
                <span className="season-row-place"><MapPin size={13} />{text(locale, item.locationKy, item.locationRu)}</span>
                <span className="event-status">{item.isPast ? labels.result : item.id === next?.id ? labels.nextRace : labels.upcoming}</span>
              </button>
            ))}
          </div>
        ))}
        {!tournaments.length && <p className="empty-note">{locale === "ky" ? "Мелдештер жакында жарыяланат." : "Расписание скоро появится."}</p>}
      </div>
    </section>
  );
}
