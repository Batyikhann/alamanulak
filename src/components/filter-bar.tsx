"use client";

import { Check, Search, SlidersHorizontal, X, type LucideIcon } from "lucide-react";
import { useEffect, useId, useState, type ReactNode } from "react";

// A search bar with a "Filter" button beside it (the players and media pages). A search runs when its button (the
// search mark at the bar's right end) or Enter is pressed; emptying the bar shows everything again at once. The button opens a pop-up form
// with the other filters: tick chips for each field (several values at once, none meaning any). The list updates as you choose; the form's main button closes it, showing
// how many results match. The button's badge counts the filters in use; below the bar, each one in use is a chip
// that removes it. `before` puts a control ahead of the bar (phones' switch on the media page and the bazaar).

// Each option: [value, label]
export type FilterField<Key extends string> = { key: Key; label: string; icon: LucideIcon; options: [string, string][] };

export function FilterBar<Key extends string>({ query, onQuery, fields, filters, onFilters, showLabel, labels, before }: {
  query: string;
  onQuery: (value: string) => void;
  fields: FilterField<Key>[];
  filters: Record<Key, string[]>;
  onFilters: (value: Record<Key, string[]>) => void;
  showLabel: string;
  labels: { search: string; placeholder: string; filterButton: string; filterTitle: string; filterReset: string; close: string };
  before?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(query);
  // When the page changes the search itself (clearing it), the bar shows that.
  const [seenQuery, setSeenQuery] = useState(query);
  if (seenQuery !== query) {
    setSeenQuery(query);
    setDraft(query);
  }
  const titleId = useId();
  const inUse = fields.reduce((total, field) => total + filters[field.key].length, 0);
  const optionLabel = (field: FilterField<Key>, value: string) => field.options.find(([key]) => key === value)?.[1] ?? value;
  const toggle = (key: Key, option: string) => {
    const list = filters[key];
    onFilters({ ...filters, [key]: list.includes(option) ? list.filter((item) => item !== option) : [...list, option] });
  };
  const reset = () => onFilters(Object.fromEntries(fields.map((field) => [field.key, []])) as unknown as Record<Key, string[]>);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="filter-bar">
      <div className="filter-toolbar">
        {before}
        <form className="filter-search" role="search" onSubmit={(event) => { event.preventDefault(); onQuery(draft.trim()); }}>
          <label className="filter-search-field">
            <span className="sr-only">{labels.search}</span>
            <input type="search" value={draft} placeholder={labels.placeholder}
              onChange={(event) => { setDraft(event.target.value); if (!event.target.value.trim()) onQuery(""); }} />
          </label>
          <button type="submit" className="search-go" aria-label={labels.search}><Search size={17} aria-hidden="true" /></button>
        </form>
        <button type="button" className={`filter-button${inUse ? " has-value" : ""}`} aria-haspopup="dialog" aria-expanded={open}
          aria-label={inUse ? `${labels.filterButton} (${inUse})` : labels.filterButton} onClick={() => setOpen(true)}>
          <SlidersHorizontal size={18} aria-hidden="true" />
          <span className="filter-button-label">{labels.filterButton}</span>
          {inUse > 0 && <span className="filter-badge">{inUse}</span>}
        </button>
      </div>

      {/* The filters in use, each a chip that removes it */}
      {inUse > 0 && <div className="filter-chips">
        {fields.flatMap((field) => filters[field.key].map((value) => (
          <button type="button" key={`${field.key}-${value}`} onClick={() => toggle(field.key, value)} aria-label={`${field.label}: ${optionLabel(field, value)} ×`}>
            {optionLabel(field, value)}<X size={14} aria-hidden="true" />
          </button>
        )))}
        <button type="button" className="filter-chips-reset" onClick={reset}>{labels.filterReset}</button>
      </div>}

      {open && <div className="filter-sheet-backdrop" onClick={() => setOpen(false)}>
        <div className="filter-sheet" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(event) => event.stopPropagation()}>
          <div className="filter-sheet-head">
            <h3 id={titleId}>{labels.filterTitle}</h3>
            <button type="button" className="filter-sheet-close" onClick={() => setOpen(false)} aria-label={labels.close} autoFocus><X size={20} /></button>
          </div>
          <div className="filter-sheet-body">
            {fields.filter((field) => field.options.length > 0).map(({ key, label, icon: Icon, options }) => (
              <fieldset className="filter-group" key={key}>
                <legend><Icon size={15} aria-hidden="true" />{label}</legend>
                <div className="filter-options">
                  {options.map(([value, text]) => {
                    const on = filters[key].includes(value);
                    return (
                      <button type="button" key={value} aria-pressed={on} className={on ? "is-active" : undefined} onClick={() => toggle(key, value)}>
                        {on && <Check size={14} aria-hidden="true" />}{text}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>
          <div className="filter-sheet-foot">
            <button type="button" className="filter-sheet-reset" onClick={reset} disabled={!inUse}>{labels.filterReset}</button>
            <button type="button" className="button button-accent" onClick={() => setOpen(false)}>{showLabel}</button>
          </div>
        </div>
      </div>}
    </div>
  );
}
