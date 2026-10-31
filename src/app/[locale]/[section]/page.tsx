import { notFound } from "next/navigation";
import { connection } from "next/server";
import HomeExperience from "@/components/home-experience";
import { getPublicData } from "@/lib/public-data";
import type { Locale, PublicSection } from "@/lib/i18n";

export const instant = false;

const publicSections = ["about", "calendar", "teams", "news", "media", "rules", "horses", "contact"] as const satisfies readonly PublicSection[];

type SectionPageProps = {
  params: Promise<{ locale: string; section: string }>;
  searchParams: Promise<{ horse?: string | string[] }>;
};

export default async function PublicSectionPage({ params, searchParams }: SectionPageProps) {
  await connection();
  const [{ locale: localeParam, section: sectionParam }, query] = await Promise.all([params, searchParams]);
  if (localeParam !== "ky" && localeParam !== "ru") notFound();
  if (!publicSections.includes(sectionParam as PublicSection)) notFound();

  const locale: Locale = localeParam;
  const section = sectionParam as PublicSection;
  const data = await getPublicData();
  if (!data.settings) notFound();

  const horseValue = query.horse;
  const contactHorse = typeof horseValue === "string" ? horseValue.slice(0, 120) : undefined;

  return <HomeExperience locale={locale} section={section} contactHorse={contactHorse} {...data} settings={data.settings} />;
}