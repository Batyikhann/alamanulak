"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { changeAdminCredentials, endAdminSession, isAdminAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Locale } from "@/lib/i18n";
import { kgRegions } from "@/lib/kg-regions";

const requiredText = (limit = 4000) => z.string().trim().min(1).max(limit);
const imagePath = z.string().trim().min(1).max(500).refine((value) => value.startsWith("https://") || (value.startsWith("/") && !value.startsWith("//")));
const youtubeLink = z.string().trim().max(300).refine((url) => !url || /^https:\/\/(www\.|m\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)[\w-]{11}/.test(url));
const phoneNumber = z.string().trim().max(40).refine((phone) => !phone || /^[+\d][\d\s()-]{4,}$/.test(phone));

// A Telegram or Instagram contact as typed by the admin (@name, name or a full link) → the bare username.
function socialHandle(input: string, host: RegExp) {
  const handle = input.trim().replace(host, "").replace(/^@/, "").replace(/[/?#].*$/, "");
  return /^[\w.]{2,40}$/.test(handle) ? handle : null;
}

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

const adminTabs = ["overview", "settings", "news", "tournaments", "players", "media", "rules", "horses", "federation", "profile"];

// Back to the admin section the form was sent from (read from the referring URL), so a save
// keeps you where you were. `saved` carries a timestamp: the site preview reloads when it changes.
async function adminUrl(locale: Locale, extra: string) {
  const referer = (await headers()).get("referer");
  let tab = "";
  try { tab = referer ? new URL(referer).searchParams.get("tab") ?? "" : ""; } catch {}
  return `/admin/settings?lang=${locale}${adminTabs.includes(tab) ? `&tab=${tab}` : ""}&${extra}`;
}

async function finish(locale: Locale): Promise<never> {
  revalidatePath("/ky");
  revalidatePath("/ru");
  revalidatePath("/admin/settings");
  redirect(await adminUrl(locale, `saved=${Date.now()}`));
}

// A form that fails the checks goes back to its section with a message (`error=invalid`), instead of
// an error page. Each exported action runs its body through `guard`; anything else that throws still throws.
class InvalidInput extends Error {}

function invalid(): never {
  throw new InvalidInput("Please complete both language versions and check all fields.");
}

async function guard(formData: FormData, action: (formData: FormData) => Promise<void>) {
  try {
    await action(formData);
  } catch (error) {
    if (!(error instanceof InvalidInput)) throw error;
    redirect(await adminUrl(localeValue(formData), "error=invalid"));
  }
}

// The admin's own name and photo, shown in the site header.
export async function saveAdminProfileAction(formData: FormData) {
  await guard(formData, saveAdminProfileActionChecked);
}

async function saveAdminProfileActionChecked(formData: FormData) {
  await authorize();
  const parsed = z.object({
    displayName: z.string().trim().max(80),
    photoUrl: z.string().trim().max(500).refine((value) => !value || value.startsWith("https://") || (value.startsWith("/") && !value.startsWith("//"))),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) invalid();
  await db.adminAccount.update({ where: { id: "federation-admin" }, data: parsed.data });
  await finish(localeValue(formData));
}

// The sign-in username and password. The current password confirms the change; a new password is optional
// (left empty, only the username changes) and, as at first setup, has at least 12 characters, typed twice.
export async function saveAdminCredentialsAction(formData: FormData) {
  await guard(formData, saveAdminCredentialsActionChecked);
}

async function saveAdminCredentialsActionChecked(formData: FormData) {
  await authorize();
  const parsed = z.object({
    currentPassword: z.string().min(1).max(128),
    username: z.string().trim().min(3).max(40),
    newPassword: z.string().max(128).refine((password) => !password || password.length >= 12),
    confirmPassword: z.string().max(128),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) invalid();
  const locale = localeValue(formData);
  if (parsed.data.newPassword !== parsed.data.confirmPassword) redirect(await adminUrl(locale, "error=password-mismatch"));
  if (!(await changeAdminCredentials(parsed.data.currentPassword, parsed.data.username, parsed.data.newPassword))) {
    redirect(await adminUrl(locale, "error=wrong-password"));
  }
  await finish(locale);
}

export async function logoutAction() {
  await endAdminSession();
  redirect("/admin?lang=ky");
}

export async function saveSettingsAction(formData: FormData) {
  await guard(formData, saveSettingsActionChecked);
}

async function saveSettingsActionChecked(formData: FormData) {
  await authorize();
  const parsed = z.object({
    brandName: requiredText(80),
    heroTitleKy: requiredText(180), heroTitleRu: requiredText(180),
    heroTextKy: requiredText(), heroTextRu: requiredText(),
    aboutTitleKy: requiredText(180), aboutTitleRu: requiredText(180),
    aboutTextKy: requiredText(), aboutTextRu: requiredText(),
    calendarTitleKy: requiredText(180), calendarTitleRu: requiredText(180),
    calendarTextKy: requiredText(), calendarTextRu: requiredText(),
    teamTitleKy: requiredText(180), teamTitleRu: requiredText(180),
    newsTitleKy: requiredText(180), newsTitleRu: requiredText(180),
    rulesTitleKy: requiredText(180), rulesTitleRu: requiredText(180),
    horsesTitleKy: requiredText(180), horsesTitleRu: requiredText(180),
    contactPhone: requiredText(40),
    contactEmail: z.string().trim().email().max(150),
    addressKy: requiredText(240), addressRu: requiredText(240),
    socialUrl: z.string().trim().max(300).refine((value) => !value || value.startsWith("https://")),
    heroImageUrl: imagePath,
    bandImageUrl: imagePath,
    bandTitleKy: requiredText(180), bandTitleRu: requiredText(180),
    bandTextKy: z.string().trim().max(400), bandTextRu: z.string().trim().max(400),
    bandVideoUrl: youtubeLink,
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) invalid();
  const data = { ...parsed.data, bandShown: formData.get("bandShown") === "on" };
  await db.siteSettings.upsert({
    where: { id: "main" },
    update: data,
    create: { id: "main", ...data },
  });
  await finish(localeValue(formData));
}

export async function saveNewsAction(formData: FormData) {
  await guard(formData, saveNewsActionChecked);
}

async function saveNewsActionChecked(formData: FormData) {
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
  await guard(formData, saveTournamentActionChecked);
}

async function saveTournamentActionChecked(formData: FormData) {
  await authorize();
  const parsed = z.object({
    titleKy: requiredText(180), titleRu: requiredText(180),
    locationKy: requiredText(180), locationRu: requiredText(180),
    startsAt: z.string().min(1), endsAt: z.string().min(1),
    resultSummaryKy: z.string().trim().max(1500), resultSummaryRu: z.string().trim().max(1500),
    ...Object.fromEntries(prizeFields.map((field) => [field, z.string().trim().max(160)])),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) invalid();
  const places = parsed.data as unknown as Record<(typeof prizeFields)[number], string>;
  // Each optional text is given in both languages or in neither.
  if (Boolean(parsed.data.resultSummaryKy) !== Boolean(parsed.data.resultSummaryRu)) invalid();
  if (prizeFields.some((field) => field.endsWith("Ky") && Boolean(places[field]) !== Boolean(places[field.replace(/Ky$/, "Ru") as (typeof prizeFields)[number]]))) invalid();
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
    ...Object.fromEntries(prizeFields.map((field) => [field, places[field]])),
    startsAt,
    endsAt,
    published: publishedValue(formData),
  };
  const id = value(formData, "id");
  if (id) await db.tournament.update({ where: { id }, data });
  else await db.tournament.create({ data });
  await finish(localeValue(formData));
}

// The three prize places of a tournament: what is on offer and which team won it, in both languages.
const prizeFields = [1, 2, 3].flatMap((place) => ["prize", "winner"].flatMap((kind) => [`${kind}${place}Ky`, `${kind}${place}Ru`])) as
  `${"prize" | "winner"}${1 | 2 | 3}${"Ky" | "Ru"}`[];

export async function deleteTournamentAction(formData: FormData) {
  await authorize();
  await db.tournament.delete({ where: { id: value(formData, "id") } });
  await finish(localeValue(formData));
}

export async function savePlayerAction(formData: FormData) {
  await guard(formData, savePlayerActionChecked);
}

async function savePlayerActionChecked(formData: FormData) {
  await authorize();
  const parsed = z.object({
    name: requiredText(120), positionKy: requiredText(120), positionRu: requiredText(120),
    number: z.string().trim(), bioKy: z.string().trim().max(1000), bioRu: z.string().trim().max(1000),
    imageUrl: z.string().trim().max(500), clubKy: z.string().trim().max(120), clubRu: z.string().trim().max(120),
    cityKy: z.string().trim().max(120), cityRu: z.string().trim().max(120), birthYear: z.string().trim(),
    achievementsKy: z.string().trim().max(1500), achievementsRu: z.string().trim().max(1500),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success || (parsed.data.imageUrl && !/^(https?:\/\/|\/)/.test(parsed.data.imageUrl))) invalid();
  if (Boolean(parsed.data.bioKy) !== Boolean(parsed.data.bioRu) || Boolean(parsed.data.clubKy) !== Boolean(parsed.data.clubRu)
    || Boolean(parsed.data.cityKy) !== Boolean(parsed.data.cityRu) || Boolean(parsed.data.achievementsKy) !== Boolean(parsed.data.achievementsRu)) invalid();
  const birthYear = parsed.data.birthYear ? Number(parsed.data.birthYear) : null;
  if (birthYear !== null && (!Number.isInteger(birthYear) || birthYear < 1930 || birthYear > new Date().getFullYear())) invalid();
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
    clubKy: parsed.data.clubKy,
    clubRu: parsed.data.clubRu,
    cityKy: parsed.data.cityKy,
    cityRu: parsed.data.cityRu,
    birthYear,
    achievementsKy: parsed.data.achievementsKy,
    achievementsRu: parsed.data.achievementsRu,
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

// A yellow or red card on a player: the date it was given, optionally the tournament, and the reason.
export async function savePlayerCardAction(formData: FormData) {
  await guard(formData, savePlayerCardActionChecked);
}

async function savePlayerCardActionChecked(formData: FormData) {
  await authorize();
  const parsed = z.object({
    playerId: requiredText(64), color: z.enum(["yellow", "red"]), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    tournamentId: z.string().trim().max(64), reasonKy: z.string().trim().max(300), reasonRu: z.string().trim().max(300),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success || Boolean(parsed.data.reasonKy) !== Boolean(parsed.data.reasonRu)) invalid();
  const date = new Date(`${parsed.data.date}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) invalid();
  const data = { ...parsed.data, date, tournamentId: parsed.data.tournamentId || null };
  const id = value(formData, "id");
  if (id) await db.playerCard.update({ where: { id }, data });
  else await db.playerCard.create({ data });
  await finish(localeValue(formData));
}

export async function deletePlayerCardAction(formData: FormData) {
  await authorize();
  await db.playerCard.delete({ where: { id: value(formData, "id") } });
  await finish(localeValue(formData));
}

export async function saveRuleAction(formData: FormData) {
  await guard(formData, saveRuleActionChecked);
}

async function saveRuleActionChecked(formData: FormData) {
  await authorize();
  const parsed = z.object({
    titleKy: requiredText(180), titleRu: requiredText(180),
    bodyKy: requiredText(), bodyRu: requiredText(), sortOrder: z.coerce.number().int().min(0).max(999),
    symbol: z.enum(["", "horn", "rosette", "tunduk", "horse", "shyrdak", "emblem"]),
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
  await guard(formData, saveCategoryActionChecked);
}

async function saveCategoryActionChecked(formData: FormData) {
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
  await guard(formData, saveHorseActionChecked);
}

async function saveHorseActionChecked(formData: FormData) {
  await authorize();
  const parsed = z.object({
    nameKy: requiredText(120), nameRu: requiredText(120),
    ageKy: requiredText(80), ageRu: requiredText(80),
    descriptionKy: requiredText(1200), descriptionRu: requiredText(1200),
    locationKy: requiredText(160), locationRu: requiredText(160),
    price: z.string().trim(), imageUrl: z.string().trim().max(500), videoUrl: youtubeLink, categoryId: requiredText(80),
    sellerName: z.string().trim().max(120), sellerPhone: phoneNumber, sellerWhatsapp: phoneNumber,
    sellerTelegram: z.string().trim().max(120), sellerInstagram: z.string().trim().max(120),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) invalid();
  // A listing needs its video, or at least a photo until the video is up.
  if (!parsed.data.videoUrl && !parsed.data.imageUrl) invalid();
  if (parsed.data.imageUrl && !imagePath.safeParse(parsed.data.imageUrl).success) invalid();
  const sellerTelegram = parsed.data.sellerTelegram ? socialHandle(parsed.data.sellerTelegram, /^(https?:\/\/)?(www\.)?(t\.me|telegram\.me)\//i) : "";
  const sellerInstagram = parsed.data.sellerInstagram ? socialHandle(parsed.data.sellerInstagram, /^(https?:\/\/)?(www\.)?instagram\.com\//i) : "";
  if (sellerTelegram === null || sellerInstagram === null) invalid();
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
    videoUrl: parsed.data.videoUrl,
    categoryId: parsed.data.categoryId,
    sellerName: parsed.data.sellerName,
    sellerPhone: parsed.data.sellerPhone,
    sellerWhatsapp: parsed.data.sellerWhatsapp,
    sellerTelegram,
    sellerInstagram,
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

const memberKinds = ["leader", "board", "regional"] as const;

export async function saveMemberAction(formData: FormData) {
  await guard(formData, saveMemberActionChecked);
}

async function saveMemberActionChecked(formData: FormData) {
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
  await guard(formData, saveAboutPhotoActionChecked);
}

async function saveAboutPhotoActionChecked(formData: FormData) {
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

// Several uploaded photos at once (from the admin's "upload one or more photos" box). Captions are optional;
// one written in a single language is used for both.
function batchItems(formData: FormData) {
  const parsed = z.array(z.object({ url: imagePath, captionKy: z.string().trim().max(200), captionRu: z.string().trim().max(200) })).min(1).max(60)
    .safeParse((() => { try { return JSON.parse(value(formData, "items")); } catch { return null; } })());
  if (!parsed.success) invalid();
  return parsed.data.map((item) => ({ imageUrl: item.url, captionKy: item.captionKy || item.captionRu, captionRu: item.captionRu || item.captionKy }));
}

export async function saveAboutPhotoBatchAction(formData: FormData) {
  await guard(formData, saveAboutPhotoBatchActionChecked);
}

async function saveAboutPhotoBatchActionChecked(formData: FormData) {
  await authorize();
  const items = batchItems(formData);
  const start = await db.aboutPhoto.count();
  await db.aboutPhoto.createMany({ data: items.map((item, index) => ({ ...item, sortOrder: Math.min(999, start + index + 1), published: publishedValue(formData) })) });
  await finish(localeValue(formData));
}

export async function deleteAboutPhotoAction(formData: FormData) {
  await authorize();
  await db.aboutPhoto.delete({ where: { id: value(formData, "id") } });
  await finish(localeValue(formData));
}

export async function saveMilestoneAction(formData: FormData) {
  await guard(formData, saveMilestoneActionChecked);
}

async function saveMilestoneActionChecked(formData: FormData) {
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

export async function saveMediaAction(formData: FormData) {
  await guard(formData, saveMediaActionChecked);
}

async function saveMediaActionChecked(formData: FormData) {
  await authorize();
  const parsed = z.object({
    imageUrl: imagePath, captionKy: requiredText(200), captionRu: requiredText(200),
    videoUrl: youtubeLink,
    category: z.enum(["tournaments", "players", "horses", "federation"]),
    sortOrder: z.coerce.number().int().min(0).max(999),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) invalid();
  const data = { ...parsed.data, published: publishedValue(formData) };
  const id = value(formData, "id");
  if (id) await db.mediaItem.update({ where: { id }, data });
  else await db.mediaItem.create({ data });
  await finish(localeValue(formData));
}

export async function saveMediaBatchAction(formData: FormData) {
  await guard(formData, saveMediaBatchActionChecked);
}

async function saveMediaBatchActionChecked(formData: FormData) {
  await authorize();
  const items = batchItems(formData);
  const category = z.enum(["tournaments", "players", "horses", "federation"]).safeParse(value(formData, "category"));
  if (!category.success) invalid();
  const start = await db.mediaItem.count();
  await db.mediaItem.createMany({ data: items.map((item, index) => ({ ...item, category: category.data, sortOrder: Math.min(999, start + index + 1), published: publishedValue(formData) })) });
  await finish(localeValue(formData));
}

export async function deleteMediaAction(formData: FormData) {
  await authorize();
  await db.mediaItem.delete({ where: { id: value(formData, "id") } });
  await finish(localeValue(formData));
}
