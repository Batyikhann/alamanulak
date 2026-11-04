import { notFound } from "next/navigation";
import { connection } from "next/server";
import HomeExperience from "@/components/home-experience";
import { getAdminProfile } from "@/lib/auth";
import { getOrderSeed } from "@/lib/order-seed";
import { getNewsPage, getPublicData } from "@/lib/public-data";
import type { Locale, PublicSection } from "@/lib/i18n";

export const instant = false;

const publicSections = ["about", "calendar", "players", "news", "media", "rules", "horses"] as const satisfies readonly PublicSection[];

type SectionPageProps = {
  params: Promise<{ locale: string; section: string }>;
  searchParams: Promise<{ page?: string | string[]; archive?: string | string[] }>;
};

export default async function PublicSectionPage({ params, searchParams }: SectionPageProps) {
  await connection();
  const [{ locale: localeParam, section: sectionParam }, query] = await Promise.all([params, searchParams]);
  if (localeParam !== "ky" && localeParam !== "ru") notFound();
  if (!publicSections.includes(sectionParam as PublicSection)) notFound();

  const locale: Locale = localeParam;
  const section = sectionParam as PublicSection;
  const [data, admin, orderSeed] = await Promise.all([getPublicData(), getAdminProfile(), getOrderSeed()]);
  if (!data.settings) notFound();

  const newsPage = section === "news"
    ? await getNewsPage(Number(typeof query.page === "string" ? query.page : 1) || 1, query.archive === "1")
    : undefined;

  return <HomeExperience locale={locale} section={section} newsPage={newsPage} admin={admin} orderSeed={orderSeed} {...data} settings={data.settings} />;
}