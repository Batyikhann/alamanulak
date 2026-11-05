import Image from "next/image";
import { ArrowRight, Clock, MapPin, Trophy } from "lucide-react";
import type { Tournament } from "@prisma/client";
import { copy, text, type Locale } from "@/lib/i18n";

// A tournament card, built like a news card: the tournament's photo on top (with whether it is the next race,
// coming up or finished), then its dates, title and place, the first prize (before it) or the winner (after),
// and a link to its own page. Shared by the tournaments page and the homepage row; the date helpers are shared
// with the tournament's own page.

export type LocalizedTournament = Omit<Tournament, "startsAt" | "endsAt"> & { startsAt: string; endsAt: string; isPast: boolean };
type Labels = (typeof copy)[Locale];

export const months: Record<Locale, string[]> = {
  ky: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
  ru: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
};

export function dayLabel(value: string, locale: Locale) {
  const date = new Date(value);
  return `${date.getUTCDate()} ${months[locale][date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

// "12 — 14 Июн 2026" within one month, else both dates in full.
export function dateRange(item: LocalizedTournament, locale: Locale) {
  const start = new Date(item.startsAt);
  const end = new Date(item.endsAt);
  if (start.getUTCFullYear() === end.getUTCFullYear() && start.getUTCMonth() === end.getUTCMonth()) {
    return start.getUTCDate() === end.getUTCDate() ? dayLabel(item.startsAt, locale) : `${start.getUTCDate()} — ${dayLabel(item.endsAt, locale)}`;
  }
  return `${dayLabel(item.startsAt, locale)} — ${dayLabel(item.endsAt, locale)}`;
}

export const tournamentHref = (locale: Locale, item: { id: string }) => `/${locale}/calendar/${item.id}`;

// A tournament without its own photo gets one of the site's ulak tartysh photos, always the same one for it.
const fallbackPhotos = ["/images/ulak-steppe-race.jpg", "/images/season-ulak.jpg", "/images/hero-kokboru-crowd.jpg", "/images/hero-ulak.jpg", "/images/riders-sunset.jpg"];
export function tournamentPhoto(item: { id: string; imageUrl: string }) {
  if (item.imageUrl) return item.imageUrl;
  const hash = [...item.id].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7);
  return fallbackPhotos[hash % fallbackPhotos.length];
}

// A one-event calendar file, so the race can be added to a phone's calendar.
export function calendarFile(item: LocalizedTournament, title: string, place: string) {
  const stamp = (value: string) => new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Alaman Ulak//KY", "BEGIN:VEVENT", `UID:${item.id}@alamanulak`, `DTSTAMP:${stamp(item.startsAt)}`,
    `DTSTART:${stamp(item.startsAt)}`, `DTEND:${stamp(item.endsAt)}`, `SUMMARY:${title}`, `LOCATION:${place}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

// Days, hours and minutes until a start, or null once it has begun.
export function timeLeft(startsAt: string, now: number, labels: Labels): [number, string][] | null {
  const left = new Date(startsAt).getTime() - now;
  if (left <= 0) return null;
  const minutes = Math.floor(left / 60_000);
  return [[Math.floor(minutes / 1440), labels.unitDays], [Math.floor((minutes % 1440) / 60), labels.unitHours], [minutes % 60, labels.unitMinutes]];
}

// The countdown line: the time left, or "running now" once it has begun (null before the clock is known).
export function countdown(item: LocalizedTournament, now: number | null, labels: Labels) {
  if (item.isPast || now === null) return null;
  const left = timeLeft(item.startsAt, now, labels);
  return left ? left.map(([value, unit]) => `${value} ${unit}`).join(" ") : labels.raceRunning;
}

export default function TournamentCard({ item, locale, now = null }: { item: LocalizedTournament; locale: Locale; now?: number | null }) {
  const labels = copy[locale];
  const href = tournamentHref(locale, item);
  const title = text(locale, item.titleKy, item.titleRu);
  const winner = item.isPast ? text(locale, item.winner1Ky, item.winner1Ru) || text(locale, item.resultSummaryKy, item.resultSummaryRu) : "";
  const prize = item.isPast ? "" : text(locale, item.prize1Ky, item.prize1Ru);
  const left = countdown(item, now, labels);
  return (
    <article className={`card news-card tn-card${item.isPast ? " is-past" : ""}`}>
      <a className="news-image-wrap" href={href} tabIndex={-1} aria-hidden="true">
        <Image src={tournamentPhoto(item)} alt="" width={900} height={500} unoptimized />
      </a>
      <div className="news-card-body">
        <time dateTime={item.startsAt}>{dateRange(item, locale)}</time>
        <h3><a href={href}>{title}</a></h3>
        <p className="tn-card-facts">
          <span><MapPin size={14} aria-hidden="true" />{text(locale, item.locationKy, item.locationRu)}</span>
          {winner && <span className="is-winner"><Trophy size={14} aria-hidden="true" />{winner}</span>}
          {prize && <span><Trophy size={14} aria-hidden="true" />{labels.prizes}: {prize}</span>}
          {left && <span className="is-countdown"><Clock size={14} aria-hidden="true" />{left}</span>}
        </p>
        <a className="news-more" href={href} aria-label={`${labels.moreDetails}: ${title}`}>{labels.moreDetails}<ArrowRight size={15} aria-hidden="true" /></a>
      </div>
    </article>
  );
}
