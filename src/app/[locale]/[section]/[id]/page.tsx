import { notFound } from "next/navigation";
import { connection } from "next/server";
import HomeExperience from "@/components/home-experience";
import { getAdminProfile } from "@/lib/auth";
import { getOrderSeed } from "@/lib/order-seed";
import { getPublicArticle, getPublicData } from "@/lib/public-data";
import type { Locale } from "@/lib/i18n";

export const instant = false;

type ItemPageProps = { params: Promise<{ locale: string; section: string; id: string }> };

// A single item's own page, inside the site's header and footer: /[locale]/horses/[id] (a published horse listing:
// its video, photos, details and the seller's contacts), /[locale]/calendar/[id] (a tournament: its photo, dates,
// prizes or results and the detailed information) and /[locale]/news/[id] (an article with its full text).
export default async function PublicItemPage({ params }: ItemPageProps) {
  await connection();
  const { locale: localeParam, section, id } = await params;
  if (localeParam !== "ky" && localeParam !== "ru") notFound();
  if (section !== "horses" && section !== "calendar" && section !== "news") notFound();

  const locale: Locale = localeParam;
  const [data, admin, orderSeed, article] = await Promise.all([getPublicData(), getAdminProfile(), getOrderSeed(), section === "news" ? getPublicArticle(id) : null]);
  if (!data.settings) notFound();
  if (section === "horses" && !data.horses.some((horse) => horse.id === id)) notFound();
  if (section === "calendar" && !data.tournaments.some((tournament) => tournament.id === id)) notFound();
  if (section === "news" && !article) notFound();

  return <HomeExperience locale={locale} section={section} admin={admin} orderSeed={orderSeed} {...data} settings={data.settings}
    horseId={section === "horses" ? id : undefined} tournamentId={section === "calendar" ? id : undefined} article={article ?? undefined} />;
}
