"use client";

import { BadgeCheck, Gem, MapPin, Ribbon, Shapes, Store, Wrench } from "lucide-react";
import { useState } from "react";
import type { HorseCategory, HorseListing } from "@prisma/client";
import { type FilterField } from "@/components/filter-bar";
import { EquipmentCard, equipmentWords } from "@/components/equipment-page";
import { HorseCard } from "@/components/horse-page";
import { SearchPanel, useHashKind } from "@/components/search-panel";
import { demoEquipment, type EquipmentType } from "@/lib/demo-equipment";
import { copy, text, type Locale } from "@/lib/i18n";
import { shuffled } from "@/lib/shuffle";

// The bazaar's catalogue: horses and riders' equipment, looked through with the same search panel as the media
// page (a switch between the two kinds, a keyword search, and a filter: breed or type, region, price). Horses are
// the federation's listings and equipment shows demo items for now, each with its own page.

type Horse = HorseListing & { category: HorseCategory };
type BazaarKind = "horses" | "equipment";
const bazaarKinds = ["horses", "equipment"] as const;
type Band = "low" | "mid" | "high";
type HorseKey = "breed" | "region" | "price";
type EquipmentKey = "type" | "condition" | "region" | "price";
const noHorseFilters: Record<HorseKey, string[]> = { breed: [], region: [], price: [] };
const noEquipmentFilters: Record<EquipmentKey, string[]> = { type: [], condition: [], region: [], price: [] };
// Price bands in som: a horse costs far more than its gear.
const horseBands: Record<Band, [number, number]> = { low: [0, 800000], mid: [800000, 1500000], high: [1500000, Number.POSITIVE_INFINITY] };
const equipmentBands: Record<Band, [number, number]> = { low: [0, 5000], mid: [5000, 20000], high: [20000, Number.POSITIVE_INFINITY] };
const inBands = (price: number | null, chosen: string[], bands: Record<Band, [number, number]>) =>
  !chosen.length || (price !== null && chosen.some((band) => price >= bands[band as Band][0] && price < bands[band as Band][1]));

export default function BazaarCatalog({ horses, categories, locale, orderSeed, price }: {
  horses: Horse[];
  categories: HorseCategory[];
  locale: Locale;
  // This visit's order for both lists (lib/shuffle.ts)
  orderSeed: number;
  price: (value: number | null) => string;
}) {
  const labels = copy[locale];
  const { kind, choose } = useHashKind<BazaarKind>(bazaarKinds);
  const [query, setQuery] = useState("");
  const [horseFilters, setHorseFilters] = useState(noHorseFilters);
  const [equipmentFilters, setEquipmentFilters] = useState(noEquipmentFilters);
  const needle = query.trim().toLocaleLowerCase(locale);
  const has = (...words: string[]) => !needle || words.some((word) => word.toLocaleLowerCase(locale).includes(needle));

  // Horses: by name, breed, region or description; filtered by breed, region and price
  const horseRegion = (horse: Horse) => text(locale, horse.locationKy, horse.locationRu);
  const horseFields: FilterField<HorseKey>[] = [
    { key: "breed", label: labels.breed, icon: Ribbon, options: categories.map((category) => [category.id, text(locale, category.nameKy, category.nameRu)]) },
    { key: "region", label: labels.region, icon: MapPin, options: [...new Set(horses.map(horseRegion))].sort().map((region) => [region, region]) },
    { key: "price", label: labels.priceLabel, icon: Gem, options: [["low", labels.priceLow], ["mid", labels.priceMid], ["high", labels.priceHigh]] },
  ];
  const shownHorses = shuffled(horses, orderSeed).filter((horse) => has(text(locale, horse.nameKy, horse.nameRu), text(locale, horse.category.nameKy, horse.category.nameRu), horseRegion(horse), text(locale, horse.descriptionKy, horse.descriptionRu))
    && (!horseFilters.breed.length || horseFilters.breed.includes(horse.categoryId))
    && (!horseFilters.region.length || horseFilters.region.includes(horseRegion(horse)))
    && inBands(horse.price, horseFilters.price, horseBands));

  // Equipment: by name, type or description; filtered by type, condition, region and price
  const { typeNames, itemRegion } = equipmentWords(locale);
  const equipmentFields: FilterField<EquipmentKey>[] = [
    { key: "type", label: labels.equipmentType, icon: Shapes, options: (Object.keys(typeNames) as EquipmentType[]).map((type) => [type, typeNames[type]]) },
    { key: "condition", label: labels.condition, icon: BadgeCheck, options: [["new", labels.condNew], ["used", labels.condUsed]] },
    { key: "region", label: labels.region, icon: MapPin, options: [...new Set(demoEquipment.map(itemRegion))].sort().map((region) => [region, region]) },
    { key: "price", label: labels.priceLabel, icon: Gem, options: [["low", labels.eqPriceLow], ["mid", labels.eqPriceMid], ["high", labels.eqPriceHigh]] },
  ];
  const shownEquipment = shuffled(demoEquipment, orderSeed).filter((item) => has(text(locale, item.nameKy, item.nameRu), typeNames[item.type], text(locale, item.descriptionKy, item.descriptionRu))
    && (!equipmentFilters.type.length || equipmentFilters.type.includes(item.type))
    && (!equipmentFilters.condition.length || equipmentFilters.condition.includes(item.condition))
    && (!equipmentFilters.region.length || equipmentFilters.region.includes(itemRegion(item)))
    && inBands(item.price, equipmentFilters.price, equipmentBands));

  const results = kind === "horses" ? shownHorses.length : shownEquipment.length;
  const panelLabels = { search: labels.searchLabel, placeholder: labels.bazaarSearchPlaceholder, filterButton: labels.filterButton, filterTitle: labels.filterTitle, filterReset: labels.filterReset, close: labels.close };
  const panel = {
    kinds: [{ key: "horses", label: labels.kindHorses, icon: Store }, { key: "equipment", label: labels.kindEquipment, icon: Wrench }] as [{ key: BazaarKind; label: string; icon: typeof Store }, { key: BazaarKind; label: string; icon: typeof Store }],
    kind, onChoose: choose, switchLabel: labels.bazaarSwitch, query, onQuery: setQuery,
    showLabel: labels.bazaarShow.replace("{n}", String(results)), labels: panelLabels,
  };

  return (
    <>
      <div id="quick-find">
        {kind === "horses"
          ? <SearchPanel {...panel} fields={horseFields} filters={horseFilters} onFilters={setHorseFilters} />
          : <SearchPanel {...panel} fields={equipmentFields} filters={equipmentFilters} onFilters={setEquipmentFilters} />}
      </div>

      {/* Horses: cards opening each horse's own page, where its video and photos are */}
      {kind === "horses" && <div role="tabpanel" id="kind-panel-horses" aria-label={labels.kindHorses}>
        <div className="market-grid">
          {shownHorses.map((horse) => <HorseCard key={horse.id} horse={horse} locale={locale} price={price} />)}
        </div>
        {!shownHorses.length && <p className="empty-note horse-empty">{labels.noHorses}</p>}
      </div>}

      {/* Equipment: the same cards, opening each item's own page */}
      {kind === "equipment" && <div role="tabpanel" id="kind-panel-equipment" aria-label={labels.kindEquipment}>
        <div className="market-grid is-long">
          {shownEquipment.map((item) => <EquipmentCard key={item.id} item={item} locale={locale} price={price} />)}
        </div>
        {!shownEquipment.length && <p className="empty-note horse-empty">{labels.noEquipment}</p>}
      </div>}
    </>
  );
}
