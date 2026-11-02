import { notFound } from "next/navigation";
import "./admin.css";
import { cookies } from "next/headers";
import { connection } from "next/server";
import AdminWorkspace, { adminTabs, type AdminTab } from "@/components/admin-workspace";
import AuthPanel from "@/components/auth-panel";
import { hasAdminAccount, isAdminAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Locale } from "@/lib/i18n";

export const instant = false;

type AdminPageProps = {
  searchParams: Promise<{ lang?: string; tab?: string; saved?: string; error?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await connection();
  const query = await searchParams;
  const locale: Locale = query.lang === "ru" ? "ru" : "ky";
  const accountExists = await hasAdminAccount();
  if (!accountExists) return <AuthPanel locale={locale} mode="setup" />;
  if (!(await isAdminAuthenticated())) return <AuthPanel locale={locale} mode="login" />;

  const [settings, articles, tournaments, players, rules, categories, horses, inquiries, members, aboutPhotos, milestones, mediaItems] = await Promise.all([
    db.siteSettings.findUnique({ where: { id: "main" } }),
    db.newsArticle.findMany({ orderBy: { createdAt: "desc" } }),
    db.tournament.findMany({ orderBy: { startsAt: "desc" } }),
    db.player.findMany({ orderBy: [{ clubKy: "asc" }, { number: "asc" }, { name: "asc" }] }),
    db.ruleSection.findMany({ orderBy: { sortOrder: "asc" } }),
    db.horseCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    db.horseListing.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } }),
    db.contactInquiry.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    db.federationMember.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    db.aboutPhoto.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    db.historyMilestone.findMany({ orderBy: { year: "asc" } }),
    db.mediaItem.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }),
  ]);

  if (!settings) notFound();
  const tab: AdminTab = adminTabs.includes(query.tab as AdminTab) ? query.tab as AdminTab : "overview";
  // Preview pane preferences live in cookies so the server renders the pane as the admin left it.
  const store = await cookies();
  const preview = {
    open: store.get("admin-preview")?.value !== "closed",
    width: Number(store.get("admin-preview-width")?.value) || 0,
    device: store.get("admin-preview-device")?.value === "phone" ? "phone" as const : "desktop" as const,
  };
  const username = await db.adminAccount.findUnique({ where: { id: "federation-admin" }, select: { username: true } });
  if (!username) notFound();

  return (
    <AdminWorkspace
      locale={locale}
      username={username.username}
      tab={tab}
      saved={query.saved}
      preview={preview}
      error={query.error}
      data={{
        settings,
        articles,
        tournaments,
        players,
        rules,
        categories,
        horses,
        inquiries,
        members,
        aboutPhotos,
        milestones,
        mediaItems,
      }}
    />
  );
}