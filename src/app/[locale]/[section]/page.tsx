import { notFound } from "next/navigation";
import { connection } from "next/server";
import HomeExperience from "@/components/home-experience";
import { getPublicData } from "@/lib/public-data";
import type { Locale, PublicSection } from "@/lib/i18n";

export const instant = false;

const publicSections = ["about", "calendar", "teams", "news", "media", "rules", "horses"] as const satisfies readonly PublicSection[];

type SectionPageProps = {
  params: Promise<{ locale: string; section: string }>;
};

export default async function PublicSectionPage({ params }: SectionPageProps) {
  await connection();
  const { locale: localeParam, section: sectionParam } = await params;
  if (localeParam !== "ky" && localeParam !== "ru") notFound();
  if (!publicSections.includes(sectionParam as PublicSection)) notFound();

  const locale: Locale = localeParam;
  const section = sectionParam as PublicSection;
  const data = await getPublicData();
  if (!data.settings) notFound();

  return <HomeExperience locale={locale} section={section} {...data} settings={data.settings} />;
}