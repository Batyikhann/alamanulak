"use client";

import Image from "next/image";
import { ArrowLeft, CalendarDays, MapPin, Phone, Play, Ribbon, Share2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { HorseCategory, HorseListing } from "@prisma/client";
import MarketCard from "@/components/market-card";
import { youtubeId } from "@/components/media-page";
import { copy, text, type Locale } from "@/lib/i18n";

// One horse from the bazaar on its own page: its video and every uploaded photo (a wide 16:9 view with a row of
// thumbnails to switch between them), the details, and the seller's contacts — phone and WhatsApp first, as large
// buttons, then Telegram and Instagram. Until the admin adds the seller's contacts, the federation's are offered.
// Below, one row of other horses to look at.

type Horse = HorseListing & { category: HorseCategory };
export type Contacts = { phone: string; whatsapp: string; social: string };
type Option = { key: string; icon: ReactNode; label: string; value: string; href: string };
type View = { kind: "video"; id: string } | { kind: "photo"; src: string };

// Brand marks drawn simply (the icon set has no brand logos).
const WhatsAppIcon = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 20.5 4.8 16A8.5 8.5 0 1 1 8 19.3Z" /><path d="M9 8.5c0 3.2 3.3 6.5 6.5 6.5l1-1.6-2-1-1 1c-1.2-.5-2.4-1.7-2.9-2.9l1-1-1-2Z" fill="currentColor" stroke="none" /></svg>;
const TelegramIcon = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M21.4 4.2 2.9 11.3c-1 .4-1 1.5 0 1.8l4.6 1.5 1.8 5.4c.2.7 1.1.9 1.6.4l2.6-2.4 4.8 3.5c.6.5 1.5.1 1.6-.6l3-15.3c.2-1-.7-1.8-1.5-1.4Zm-4 4.1-7.7 7-.3 3-1.4-4.4 9-6c.4-.2.7.2.4.4Z" /></svg>;
const InstagramIcon = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" /></svg>;

const digits = (phone: string) => phone.replace(/[^\d]/g, "");

// The seller's ways to be reached: [main (phone, WhatsApp), more (Telegram, Instagram)].
function sellerOptions(horse: Horse, callLabel: string): [Option[], Option[]] {
  // A seller without a WhatsApp number of their own is offered on their phone number
  const whatsapp = horse.sellerWhatsapp || horse.sellerPhone;
  const main: (Option | false)[] = [
    !!horse.sellerPhone && { key: "phone", icon: <Phone size={20} />, label: callLabel, value: horse.sellerPhone, href: `tel:+${digits(horse.sellerPhone)}` },
    !!whatsapp && { key: "whatsapp", icon: <WhatsAppIcon />, label: "WhatsApp", value: whatsapp, href: `https://wa.me/${digits(whatsapp)}` },
  ];
  const more: (Option | false)[] = [
    !!horse.sellerTelegram && { key: "telegram", icon: <TelegramIcon />, label: "Telegram", value: `@${horse.sellerTelegram}`, href: `https://t.me/${horse.sellerTelegram}` },
    !!horse.sellerInstagram && { key: "instagram", icon: <InstagramIcon />, label: "Instagram", value: `@${horse.sellerInstagram}`, href: `https://instagram.com/${horse.sellerInstagram}` },
  ];
  const keep = (list: (Option | false)[]) => list.filter((option): option is Option => Boolean(option));
  return [keep(main), keep(more)];
}

export function federationOptions(contacts: Contacts, callLabel: string): Option[] {
  const options: (Option | false)[] = [
    !!contacts.phone && { key: "phone", icon: <Phone size={20} />, label: callLabel, value: contacts.phone, href: `tel:+${digits(contacts.phone)}` },
    !!contacts.whatsapp && { key: "whatsapp", icon: <WhatsAppIcon />, label: "WhatsApp", value: contacts.whatsapp, href: `https://wa.me/${digits(contacts.whatsapp)}` },
    !!contacts.social && { key: "social", icon: <Share2 size={18} />, label: contacts.social.replace(/^https:\/\/(www\.)?/, "").split("/")[0], value: contacts.social.replace(/^https:\/\/(www\.)?/, ""), href: contacts.social },
  ];
  return options.filter((option): option is Option => Boolean(option));
}

export function ContactLink({ option, large = false }: { option: Option; large?: boolean }) {
  const external = option.href.startsWith("https://");
  return (
    <a className={`horse-contact is-${option.key}${large ? " is-large" : ""}`} href={option.href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      <span className="horse-contact-icon">{option.icon}</span>
      <span><strong>{option.label}</strong><small>{option.value}</small></span>
    </a>
  );
}

// A horse's card, in the bazaar and in the row under a horse's page.
export function HorseCard({ horse, locale, price }: { horse: Horse; locale: Locale; price: (value: number | null) => string }) {
  const labels = copy[locale];
  const video = youtubeId(horse.videoUrl);
  return <MarketCard href={`/${locale}/horses/${horse.id}`} title={text(locale, horse.nameKy, horse.nameRu)} tag={text(locale, horse.category.nameKy, horse.category.nameRu)}
    image={horse.imageUrl || horse.photoUrls[0] || (video ? `https://i.ytimg.com/vi/${video}/hqdefault.jpg` : "")}
    facts={[{ icon: CalendarDays, text: text(locale, horse.ageKy, horse.ageRu) }, { icon: MapPin, text: text(locale, horse.locationKy, horse.locationRu) }]}
    price={price(horse.price)} moreLabel={labels.moreDetails} />;
}

// A bazaar item's own page, the same for a horse and a piece of equipment: `views` are its video and photos.
export function MarketPage({ locale, backHref, name, price, views, aboutTitle, about, facts, contact, moreTitle, more, long = false }: {
  locale: Locale;
  backHref: string;
  name: string;
  price: string;
  views: View[];
  aboutTitle: string;
  about: string;
  facts: [ReactNode, string, string][];
  contact: ReactNode;
  moreTitle: string;
  more: ReactNode[];
  long?: boolean;
}) {
  const labels = copy[locale];
  const [current, setCurrent] = useState(0);
  const view = views[current];

  return (
    <section className="horse-page section-wrap">
      <a className="horse-page-back" href={backHref}><ArrowLeft size={16} />{labels.backToMarket}</a>
      <div className="horse-page-grid">
        <div className="horse-page-media">
          <div className="horse-page-stage">
            {view?.kind === "video" && <iframe src={`https://www.youtube-nocookie.com/embed/${view.id}`} title={name} allow="encrypted-media; picture-in-picture" allowFullScreen />}
            {view?.kind === "photo" && <Image src={view.src} alt={name} width={1600} height={900} unoptimized priority />}
            {!view && <span className="horse-video-blank" aria-hidden="true" />}
          </div>
          {views.length > 1 && <div className="horse-page-thumbs" role="tablist" aria-label={name}>
            {views.map((item, index) => (
              <button type="button" role="tab" aria-selected={index === current} key={item.kind === "video" ? "video" : item.src}
                className={index === current ? "is-active" : undefined} onClick={() => setCurrent(index)}
                aria-label={item.kind === "video" ? labels.playVideo : `${name} ${index + (views[0].kind === "video" ? 0 : 1)}`}>
                <Image src={item.kind === "video" ? `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg` : item.src} alt="" width={240} height={135} unoptimized />
                {item.kind === "video" && <span className="horse-page-thumb-play" aria-hidden="true"><Play size={16} /></span>}
              </button>
            ))}
          </div>}
          <div className="horse-page-about">
            <h2>{aboutTitle}</h2>
            <p>{about}</p>
          </div>
        </div>

        <aside className="horse-page-info">
          <h1>{name}</h1>
          <p className="horse-page-price"><small>{labels.priceLabel}</small>{price}</p>
          <dl className="horse-page-facts">
            {facts.map(([icon, label, value]) => <div key={label}><dt>{icon}{label}</dt><dd>{value}</dd></div>)}
          </dl>
          <div className="horse-page-contact">
            <h2>{labels.sellerContactTitle}</h2>
            {contact}
          </div>
        </aside>
      </div>

      {more.length > 0 && <section className="detail-more">
        <h2>{moreTitle}</h2>
        <div className={`horse-more-row${long ? " is-long" : ""}`}>{more}</div>
      </section>}
    </section>
  );
}

export default function HorsePage({ horse, recommended, locale, contacts, price }: { horse: Horse; recommended: Horse[]; locale: Locale; contacts: Contacts; price: (value: number | null) => string }) {
  const labels = copy[locale];
  const videoId = youtubeId(horse.videoUrl);
  const photos = [...new Set([horse.imageUrl, ...horse.photoUrls].filter(Boolean))];
  const views: View[] = [...(videoId ? [{ kind: "video", id: videoId } as const] : []), ...photos.map((src) => ({ kind: "photo", src }) as const)];
  const [main, more] = sellerOptions(horse, labels.sellerCall);
  const ownContacts = main.length + more.length > 0;

  return <MarketPage locale={locale} backHref={`/${locale}/horses`} name={text(locale, horse.nameKy, horse.nameRu)} price={price(horse.price)} views={views}
    aboutTitle={labels.horseAbout} about={text(locale, horse.descriptionKy, horse.descriptionRu)}
    facts={[
      [<Ribbon size={16} key="breed" />, labels.breed, text(locale, horse.category.nameKy, horse.category.nameRu)],
      [<CalendarDays size={16} key="age" />, labels.horseAge, text(locale, horse.ageKy, horse.ageRu)],
      [<MapPin size={16} key="region" />, labels.region, text(locale, horse.locationKy, horse.locationRu)],
    ]}
    contact={ownContacts
      ? <>
          {horse.sellerName && <p className="horse-page-seller">{horse.sellerName}</p>}
          {main.length > 0 && <div className="horse-contact-main">{main.map((option) => <ContactLink option={option} large key={option.key} />)}</div>}
          {more.length > 0 && <div className="horse-contact-more">{more.map((option) => <ContactLink option={option} key={option.key} />)}</div>}
        </>
      : <>
          <p className="horse-page-note">{labels.sellerContactFallback}</p>
          <div className="horse-contact-main">{federationOptions(contacts, labels.sellerCall).map((option) => <ContactLink option={option} large key={option.key} />)}</div>
        </>}
    moreTitle={labels.horseRecommended}
    more={recommended.map((item) => <HorseCard key={item.id} horse={item} locale={locale} price={price} />)} />;
}
