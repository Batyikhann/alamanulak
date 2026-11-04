import { notFound } from "next/navigation";
import { connection } from "next/server";
import HomeExperience from "@/components/home-experience";
import { getAdminProfile } from "@/lib/auth";
import { getOrderSeed } from "@/lib/order-seed";
import type { Locale } from "@/lib/i18n";
import { getPublicData } from "@/lib/public-data";

export const instant = false;

export default async function LocalizedHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (localeParam !== "ky" && localeParam !== "ru") notFound();
  const locale: Locale = localeParam;
  await connection();
  const [data, admin, orderSeed] = await Promise.all([getPublicData(), getAdminProfile(), getOrderSeed()]);
  const settings = data.settings;
  if (!settings) notFound();

  return <HomeExperience locale={locale} admin={admin} orderSeed={orderSeed} {...data} settings={settings} />;
}