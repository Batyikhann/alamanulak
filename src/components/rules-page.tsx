"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import { ArrowDown, ArrowRight, RotateCcw } from "lucide-react";
import type { RuleSection, SiteSettings } from "@prisma/client";
import type { Locale } from "@/lib/i18n";
import { copy, text } from "@/lib/i18n";

// The rules page: a photo header (two riders on the jailoo in the evening light), then the rules as "ала кийиз"
// (felt) cards: each shows its traditional symbol, number and title, and turns over (a tap, click or Enter) to
// show the rule itself on its back. Rules have no pages of their own: everything is on the card.

const headerImage = "/images/rules-riders.jpg";

// Symbol key (RuleSection.symbol) → ornament file in /public/ornaments.
const symbols: Record<string, string> = {
  horn: "/ornaments/kochkor.svg",
  rosette: "/ornaments/tort-muyuz.svg",
  tunduk: "/ornaments/tunduk.svg",
  horse: "/ornaments/horse-head.svg",
  shyrdak: "/ornaments/oymo-shyrdak.svg",
  emblem: "/ornaments/emblem.svg",
};
const symbolOrder = Object.keys(symbols);

type RulesPageProps = { locale: Locale; settings: SiteSettings; rules: RuleSection[] };
type Labels = (typeof copy)[Locale];

function RuleCard({ rule, index, locale, labels }: { rule: RuleSection; index: number; locale: Locale; labels: Labels }) {
  const [flipped, setFlipped] = useState(false);
  const key = symbols[rule.symbol] ? rule.symbol : symbolOrder[index % symbolOrder.length];
  const number = String(index + 1).padStart(2, "0");
  const title = text(locale, rule.titleKy, rule.titleRu);
  return (
    <button type="button" className={`rule-card${flipped ? " is-flipped" : ""}`} onClick={() => setFlipped(!flipped)} aria-pressed={flipped}
      aria-label={`${number}. ${title}: ${flipped ? labels.cardFront : labels.ruleOpen}`}>
      <span className="rule-card-inner">
        <span className="rule-face rule-face-front" aria-hidden={flipped}>
          <span className="felt-symbol" style={{ "--symbol": `url("${symbols[key]}")` } as CSSProperties} aria-hidden="true" />
          <span className="felt-index">{number}</span>
          <strong>{title}</strong>
          <span className="rule-card-hint"><RotateCcw size={14} aria-hidden="true" />{labels.ruleOpen}</span>
        </span>
        <span className="rule-face rule-face-back" aria-hidden={!flipped}>
          <span className="rule-back-head"><span className="felt-index">{number}</span><strong>{title}</strong></span>
          <span className="rule-back-text">{text(locale, rule.bodyKy, rule.bodyRu)}</span>
          <span className="rule-card-hint"><RotateCcw size={14} aria-hidden="true" />{labels.cardFront}</span>
        </span>
      </span>
    </button>
  );
}

export default function RulesPage({ locale, settings, rules }: RulesPageProps) {
  const labels = copy[locale];
  return <>
    {/* Photo header, built like the horse market's and the federation's: still photo, ornament strip, dark fades */}
    <div className="hero-shell">
      <div className="hero-rail" aria-hidden="true"><span className="hero-rail-pattern" /></div>
      <section className="market-hero page-hero rules-hero">
        <Image className="market-hero-image" src={headerImage} alt="" width={2400} height={1350} priority unoptimized />
        <div className="photo-caption">
          <h1 className="photo-caption-title">{text(locale, settings.rulesTitleKy, settings.rulesTitleRu)}</h1>
          <p className="photo-caption-text">{labels.rulesCaption}</p>
          <div className="hero-actions">
            <button type="button" className="button button-accent" onClick={() => document.getElementById("rules")?.scrollIntoView({ behavior: "smooth" })}>{labels.rulesRead}<ArrowDown size={17} /></button>
            <a className="hero-round-link" href={`/${locale}/calendar`}><span><ArrowRight size={16} /></span>{labels.heroAction}</a>
          </div>
        </div>
      </section>
    </div>

    <section className="rules-page section-wrap" id="rules">

      {/* Ала кийиз: one felt card per rule, each with its own symbol; the rule is on its back */}
      <div className="rule-grid">
        {rules.map((rule, index) => <RuleCard key={rule.id} rule={rule} index={index} locale={locale} labels={labels} />)}
        {!rules.length && <p className="empty-note">{locale === "ky" ? "Эрежелер жаңыртылууда." : "Правила обновляются."}</p>}
      </div>
    </section>
  </>;
}
