"use client";

import { Fragment, useSyncExternalStore } from "react";
import type { LucideIcon } from "lucide-react";
import { FilterBar, type FilterField } from "@/components/filter-bar";

// The search panel of the media page and the bazaar: two kinds of things to look through (videos / photos,
// horses / equipment), a keyword search and a filter.
// Wide screens: one row — a button that switches to the other kind (naming only that one), the search, the filter.
// Phones: a full-width search with a line above it: the two kinds as text links with a slanted line between them at
// the left edge, the filter at the right.
// The chosen kind lives in the address hash (#videos, #equipment…), so a link can open either one.

export type PanelKind<Kind extends string> = { key: Kind; label: string; icon: LucideIcon };

const subscribeHash = (onChange: () => void) => {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
};

// The kind in the address hash: the first kind until one is chosen. Choosing replaces the hash without a new
// history entry.
export function useHashKind<Kind extends string>(kinds: readonly Kind[]) {
  const hash = useSyncExternalStore(subscribeHash, () => location.hash, () => "");
  const fromHash = kinds.find((kind) => hash === `#${kind}`);
  const choose = (kind: Kind) => {
    history.replaceState(null, "", `#${kind}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  };
  return { kind: fromHash ?? kinds[0], choose };
}

export function SearchPanel<Kind extends string, Key extends string>({ kinds, kind, onChoose, switchLabel, query, onQuery, fields, filters, onFilters, showLabel, labels }: {
  kinds: [PanelKind<Kind>, PanelKind<Kind>];
  kind: Kind;
  onChoose: (kind: Kind) => void;
  switchLabel: string;
  query: string;
  onQuery: (value: string) => void;
  fields: FilterField<Key>[];
  filters: Record<Key, string[]>;
  onFilters: (value: Record<Key, string[]>) => void;
  showLabel: string;
  labels: { search: string; placeholder: string; filterButton: string; filterTitle: string; filterReset: string; close: string };
}) {
  const other = kinds.find((item) => item.key !== kind) ?? kinds[1];
  return (
    <div className="kind-panel">
      {/* Wide screens: one button that switches to the other kind, naming only that one */}
      <button type="button" className="kind-toggle" onClick={() => onChoose(other.key)} aria-label={`${switchLabel}: ${other.label}`}>
        <other.icon size={17} aria-hidden="true" />{other.label}
      </button>
      <FilterBar query={query} onQuery={onQuery} fields={fields} filters={filters} onFilters={onFilters} showLabel={showLabel} labels={labels}
        before={<div className="kind-links" role="tablist" aria-label={switchLabel}>
          {/* Phones: both kinds as text links, the chosen one in gold */}
          {kinds.map(({ key, label }, index) => <Fragment key={key}>
            {index > 0 && <span className="kind-slash" aria-hidden="true" />}
            <button type="button" role="tab" id={`kind-tab-${key}`} aria-selected={kind === key} aria-controls={`kind-panel-${key}`}
              className={kind === key ? "is-active" : undefined} onClick={() => onChoose(key)}>{label}</button>
          </Fragment>)}
        </div>} />
    </div>
  );
}
