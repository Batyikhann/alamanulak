"use client";

import Image from "next/image";
import { CalendarDays, Mail, MapPin, Phone, Play, Ribbon, Share2, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import type { HorseCategory, HorseListing } from "@prisma/client";
import { youtubeId } from "@/components/media-page";
import { copy, text, type Locale } from "@/lib/i18n";

// The bazaar as videos: each listing is its YouTube video (uploaded to the federation's channel), shown as a
// YouTube-style card like the Media page and played in the same chest-lid viewer. A "contact" button over
// the video opens the seller's phone, WhatsApp, Telegram and Instagram; until the admin adds them, it offers
// the federation's own contacts. A listing without a video yet shows its photo.

type Horse = HorseListing & { category: HorseCategory };
type Contacts = { phone: string; email: string; social: string };
type Option = { key: string; icon: ReactNode; label: string; value: string; href: string };

// Brand marks drawn simply (the icon set has no brand logos).
const WhatsAppIcon = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 20.5 4.8 16A8.5 8.5 0 1 1 8 19.3Z" /><path d="M9 8.5c0 3.2 3.3 6.5 6.5 6.5l1-1.6-2-1-1 1c-1.2-.5-2.4-1.7-2.9-2.9l1-1-1-2Z" fill="currentColor" stroke="none" /></svg>;
const TelegramIcon = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M21.4 4.2 2.9 11.3c-1 .4-1 1.5 0 1.8l4.6 1.5 1.8 5.4c.2.7 1.1.9 1.6.4l2.6-2.4 4.8 3.5c.6.5 1.5.1 1.6-.6l3-15.3c.2-1-.7-1.8-1.5-1.4Zm-4 4.1-7.7 7-.3 3-1.4-4.4 9-6c.4-.2.7.2.4.4Z" /></svg>;
const InstagramIcon = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" /></svg>;

const digits = (phone: string) => phone.replace(/[^\d]/g, "");

function sellerOptions(horse: Horse, callLabel: string): Option[] {
  const options: (Option | false)[] = [
    !!horse.sellerPhone && { key: "phone", icon: <Phone size={18} />, label: callLabel, value: horse.sellerPhone, href: `tel:+${digits(horse.sellerPhone)}` },
    !!horse.sellerWhatsapp && { key: "whatsapp", icon: <WhatsAppIcon />, label: "WhatsApp", value: horse.sellerWhatsapp, href: `https://wa.me/${digits(horse.sellerWhatsapp)}` },
    !!horse.sellerTelegram && { key: "telegram", icon: <TelegramIcon />, label: "Telegram", value: `@${horse.sellerTelegram}`, href: `https://t.me/${horse.sellerTelegram}` },
    !!horse.sellerInstagram && { key: "instagram", icon: <InstagramIcon />, label: "Instagram", value: `@${horse.sellerInstagram}`, href: `https://instagram.com/${horse.sellerInstagram}` },
  ];
  return options.filter((option): option is Option => Boolean(option));
}

function federationOptions(contacts: Contacts, callLabel: string): Option[] {
  const options: (Option | false)[] = [
    !!contacts.phone && { key: "phone", icon: <Phone size={18} />, label: callLabel, value: contacts.phone, href: `tel:+${digits(contacts.phone)}` },
    !!contacts.email && { key: "email", icon: <Mail size={18} />, label: "Email", value: contacts.email, href: `mailto:${contacts.email}` },
    !!contacts.social && { key: "social", icon: <Share2 size={18} />, label: contacts.social.replace(/^https:\/\/(www\.)?/, "").split("/")[0], value: contacts.social.replace(/^https:\/\/(www\.)?/, ""), href: contacts.social },
  ];
  return options.filter((option): option is Option => Boolean(option));
}

export default function BazaarVideos({ horses, locale, contacts, price }: { horses: Horse[]; locale: Locale; contacts: Contacts; price: (value: number | null) => string }) {
  const labels = copy[locale];
  const [playing, setPlaying] = useState<Horse | null>(null);
  const [contactFor, setContactFor] = useState<Horse | null>(null);

  // Escape closes the contact panel first, then the player.
  useEffect(() => {
    if (!playing && !contactFor) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (contactFor) setContactFor(null);
      else setPlaying(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [playing, contactFor]);

  const name = (horse: Horse) => text(locale, horse.nameKy, horse.nameRu);
  const contactButton = (horse: Horse, extra = "") => (
    <button type="button" className={`horse-contact-button${extra}`} onClick={() => setContactFor(horse)} aria-label={`${labels.sellerContact}: ${name(horse)}`}>
      <Phone size={15} aria-hidden="true" />{labels.sellerContact}
    </button>
  );
  const own = contactFor ? sellerOptions(contactFor, labels.sellerCall) : [];
  const options = contactFor ? (own.length ? own : federationOptions(contacts, labels.sellerCall)) : [];
  const playingId = playing ? youtubeId(playing.videoUrl) : null;

  return (
    <>
      <div className="video-grid horse-video-grid">
        {horses.map((horse) => {
          const id = youtubeId(horse.videoUrl);
          const thumb = id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : horse.imageUrl;
          return (
            <article className="video-card horse-video" key={horse.id}>
              <span className="video-thumb">
                {id
                  ? <button type="button" className="horse-video-open" onClick={() => setPlaying(horse)} aria-label={`${labels.playVideo}: ${name(horse)}`}>
                      <Image src={thumb} alt="" width={480} height={360} unoptimized />
                      <span className="video-play" aria-hidden="true"><Play size={22} /></span>
                    </button>
                  : <>{thumb && <Image src={thumb} alt={name(horse)} width={480} height={360} unoptimized />}<span className="horse-video-soon">{labels.noVideoYet}</span></>}
                <span className="horse-video-price">{price(horse.price)}</span>
                {contactButton(horse)}
              </span>
              <span className="video-meta">
                <span className="video-avatar" aria-hidden="true" />
                <span className="video-text">
                  <strong>{name(horse)}</strong>
                  <small className="horse-video-facts">
                    <span><Ribbon size={13} />{text(locale, horse.category.nameKy, horse.category.nameRu)}</span>
                    <span><CalendarDays size={13} />{text(locale, horse.ageKy, horse.ageRu)}</span>
                    <span><MapPin size={13} />{text(locale, horse.locationKy, horse.locationRu)}</span>
                  </small>
                </span>
              </span>
            </article>
          );
        })}
      </div>

      {playing && playingId && <div className="sandyk" role="dialog" aria-modal="true" aria-label={name(playing)} onClick={() => setPlaying(null)}>
        <figure className="sandyk-lid" key={playing.id} onClick={(event) => event.stopPropagation()}>
          <div className="sandyk-video horse-player">
            <iframe src={`https://www.youtube-nocookie.com/embed/${playingId}?autoplay=1`} title={name(playing)} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
          </div>
          <figcaption className="horse-player-caption">
            <span className="horse-player-title"><b>{name(playing)}</b>{price(playing.price)}</span>
            {contactButton(playing, " is-large")}
          </figcaption>
        </figure>
        <button type="button" className="sandyk-close" onClick={() => setPlaying(null)} aria-label={labels.close} autoFocus><X size={24} /></button>
      </div>}

      {contactFor && <div className="seller-sheet" role="dialog" aria-modal="true" aria-label={labels.sellerContactTitle} onClick={() => setContactFor(null)}>
        <div className="seller-sheet-panel" onClick={(event) => event.stopPropagation()}>
          <button type="button" className="seller-sheet-close" onClick={() => setContactFor(null)} aria-label={labels.close} autoFocus><X size={20} /></button>
          <p className="eyebrow">{name(contactFor)}</p>
          <h3>{labels.sellerContactTitle}</h3>
          {own.length ? (contactFor.sellerName && <p className="seller-sheet-name">{contactFor.sellerName}</p>) : <p className="seller-sheet-note">{labels.sellerContactFallback}</p>}
          <div className="seller-options">
            {options.map((option) => (
              <a key={option.key} className={`seller-option is-${option.key}`} href={option.href} {...(option.href.startsWith("https://") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                <span className="seller-option-icon">{option.icon}</span>
                <span><strong>{option.label}</strong><small>{option.value}</small></span>
              </a>
            ))}
          </div>
        </div>
      </div>}
    </>
  );
}
