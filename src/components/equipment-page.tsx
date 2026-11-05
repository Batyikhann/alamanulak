"use client";

import { BadgeCheck, MapPin, Shapes } from "lucide-react";
import { ContactLink, federationOptions, MarketPage, type Contacts } from "@/components/horse-page";
import MarketCard from "@/components/market-card";
import type { Equipment, EquipmentType } from "@/lib/demo-equipment";
import { copy, text, type Locale } from "@/lib/i18n";

// One piece of equipment from the bazaar on its own page, laid out like a horse's: its photo, the details, the
// federation's contacts (sellers' own come later) and one row of other equipment.

// An item's type, condition and region in the page's language
export function equipmentWords(locale: Locale) {
  const labels = copy[locale];
  const typeNames: Record<EquipmentType, string> = { saddle: labels.eqSaddle, tack: labels.eqTack, rider: labels.eqRider };
  const conditionName = (item: Equipment) => item.condition === "new" ? labels.condNew : labels.condUsed;
  const itemRegion = (item: Equipment) => text(locale, item.regionKy, item.regionRu);
  return { typeNames, conditionName, itemRegion };
}

// An item's card, in the bazaar and in the row under an item's page.
export function EquipmentCard({ item, locale, price }: { item: Equipment; locale: Locale; price: (value: number | null) => string }) {
  const { typeNames, conditionName, itemRegion } = equipmentWords(locale);
  return <MarketCard href={`/${locale}/horses/${item.id}`} title={text(locale, item.nameKy, item.nameRu)} tag={typeNames[item.type]} image={item.image}
    facts={[{ icon: BadgeCheck, text: conditionName(item) }, { icon: MapPin, text: itemRegion(item) }]}
    price={price(item.price)} moreLabel={copy[locale].moreDetails} />;
}

export default function EquipmentPage({ item, recommended, locale, contacts, price }: { item: Equipment; recommended: Equipment[]; locale: Locale; contacts: Contacts; price: (value: number | null) => string }) {
  const labels = copy[locale];
  const { typeNames, conditionName, itemRegion } = equipmentWords(locale);
  return <MarketPage locale={locale} backHref={`/${locale}/horses#equipment`} name={text(locale, item.nameKy, item.nameRu)} price={price(item.price)}
    views={[{ kind: "photo", src: item.image }]} aboutTitle={labels.equipmentAbout} about={text(locale, item.descriptionKy, item.descriptionRu)}
    facts={[
      [<Shapes size={16} key="type" />, labels.equipmentType, typeNames[item.type]],
      [<BadgeCheck size={16} key="condition" />, labels.condition, conditionName(item)],
      [<MapPin size={16} key="region" />, labels.region, itemRegion(item)],
    ]}
    contact={<>
      <p className="horse-page-note">{labels.equipmentContactNote}</p>
      <div className="horse-contact-main">{federationOptions(contacts, labels.sellerCall).map((option) => <ContactLink option={option} large key={option.key} />)}</div>
    </>}
    moreTitle={labels.equipmentRecommended} long
    more={recommended.map((other) => <EquipmentCard key={other.id} item={other} locale={locale} price={price} />)} />;
}
