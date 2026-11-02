"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Phone, X, type LucideIcon } from "lucide-react";
import type { AboutPhoto, FederationMember, HistoryMilestone, SiteSettings } from "@prisma/client";
import type { Locale } from "@/lib/i18n";
import { copy, foundedYear, text } from "@/lib/i18n";
import KeregeFillers from "@/components/kerege-fillers";
import { latticeCell, latticeWidth } from "@/lib/kerege";
import { kgMapSize, kgRegions } from "@/lib/kg-regions";

// The "about" page is built like a боз үй: түндүк (mission and numbers), уук (leadership
// radiating from the leader), кереге (photo lattice), the regions map and the жол timeline.

type Stat = { icon: LucideIcon; value: string; label: string };

type FederationPageProps = {
  locale: Locale;
  settings: SiteSettings;
  members: FederationMember[];
  photos: AboutPhoto[];
  milestones: HistoryMilestone[];
  stats: Stat[];
  crownImage: string;
  headerImage: string;
};

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

function MemberAvatar({ member, size }: { member: FederationMember; size: number }) {
  return (
    <span className="fed-avatar" style={{ "--avatar": `${size}px` } as CSSProperties}>
      {member.photoUrl
        ? <Image src={member.photoUrl} alt="" width={size * 2} height={size * 2} unoptimized />
        : <span className="fed-avatar-initials">{initials(member.name)}</span>}
    </span>
  );
}

function regionName(locale: Locale, id: string) {
  const region = kgRegions.find((item) => item.id === id);
  return region ? text(locale, region.nameKy, region.nameRu) : "";
}

function SectionHeading({ label, title, children }: { label: string; title: string; children?: ReactNode }) {
  return (
    <div className="section-heading fed-heading">
      <p className="eyebrow">{label}</p>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

export default function FederationPage({ locale, settings, members, photos, milestones, stats, crownImage, headerImage }: FederationPageProps) {
  const labels = copy[locale];
  const leader = members.find((member) => member.kind === "leader");
  const board = members.filter((member) => member.kind === "board");
  const circle = leader ? board : board.slice(1);
  const center = leader ?? board[0];
  const [selectedId, setSelectedId] = useState(center?.id);
  const selected = members.find((member) => member.id === selectedId) ?? center;
  const detailRef = useRef<HTMLDivElement>(null);

  const regional = members.filter((member) => member.region);
  const regionIds = [...new Set(regional.map((member) => member.region))];
  const [activeRegion, setActiveRegion] = useState(regionIds[0] ?? "KG-C");
  const regionMembers = regional.filter((member) => member.region === activeRegion);

  const [lightbox, setLightbox] = useState<number | null>(null);
  const desktopK = latticeWidth(photos.length);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(null);
      if (event.key === "ArrowRight") setLightbox((index) => index === null ? null : (index + 1) % photos.length);
      if (event.key === "ArrowLeft") setLightbox((index) => index === null ? null : (index - 1 + photos.length) % photos.length);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, photos.length]);

  function selectMember(id: string) {
    setSelectedId(id);
    if (window.matchMedia("(max-width: 760px)").matches) detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  const [founded, ...orbit] = stats;
  const openPhoto = lightbox === null ? null : photos[lightbox];

  return <>
    {/* Photo header inside the yurt, built like the horse market's: still photo, ornament strip, dark fades */}
    <div className="hero-shell">
      <div className="hero-rail" aria-hidden="true"><span className="hero-rail-pattern" /></div>
      <section className="market-hero page-hero" id="about">
        <Image className="market-hero-image" src={headerImage} alt="" width={1672} height={941} priority unoptimized />
        {/* A short slide-style caption on the photo; the details follow below it */}
        <div className="photo-caption">
          <p className="eyebrow">{labels.fedCrownLabel}</p>
          <h1 className="photo-caption-title">{text(locale, settings.aboutTitleKy, settings.aboutTitleRu)}</h1>
          <p className="photo-caption-text">{labels.aboutCaption.replace("{year}", String(foundedYear))}</p>
          <div className="hero-actions">
            <a className="button button-accent" href={`/${locale}/rules`}>{labels.aboutCta}<ArrowRight size={17} /></a>
            <a className="hero-round-link" href={`/${locale}/calendar`}><span><ArrowRight size={16} /></span>{labels.heroAction}</a>
          </div>
        </div>
      </section>
    </div>

    {/* Who we are, beside the federation's numbers */}
    <section className="home-row fed-crown">
      <div className="section-wrap fed-crown-inner">
        <div className="fed-crown-copy">
          <p className="fed-crown-text">{text(locale, settings.aboutTextKy, settings.aboutTextRu)}</p>
        </div>
        <div className="fed-crown-art">
          <div className="fed-crown-disc">
            <Image src={crownImage} alt={text(locale, "Боз үй жана Кыргызстандын туусу", "Юрта и флаг Кыргызстана")} width={1672} height={941} unoptimized />
            <span className="fed-crown-tunduk" aria-hidden="true" />
          </div>
          {[founded, ...orbit].slice(0, 4).map(({ icon: Icon, value, label }, index) => (
            <div className={`fed-orbit fed-orbit-${index}`} key={label}>
              <Icon size={18} aria-hidden="true" />
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Уук: leadership seen from above, poles running from the leader to the кереге ring */}
    {center && <section className="home-row fed-uuk">
      <div className="section-wrap">
        <SectionHeading label={labels.uukLabel} title={labels.uukTitle}><p className="fed-heading-text">{labels.uukText}</p></SectionHeading>
        <div className="fed-uuk-layout">
          <div className="fed-uuk-ring" style={{ "--count": circle.length } as CSSProperties}>
            <svg className="fed-uuk-lines" viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="47" className="fed-uuk-kerege" />
              {circle.map((member, index) => {
                const angle = (index / circle.length) * Math.PI * 2 - Math.PI / 2;
                return <line key={member.id} x1="50" y1="50" x2={50 + 38 * Math.cos(angle)} y2={50 + 38 * Math.sin(angle)} className={member.id === selected?.id ? "is-active" : undefined} />;
              })}
            </svg>
            <button type="button" className={`fed-node fed-node-center${center.id === selected?.id ? " is-active" : ""}`} onClick={() => selectMember(center.id)} aria-pressed={center.id === selected?.id}>
              <MemberAvatar member={center} size={112} />
              <strong>{center.name}</strong>
              <small>{text(locale, center.roleKy, center.roleRu)}</small>
            </button>
            {circle.map((member, index) => {
              const angle = (index / circle.length) * Math.PI * 2 - Math.PI / 2;
              return (
                <button
                  type="button"
                  key={member.id}
                  className={`fed-node${member.id === selected?.id ? " is-active" : ""}`}
                  style={{ "--x": `${50 + 38 * Math.cos(angle)}%`, "--y": `${50 + 38 * Math.sin(angle)}%` } as CSSProperties}
                  onClick={() => selectMember(member.id)}
                  aria-pressed={member.id === selected?.id}
                >
                  <MemberAvatar member={member} size={72} />
                  <strong>{member.name}</strong>
                  <small>{text(locale, member.roleKy, member.roleRu)}</small>
                </button>
              );
            })}
          </div>
          {selected && <div className="fed-member-card" ref={detailRef} aria-live="polite">
            <MemberAvatar member={selected} size={140} />
            <p className="eyebrow">{text(locale, selected.roleKy, selected.roleRu)}</p>
            <h3>{selected.name}</h3>
            {text(locale, selected.bioKy, selected.bioRu) && <p>{text(locale, selected.bioKy, selected.bioRu)}</p>}
            <div className="fed-member-meta">
              {selected.region && <span><MapPin size={15} />{regionName(locale, selected.region)}</span>}
              {selected.phone && <a href={`tel:${selected.phone}`}><Phone size={15} />{selected.phone}</a>}
            </div>
            <span className="fed-member-card-mark" aria-hidden="true" />
          </div>}
        </div>
      </div>
    </section>}

    {/* Кереге: the photo archive as the yurt's lattice wall */}
    {photos.length > 0 && <section className="home-row fed-kerege">
      <div className="section-wrap">
        <SectionHeading label={labels.keregeLabel} title={labels.keregeTitle} />
        <div className="kerege" style={{ "--cols-d": desktopK * 2, "--cols-m": 4 } as CSSProperties}>
          <div className="kerege-grid">
            {photos.map((photo, index) => {
              const desktop = latticeCell(index, desktopK);
              const mobile = latticeCell(index, 2);
              const caption = text(locale, photo.captionKy, photo.captionRu);
              return (
                <button
                  type="button"
                  className="kerege-cell"
                  key={photo.id}
                  style={{ "--dc": desktop.col, "--dr": desktop.row, "--mc": mobile.col, "--mr": mobile.row } as CSSProperties}
                  onClick={() => setLightbox(index)}
                  aria-label={caption}
                >
                  <span className="kerege-photo">
                    <Image src={photo.imageUrl} alt="" width={800} height={800} unoptimized />
                    <span className="kerege-caption">{caption}</span>
                  </span>
                </button>
              );
            })}
            <KeregeFillers count={photos.length} desktopK={desktopK} usedPhotos={photos.map((photo) => photo.imageUrl)} />
          </div>
        </div>
      </div>
    </section>}

    {/* Regions: representatives on the map of Kyrgyzstan */}
    {regional.length > 0 && <section className="home-row fed-map">
      <div className="section-wrap">
        <SectionHeading label={labels.mapLabel} title={labels.mapTitle}><p className="fed-heading-text">{labels.mapHint}</p></SectionHeading>
        <div className="fed-map-layout">
          <div className="fed-map-art">
            <svg viewBox={`0 0 ${kgMapSize.width} ${kgMapSize.height}`} role="img" aria-label={labels.mapTitle}>
              {kgRegions.filter((region) => region.path).map((region) => (
                <path
                  key={region.id}
                  d={region.path}
                  className={`fed-region${regionIds.includes(region.id) ? " has-members" : ""}${region.id === activeRegion ? " is-active" : ""}`}
                  onClick={() => setActiveRegion(region.id)}
                >
                  <title>{text(locale, region.nameKy, region.nameRu)}</title>
                </path>
              ))}
              {kgRegions.map((region) => {
                const count = regional.filter((member) => member.region === region.id).length;
                const isCity = !region.path;
                if (!count && !isCity) return null;
                return (
                  <g key={region.id} className={`fed-pin${isCity ? " is-city" : ""}${region.id === activeRegion ? " is-active" : ""}`} transform={`translate(${region.x} ${region.y})`} onClick={() => setActiveRegion(region.id)}>
                    <title>{text(locale, region.nameKy, region.nameRu)}</title>
                    <circle r={isCity ? 11 : 19} />
                    {count > 0 && <text dy="6">{count}</text>}
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="fed-map-panel">
            <div className="fed-region-chips" role="tablist" aria-label={labels.mapTitle}>
              {kgRegions.map((region) => (
                <button
                  key={region.id}
                  type="button"
                  role="tab"
                  aria-selected={region.id === activeRegion}
                  className={`${region.id === activeRegion ? "is-active" : ""}${regionIds.includes(region.id) ? " has-members" : ""}`.trim() || undefined}
                  onClick={() => setActiveRegion(region.id)}
                >
                  {text(locale, region.nameKy, region.nameRu)}
                </button>
              ))}
            </div>
            <h3>{regionName(locale, activeRegion)}</h3>
            {regionMembers.length ? <ul className="fed-region-members">
              {regionMembers.map((member) => (
                <li key={member.id}>
                  <MemberAvatar member={member} size={56} />
                  <span>
                    <strong>{member.name}</strong>
                    <small>{text(locale, member.roleKy, member.roleRu)}</small>
                    {member.phone && <a href={`tel:${member.phone}`}><Phone size={13} />{member.phone}</a>}
                  </span>
                </li>
              ))}
            </ul> : <p className="empty-note">{labels.mapEmpty}</p>}
          </div>
        </div>
      </div>
    </section>}

    {/* Жол: the federation's history as a race track, a horse riding along it on scroll */}
    {milestones.length > 0 && <section className="home-row fed-jol">
      <div className="section-wrap">
        <SectionHeading label={labels.jolLabel} title={labels.jolTitle} />
        <div className="jol">
          <div className="jol-inner" style={{ "--count": milestones.length } as CSSProperties}>
          <div className="jol-track" aria-hidden="true"><span className="jol-horse" /></div>
          <ol className="jol-posts">
            {milestones.map((milestone) => (
              <li key={milestone.id}>
                <span className="jol-year">{milestone.year}</span>
                <strong>{text(locale, milestone.titleKy, milestone.titleRu)}</strong>
                {text(locale, milestone.textKy, milestone.textRu) && <p>{text(locale, milestone.textKy, milestone.textRu)}</p>}
              </li>
            ))}
          </ol>
          </div>
        </div>
      </div>
    </section>}

    {openPhoto && lightbox !== null && <div className="fed-lightbox" role="dialog" aria-modal="true" aria-label={text(locale, openPhoto.captionKy, openPhoto.captionRu)} onClick={() => setLightbox(null)}>
      <figure onClick={(event) => event.stopPropagation()}>
        <Image src={openPhoto.imageUrl} alt={text(locale, openPhoto.captionKy, openPhoto.captionRu)} width={1800} height={1200} unoptimized />
        <figcaption>{text(locale, openPhoto.captionKy, openPhoto.captionRu)}<span>{lightbox + 1} / {photos.length}</span></figcaption>
      </figure>
      <button type="button" className="fed-lightbox-close" onClick={() => setLightbox(null)} aria-label={labels.close} autoFocus><X size={24} /></button>
      {photos.length > 1 && <>
        <button type="button" className="fed-lightbox-arrow is-prev" onClick={(event) => { event.stopPropagation(); setLightbox((lightbox - 1 + photos.length) % photos.length); }} aria-label={labels.prevPhoto}><ChevronLeft size={30} /></button>
        <button type="button" className="fed-lightbox-arrow is-next" onClick={(event) => { event.stopPropagation(); setLightbox((lightbox + 1) % photos.length); }} aria-label={labels.nextPhoto}><ChevronRight size={30} /></button>
      </>}
    </div>}
  </>;
}

