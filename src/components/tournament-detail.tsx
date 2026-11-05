"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, CalendarPlus, Clock, MapPin, Trophy } from "lucide-react";
import LongText from "@/components/long-text";
import TournamentCard, { calendarFile, countdown, dateRange, tournamentPhoto, type LocalizedTournament } from "@/components/tournament-card";
import { copy, text, type Locale } from "@/lib/i18n";

// A tournament's own page: its title, place and dates, its photo, the detailed information the admin wrote, and
// beside it the time left with "add to calendar" (before it), the prize places (the prizes before it, the winning
// teams after) and the result note; below, a few other tournaments.

export default function TournamentDetail({ item, locale, others }: { item: LocalizedTournament; locale: Locale; others: LocalizedTournament[] }) {
  const labels = copy[locale];
  const title = text(locale, item.titleKy, item.titleRu);
  const place = text(locale, item.locationKy, item.locationRu);
  const description = text(locale, item.descriptionKy, item.descriptionRu);
  const note = text(locale, item.resultSummaryKy, item.resultSummaryRu);
  const places = ([1, 2, 3] as const).map((rank) => ({
    rank,
    prize: text(locale, item[`prize${rank}Ky`], item[`prize${rank}Ru`]),
    winner: item.isPast ? text(locale, item[`winner${rank}Ky`], item[`winner${rank}Ru`]) : "",
  })).filter((entry) => entry.prize || entry.winner);
  // The countdown is filled in after mount so the server and browser render the same HTML.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const timer = window.setInterval(tick, 30_000);
    return () => window.clearInterval(timer);
  }, []);
  const left = countdown(item, now, labels);

  return (
    <article className="detail-page section-wrap">
      <a className="detail-back" href={`/${locale}/calendar`}><ArrowLeft size={16} aria-hidden="true" />{labels.allTournaments}</a>
      <header className="detail-head">
        {item.isPast && <span className="detail-status is-past">{labels.result}</span>}
        <h1>{title}</h1>
        <p className="detail-meta">
          <span><MapPin size={15} aria-hidden="true" />{place}</span>
          <span><CalendarDays size={15} aria-hidden="true" />{dateRange(item, locale)}</span>
        </p>
      </header>
      <figure className="detail-photo"><Image src={tournamentPhoto(item)} alt={title} width={1600} height={900} priority unoptimized /></figure>

      <div className="detail-layout">
        <div className="detail-body">
          {description ? <LongText value={description} className="detail-text" /> : <p className="detail-empty">{labels.detailsSoon}</p>}
        </div>
        <aside className="detail-side">
          {!item.isPast && <div className="detail-box">
            <h2>{labels.timeLeftTitle}</h2>
            <p className="detail-countdown"><Clock size={16} aria-hidden="true" />{left ?? "…"}</p>
            <a className="button button-outline" href={calendarFile(item, title, place)} download="alaman-ulak.ics"><CalendarPlus size={16} aria-hidden="true" />{labels.addToCalendar}</a>
          </div>}
          {places.length > 0 && <div className="detail-box">
            <h2>{item.isPast ? labels.winners : labels.prizes}</h2>
            <ol className="detail-places">
              {places.map(({ rank, prize, winner }) => (
                <li key={rank}>
                  <span className={`tn-medal is-${rank}`} aria-label={`${rank}`}>{rank}</span>
                  <span>{winner && <strong>{winner}</strong>}{prize && <small>{prize}</small>}</span>
                </li>
              ))}
            </ol>
          </div>}
          {item.isPast && note && <div className="detail-box">
            <h2>{labels.resultNote}</h2>
            <p className="detail-note"><Trophy size={15} aria-hidden="true" />{note}</p>
          </div>}
        </aside>
      </div>

      {others.length > 0 && <section className="detail-more">
        <h2>{labels.otherTournaments}</h2>
        <div className="news-grid">{others.map((other) => <TournamentCard key={other.id} item={other} locale={locale} />)}</div>
      </section>}
    </article>
  );
}
