"use client";

import Image from "next/image";
import { BadgeCheck, CalendarDays, Gem, MapPin, Ribbon, Shapes, Store, Wrench, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { HorseCategory, HorseListing } from "@prisma/client";
import { type FilterField } from "@/components/filter-bar";
import { ContactLink, federationOptions } from "@/components/horse-page";
import MarketCard from "@/components/market-card";
import { youtubeId } from "@/components/media-page";
import { SearchPanel, useHashKind } from "@/components/search-panel";
import { demoEquipment, type Equipment, type EquipmentType } from "@/lib/demo-equipment";
import { copy, text, type Locale } from "@/lib/i18n";
import { shuffled } from "@/lib/shuffle";

// The bazaar's catalogue: horses and riders' equipment, looked through with the same search panel as the media
// page (a switch between the two kinds, a keyword search, and a filter: breed or type, region, price). Horses are
// the federation's listings, each with its own page; equipment shows demo items for now, opening in a viewer
// with the details and the federation's contacts.

type Horse = HorseListing & { category: HorseCategory };
type Contacts = { phone: string; email: string; social: string };
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

export default function BazaarCatalog({ horses, categories, locale, orderSeed, contacts, price }: {
  horses: Horse[];
  categories: HorseCategory[];
  locale: Locale;
  // This visit's order for both lists (lib/shuffle.ts)
  orderSeed: number;
  contacts: Contacts;
  price: (value: number | null) => string;
}) {
  const labels = copy[locale];
  const { kind, choose } = useHashKind<BazaarKind>(bazaarKinds);
  const [query, setQuery] = useState("");
  const [horseFilters, setHorseFilters] = useState(noHorseFilters);
  const [equipmentFilters, setEquipmentFilters] = useState(noEquipmentFilters);
  const [viewing, setViewing] = useState<Equipment | null>(null);
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
  const typeNames: Record<EquipmentType, string> = { saddle: labels.eqSaddle, tack: labels.eqTack, rider: labels.eqRider };
  const conditionName = (item: Equipment) => item.condition === "new" ? labels.condNew : labels.condUsed;
  const itemRegion = (item: Equipment) => text(locale, item.regionKy, item.regionRu);
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

  useEffect(() => {
    if (!viewing) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setViewing(null); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [viewing]);

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
          {shownHorses.map((horse) => {
            const video = youtubeId(horse.videoUrl);
            return <MarketCard key={horse.id} href={`/${locale}/horses/${horse.id}`} title={text(locale, horse.nameKy, horse.nameRu)} tag={text(locale, horse.category.nameKy, horse.category.nameRu)}
              image={horse.imageUrl || horse.photoUrls[0] || (video ? `https://i.ytimg.com/vi/${video}/hqdefault.jpg` : "")} videoLabel={video ? labels.mediaTabVideos : undefined}
              facts={[{ icon: CalendarDays, text: text(locale, horse.ageKy, horse.ageRu) }, { icon: MapPin, text: horseRegion(horse) }]}
              price={price(horse.price)} moreLabel={labels.moreDetails} />;
          })}
        </div>
        {!shownHorses.length && <p className="empty-note horse-empty">{labels.noHorses}</p>}
      </div>}

      {/* Equipment: the same cards, opening the item in a viewer */}
      {kind === "equipment" && <div role="tabpanel" id="kind-panel-equipment" aria-label={labels.kindEquipment}>
        <div className="market-grid is-long">
          {shownEquipment.map((item) => <MarketCard key={item.id} onOpen={() => setViewing(item)} title={text(locale, item.nameKy, item.nameRu)} tag={typeNames[item.type]} image={item.image}
            facts={[{ icon: BadgeCheck, text: conditionName(item) }, { icon: MapPin, text: itemRegion(item) }]}
            price={price(item.price)} moreLabel={labels.moreDetails} />)}
        </div>
        {!shownEquipment.length && <p className="empty-note horse-empty">{labels.noEquipment}</p>}
      </div>}

      {/* An equipment item, opened: its photo, details and the federation's contacts (sellers' own come later) */}
      {viewing && <div className="sandyk" role="dialog" aria-modal="true" aria-label={text(locale, viewing.nameKy, viewing.nameRu)} onClick={() => setViewing(null)}>
        <figure className="sandyk-lid equipment-view" key={viewing.id} onClick={(event) => event.stopPropagation()}>
          <Image src={viewing.image} alt={text(locale, viewing.nameKy, viewing.nameRu)} width={1000} height={750} unoptimized />
          <figcaption className="equipment-view-info">
            <span className="equipment-view-title"><b>{text(locale, viewing.nameKy, viewing.nameRu)}</b>{price(viewing.price)}</span>
            <small className="horse-video-facts">
              <span><Shapes size={13} />{typeNames[viewing.type]}</span>
              <span><BadgeCheck size={13} />{conditionName(viewing)}</span>
              <span><MapPin size={13} />{itemRegion(viewing)}</span>
            </small>
            <p>{text(locale, viewing.descriptionKy, viewing.descriptionRu)}</p>
            <p className="equipment-view-note">{labels.equipmentContactNote}</p>
            <span className="horse-contact-more">{federationOptions(contacts, labels.sellerCall).map((option) => <ContactLink option={option} key={option.key} />)}</span>
          </figcaption>
        </figure>
        <button type="button" className="sandyk-close" onClick={() => setViewing(null)} aria-label={labels.close} autoFocus><X size={24} /></button>
      </div>}
    </>
  );
}
