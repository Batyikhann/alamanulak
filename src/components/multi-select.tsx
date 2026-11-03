"use client";

import { Check, ChevronDown, type LucideIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

// A filter field that opens a list of tick boxes, so several values can be chosen at once. Nothing ticked
// means "any". The field itself sums up the choice: "Баары", the one chosen value, or the first plus a count.
// Closes on a click outside or Escape.
export function MultiSelect({ label, icon: Icon, options, value, onChange, anyLabel }: {
  label: string;
  icon: LucideIcon;
  options: [string, string][];
  value: string[];
  onChange: (value: string[]) => void;
  anyLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const close = (event: Event) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const chosen = options.filter(([key]) => value.includes(key));
  const summary = !chosen.length ? anyLabel : chosen.length === 1 ? chosen[0][1] : `${chosen[0][1]} +${chosen.length - 1}`;
  const toggle = (key: string) => onChange(value.includes(key) ? value.filter((item) => item !== key) : [...value, key]);

  return (
    <div className={`quick-field multi-select${open ? " is-open" : ""}`} ref={rootRef}>
      <span className="quick-field-label"><Icon size={14} />{label}</span>
      <button type="button" className={`multi-select-trigger${chosen.length ? " has-value" : ""}`} aria-haspopup="listbox" aria-expanded={open} aria-controls={listId}
        aria-label={`${label}: ${summary}`} onClick={() => setOpen(!open)}>
        <span>{summary}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      {open && <div className="multi-select-panel" id={listId} role="listbox" aria-multiselectable="true" aria-label={label}>
        <button type="button" role="option" aria-selected={!chosen.length} className={!chosen.length ? "is-checked" : undefined} onClick={() => onChange([])}>
          <span className="multi-select-box"><Check size={13} /></span>{anyLabel}
        </button>
        {options.map(([key, optionLabel]) => (
          <button type="button" role="option" key={key} aria-selected={value.includes(key)} className={value.includes(key) ? "is-checked" : undefined} onClick={() => toggle(key)}>
            <span className="multi-select-box"><Check size={13} /></span>{optionLabel}
          </button>
        ))}
      </div>}
    </div>
  );
}
