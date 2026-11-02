"use client";

import { useState, type CSSProperties } from "react";
import { ChevronDown } from "lucide-react";
import type { RuleSection, SiteSettings } from "@prisma/client";
import type { Locale } from "@/lib/i18n";
import { copy, text } from "@/lib/i18n";

// The rules page as an "ала кийиз" (felt carpet): an interactive drawing of the field explains where
// each part of play happens, and every rule is a felt panel with its own traditional symbol.

type Zone = "center" | "kazan" | "team" | "boundary";

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

export default function RulesPage({ locale, settings, rules }: RulesPageProps) {
  const labels = copy[locale];
  const [zone, setZone] = useState<Zone>("center");
  const zones: [Zone, string, string][] = [
    ["center", labels.zoneCenter, labels.zoneCenterText],
    ["kazan", labels.zoneKazan, labels.zoneKazanText],
    ["team", labels.zoneTeam, labels.zoneTeamText],
    ["boundary", labels.zoneBoundary, labels.zoneBoundaryText],
  ];
  const active = zones.find(([id]) => id === zone) ?? zones[0];
  const zoneProps = (id: Zone) => ({
    className: `field-zone${zone === id ? " is-active" : ""}`,
    onClick: () => setZone(id),
  });

  return (
    <section className="rules-page section-wrap" id="rules">
      <div className="section-heading">
        <div><p className="eyebrow">{labels.rulesLabel}</p><h2>{text(locale, settings.rulesTitleKy, settings.rulesTitleRu)}</h2></div>
      </div>

      {/* Талаа: the field from above; each zone explains the play that happens there */}
      <div className="field-layout">
        <div className="field-art">
          <svg viewBox="0 0 1000 540" role="img" aria-label={labels.fieldTitle}>
            <rect className="field-ground" x="20" y="20" width="960" height="500" rx="250" />
            <path {...zoneProps("team")} d="M270 20H500V520H270A250 250 0 0 1 270 20Z" />
            <path {...zoneProps("team")} d="M500 20H730A250 250 0 0 1 730 520H500Z" />
            <rect {...zoneProps("boundary")} x="20" y="20" width="960" height="500" rx="250" fill="none" strokeWidth="14" />
            <line className="field-line" x1="500" y1="40" x2="500" y2="500" />
            <circle {...zoneProps("center")} cx="500" cy="270" r="74" />
            <circle className="field-mark" cx="500" cy="270" r="14" />
            {[150, 850].map((x) => (
              <g key={x} {...zoneProps("kazan")}>
                <circle cx={x} cy="270" r="62" />
                <circle className="field-kazan-ring" cx={x} cy="270" r="40" />
              </g>
            ))}
            <text className="field-label" x="500" y="380">{labels.zoneCenter}</text>
            <text className="field-label" x="150" y="370">{labels.zoneKazan}</text>
            <text className="field-label" x="850" y="370">{labels.zoneKazan}</text>
          </svg>
        </div>
        <div className="field-info" aria-live="polite">
          <p className="eyebrow">{labels.fieldTitle}</p>
          <h3>{active[1]}</h3>
          <p>{active[2]}</p>
          <div className="field-chips" role="tablist" aria-label={labels.fieldTitle}>
            {zones.map(([id, label]) => (
              <button key={id} type="button" role="tab" aria-selected={zone === id} className={zone === id ? "is-active" : undefined} onClick={() => setZone(id)}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Ала кийиз: one felt panel per rule, each with its own symbol */}
      <div className="felt-grid">
        {rules.map((rule, index) => {
          const key = symbols[rule.symbol] ? rule.symbol : symbolOrder[index % symbolOrder.length];
          return (
            <details className="felt-panel" key={rule.id} open={index === 0}>
              <summary>
                <span className="felt-symbol" style={{ "--symbol": `url("${symbols[key]}")` } as CSSProperties} aria-hidden="true" />
                <span className="felt-index">{String(index + 1).padStart(2, "0")}</span>
                <strong>{text(locale, rule.titleKy, rule.titleRu)}</strong>
                <ChevronDown size={19} aria-hidden="true" />
              </summary>
              <p>{text(locale, rule.bodyKy, rule.bodyRu)}</p>
            </details>
          );
        })}
        {!rules.length && <p className="empty-note">{locale === "ky" ? "Эрежелер жаңыртылууда." : "Правила обновляются."}</p>}
      </div>
    </section>
  );
}
