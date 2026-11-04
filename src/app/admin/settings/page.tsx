import { notFound, redirect } from "next/navigation";
import "../admin.css";
import { connection } from "next/server";
import AdminWorkspace, { adminTabs, type AdminTab } from "@/components/admin-workspace";
import { isAdminAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Locale } from "@/lib/i18n";

export const instant = false;

// The admin settings: the full management workspace. The admin reaches it from the avatar in the site
// header; signing in happens at /admin, which this page sends signed-out visitors to.
type AdminPageProps = {
  searchParams: Promise<{ lang?: string; tab?: string; saved?: string; error?: string }>;
};

export default async function AdminSettingsPage({ searchParams }: AdminPageProps) {
  await connection();
  const query = await searchParams;
  const locale: Locale = query.lang === "ru" ? "ru" : "ky";
  if (!(await isAdminAuthenticated())) redirect(`/admin?lang=${locale}`);

  const [settings, articles, tournaments, players, rules, categories, horses, members, aboutPhotos, milestones, mediaItems] = await Promise.all([
    db.siteSettings.findUnique({ where: { id: "main" } }),
    db.newsArticle.findMany({ orderBy: { createdAt: "desc" } }),
    db.tournament.findMany({ orderBy: { startsAt: "desc" } }),
    db.player.findMany({ orderBy: [{ clubKy: "asc" }, { number: "asc" }, { name: "asc" }], include: { card: true } }),
    db.ruleSection.findMany({ orderBy: { sortOrder: "asc" } }),
    db.horseCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    db.horseListing.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } }),
    db.federationMember.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    db.aboutPhoto.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    db.historyMilestone.findMany({ orderBy: { year: "asc" } }),
    db.mediaItem.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }),
  ]);

  if (!settings) notFound();
  const tab: AdminTab = adminTabs.includes(query.tab as AdminTab) ? query.tab as AdminTab : "overview";
  const account = await db.adminAccount.findUnique({ where: { id: "federation-admin" }, select: { username: true, displayName: true, photoUrl: true } });
  if (!account) notFound();

  return (
    <AdminWorkspace
      locale={locale}
      username={account.username}
      profile={{ displayName: account.displayName, photoUrl: account.photoUrl }}
      tab={tab}
      saved={query.saved}
      error={query.error}
      data={{
        settings,
        articles,
        tournaments,
        players,
        rules,
        categories,
        horses,
        members,
        aboutPhotos,
        milestones,
        mediaItems,
      }}
    />
  );
}