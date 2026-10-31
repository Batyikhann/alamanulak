"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { endAdminSession, isAdminAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Locale } from "@/lib/i18n";
import { kgRegions } from "@/lib/kg-regions";

const requiredText = (limit = 4000) => z.string().trim().min(1).max(limit);
const imagePath = z.string().trim().min(1).max(500).refine((value) => value.startsWith("https://") || (value.startsWith("/") && !value.startsWith("//")));

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function localeValue(formData: FormData): Locale {
  return value(formData, "locale") === "ru" ? "ru" : "ky";
}

function publishedValue(formData: FormData) {
  return formData.get("published") === "on";
}

async function authorize() {
  if (!(await isAdminAuthenticated())) throw new Error("Unauthorized");
}

const adminTabs = ["overview", "settings", "news", "tournaments", "teams", "rules", "horses", "federation", "inquiries"];

// Back to the admin section the form was sent from (read from the referring URL), so a save
// keeps you where you were. `saved` carries a timestamp: the site preview reloads when it changes.
async function adminUrl(locale: Locale, extra: string) {
  const referer = (await headers()).get("referer");
  let tab = "";
  try { tab = referer ? new URL(referer).searchParams.get("tab") ?? "" : ""; } catch {}
  return `/admin?lang=${locale}${adminTabs.includes(tab) ? `&tab=${tab}` : ""}&${extra}`;
}

async function finish(locale: Locale): Promise<never> {
  revalidatePath("/ky");
  revalidatePath("/ru");
  revalidatePath("/admin");
  redirect(await adminUrl(locale, `saved=${Date.now()}`));
}

function invalid(): never {
  throw new Error("Please complete both language versions and check all fields.");
}

export async function logoutAction() {
  await endAdminSession();
  redirect("/admin?lang=ky");
}

export async function saveSettingsAction(formData: FormData) {
  await authorize();
  const parsed = z.object({
    brandName: requiredText(80),
    heroTitleKy: requiredText(180), heroTitleRu: requiredText(180),
    heroTextKy: requiredText(), heroTextRu: requiredText(),
    aboutTitleKy: requiredText(180), aboutTitleRu: requiredText(180),
    aboutTextKy: requiredText(), aboutTextRu: requiredText(),
    calendarTitleKy: requiredText(180), calendarTitleRu: requiredText(180),
    teamTitleKy: requiredText(180), teamTitleRu: requiredText(180),
    newsTitleKy: requiredText(180), newsTitleRu: requiredText(180),
    rulesTitleKy: requiredText(180), rulesTitleRu: requiredText(180),
    horsesTitleKy: requiredText(180), horsesTitleRu: requiredText(180),
    contactTitleKy: requiredText(180), contactTitleRu: requiredText(180),
    contactPhone: requiredText(40),
    contactEmail: z.string().trim().email().max(150),
    addressKy: requiredText(240), addressRu: requiredText(240),
    socialUrl: z.string().trim().max(300).refine((value) => !value || value.startsWith("https://")),
    heroImageUrl: imagePath,
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) invalid();
  await db.siteSettings.upsert({
    where: { id: "main" },
    update: parsed.data,
    create: { id: "main", ...parsed.data },
  });
  await finish(localeValue(formData));
}

export async function saveNewsAction(formData: FormData) {
  await authorize();
  const parsed = z.object({
    titleKy: requiredText(180), titleRu: requiredText(180),
    excerptKy: requiredText(500), excerptRu: requiredText(500),
    bodyKy: requiredText(), bodyRu: requiredText(), imageUrl: imagePath,
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) invalid();
  const id = value(formData, "id");
  const published = publishedValue(formData);
  const current = id ? await db.newsArticle.findUnique({ where: { id } }) : null;
  const data = {
    ...parsed.data,
    published,
    publishedAt: published ? current?.publishedAt ?? new Date() : null,
  };
  if (id) await db.newsArticle.update({ where: { id }, data });
  else await db.newsArticle.create({ data });
  await finish(localeValue(formData));
}

export async function deleteNewsAction(formData: FormData) {
  await authorize();
  await db.newsArticle.delete({ where: { id: value(formData, "id") } });
  await finish(localeValue(formData));
}

export async function saveTournamentAction(formData: FormData) {
  await authorize();
  const parsed = z.object({
    titleKy: requiredText(180), titleRu: requiredText(180),
    locationKy: requiredText(180), locationRu: requiredText(180),
    startsAt: z.string().min(1), endsAt: z.string().min(1),
    resultSummaryKy: z.string().trim().max(1500), resultSummaryRu: z.string().trim().max(1500),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) invalid();
  if (Boolean(parsed.data.resultSummaryKy) !== Boolean(parsed.data.resultSummaryRu)) invalid();
  const startsAt = new Date(parsed.data.startsAt);
  const endsAt = new Date(parsed.data.endsAt);
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt < startsAt) invalid();
  const data = {
    titleKy: parsed.data.titleKy,
    titleRu: parsed.data.titleRu,
    locationKy: parsed.data.locationKy,
    locationRu: parsed.data.locationRu,
    resultSummaryKy: parsed.data.resultSummaryKy,
    resultSummaryRu: parsed.data.resultSummaryRu,
    startsAt,
    endsAt,
    published: publishedValue(formData),
  };
  const id = value(formData, "id");
  if (id) await db.tournament.update({ where: { id }, data });
  else await db.tournament.create({ data });
  await finish(localeValue(formData));
}

export async function deleteTournamentAction(formData: FormData) {
  await authorize();
  await db.tournament.delete({ where: { id: value(formData, "id") } });
  await finish(localeValue(formData));
}

export async function saveTeamAction(formData: FormData) {
  await authorize();
  const parsed = z.object({
    nameKy: requiredText(120), nameRu: requiredText(120),
    locationKy: requiredText(160), locationRu: requiredText(160),
    descriptionKy: requiredText(1000), descriptionRu: requiredText(1000),
    imageUrl: imagePath,
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) invalid();
  const data = { ...parsed.data, published: publishedValue(formData) };
  const id = value(formData, "id");
  if (id) await db.team.update({ where: { id }, data });
  else await db.team.create({ data });
  await finish(localeValue(formData));
}

export async function deleteTeamAction(formData: FormData) {
  await authorize();
  await db.team.delete({ where: { id: value(formData, "id") } });
  await finish(localeValue(formData));
}

export async function savePlayerAction(formData: FormData) {
  await authorize();
  const parsed = z.object({
    name: requiredText(120), positionKy: requiredText(120), positionRu: requiredText(120),
    number: z.string().trim(), bioKy: requiredText(1000), bioRu: requiredText(1000),
    imageUrl: z.string().trim().max(500), teamId: requiredText(80),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success || (parsed.data.imageUrl && !/^(https?:\/\/|\/)/.test(parsed.data.imageUrl))) invalid();
  const number = parsed.data.number ? Number(parsed.data.number) : null;
  if (number !== null && (!Number.isInteger(number) || number < 0 || number > 999)) invalid();
  const data = {
    name: parsed.data.name,
    positionKy: parsed.data.positionKy,
    positionRu: parsed.data.positionRu,
    number,
    bioKy: parsed.data.bioKy,
    bioRu: parsed.data.bioRu,
    imageUrl: parsed.data.imageUrl,
    teamId: parsed.data.teamId,
    published: publishedValue(formData),
  };
  const id = value(formData, "id");
  if (id) await db.player.update({ where: { id }, data });
  else await db.player.create({ data });
  await finish(localeValue(formData));
}

export async function deletePlayerAction(formData: FormData) {
  await authorize();
  await db.player.delete({ where: { id: value(formData, "id") } });
  await finish(localeValue(formData));
}

export async function saveRuleAction(formData: FormData) {
  await authorize();
  const parsed = z.object({
    titleKy: requiredText(180), titleRu: requiredText(180),
    bodyKy: requiredText(), bodyRu: requiredText(), sortOrder: z.coerce.number().int().min(0).max(999),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) invalid();
  const data = { ...parsed.data, published: publishedValue(formData) };
  const id = value(formData, "id");
  if (id) await db.ruleSection.update({ where: { id }, data });
  else await db.ruleSection.create({ data });
  await finish(localeValue(formData));
}

export async function deleteRuleAction(formData: FormData) {
  await authorize();
  await db.ruleSection.delete({ where: { id: value(formData, "id") } });
  await finish(localeValue(formData));
}

export async function saveCategoryAction(formData: FormData) {
  await authorize();
  const parsed = z.object({
    nameKy: requiredText(80), nameRu: requiredText(80), sortOrder: z.coerce.number().int().min(0).max(999),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) invalid();
  const data = { ...parsed.data, active: publishedValue(formData) };
  const id = value(formData, "id");
  if (id) await db.horseCategory.update({ where: { id }, data });
  else await db.horseCategory.create({ data });
  await finish(localeValue(formData));
}

export async function deleteCategoryAction(formData: FormData) {
  await authorize();
  const id = value(formData, "id");
  const listingCount = await db.horseListing.count({ where: { categoryId: id } });
  if (listingCount) redirect(await adminUrl(localeValue(formData), "error=category-used"));
  await db.horseCategory.delete({ where: { id } });
  await finish(localeValue(formData));
}

export async function saveHorseAction(formData: FormData) {
  await authorize();
  const parsed = z.object({
    nameKy: requiredText(120), nameRu: requiredText(120),
    ageKy: requiredText(80), ageRu: requiredText(80),
    descriptionKy: requiredText(1200), descriptionRu: requiredText(1200),
    locationKy: requiredText(160), locationRu: requiredText(160),
    price: z.string().trim(), imageUrl: imagePath, categoryId: requiredText(80),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) invalid();
  const price = parsed.data.price ? Number(parsed.data.price) : null;
  if (price !== null && (!Number.isInteger(price) || price < 0 || price > 2_000_000_000)) invalid();
  const data = {
    nameKy: parsed.data.nameKy,
    nameRu: parsed.data.nameRu,
    ageKy: parsed.data.ageKy,
    ageRu: parsed.data.ageRu,
    descriptionKy: parsed.data.descriptionKy,
    descriptionRu: parsed.data.descriptionRu,
    locationKy: parsed.data.locationKy,
    locationRu: parsed.data.locationRu,
    price,
    imageUrl: parsed.data.imageUrl,
    categoryId: parsed.data.categoryId,
    published: publishedValue(formData),
  };
  const id = value(formData, "id");
  if (id) await db.horseListing.update({ where: { id }, data });
  else await db.horseListing.create({ data });
  await finish(localeValue(formData));
}

export async function deleteHorseAction(formData: FormData) {
  await authorize();
  await db.horseListing.delete({ where: { id: value(formData, "id") } });
  await finish(localeValue(formData));
}

export async function markInquiryHandledAction(formData: FormData) {
  await authorize();
  await db.contactInquiry.update({
    where: { id: value(formData, "id") },
    data: { handled: formData.get("handled") === "on" },
  });
  await finish(localeValue(formData));
}
const memberKinds = ["leader", "board", "regional"] as const;

export async function saveMemberAction(formData: FormData) {
  await authorize();
  const parsed = z.object({
    name: requiredText(120), roleKy: requiredText(160), roleRu: requiredText(160),
    bioKy: z.string().trim().max(1200), bioRu: z.string().trim().max(1200),
    photoUrl: z.string().trim().max(500), kind: z.enum(memberKinds),
    region: z.string().trim().max(10).refine((code) => !code || kgRegions.some((region) => region.id === code)),
    phone: z.string().trim().max(40), sortOrder: z.coerce.number().int().min(0).max(999),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success || (parsed.data.photoUrl && !imagePath.safeParse(parsed.data.photoUrl).success)) invalid();
  if (Boolean(parsed.data.bioKy) !== Boolean(parsed.data.bioRu)) invalid();
  if (parsed.data.kind === "regional" && !parsed.data.region) invalid();
  const data = { ...parsed.data, published: publishedValue(formData) };
  const id = value(formData, "id");
  if (id) await db.federationMember.update({ where: { id }, data });
  else await db.federationMember.create({ data });
  await finish(localeValue(formData));
}

export async function deleteMemberAction(formData: FormData) {
  await authorize();
  await db.federationMember.delete({ where: { id: value(formData, "id") } });
  await finish(localeValue(formData));
}

export async function saveAboutPhotoAction(formData: FormData) {
  await authorize();
  const parsed = z.object({
    imageUrl: imagePath, captionKy: requiredText(200), captionRu: requiredText(200),
    sortOrder: z.coerce.number().int().min(0).max(999),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) invalid();
  const data = { ...parsed.data, published: publishedValue(formData) };
  const id = value(formData, "id");
  if (id) await db.aboutPhoto.update({ where: { id }, data });
  else await db.aboutPhoto.create({ data });
  await finish(localeValue(formData));
}

export async function deleteAboutPhotoAction(formData: FormData) {
  await authorize();
  await db.aboutPhoto.delete({ where: { id: value(formData, "id") } });
  await finish(localeValue(formData));
}

export async function saveMilestoneAction(formData: FormData) {
  await authorize();
  const parsed = z.object({
    year: z.coerce.number().int().min(1900).max(2100),
    titleKy: requiredText(180), titleRu: requiredText(180),
    textKy: z.string().trim().max(800), textRu: z.string().trim().max(800),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) invalid();
  if (Boolean(parsed.data.textKy) !== Boolean(parsed.data.textRu)) invalid();
  const data = { ...parsed.data, published: publishedValue(formData) };
  const id = value(formData, "id");
  if (id) await db.historyMilestone.update({ where: { id }, data });
  else await db.historyMilestone.create({ data });
  await finish(localeValue(formData));
}

export async function deleteMilestoneAction(formData: FormData) {
  await authorize();
  await db.historyMilestone.delete({ where: { id: value(formData, "id") } });
  await finish(localeValue(formData));
}
