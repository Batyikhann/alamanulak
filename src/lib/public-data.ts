import "server-only";
import { db } from "@/lib/db";
import { getPublicTournaments } from "@/lib/tournaments";

export async function getPublicData() {
  const [settings, articles, tournaments, players, rules, categories, horses, members, aboutPhotos, milestones, mediaItems] = await Promise.all([
    db.siteSettings.findUnique({ where: { id: "main" } }),
    db.newsArticle.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: 12,
    }),
    getPublicTournaments(),
    db.player.findMany({
      where: { published: true },
      orderBy: [{ clubKy: "asc" }, { number: "asc" }, { name: "asc" }],
    }),
    db.ruleSection.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
    }),
    db.horseCategory.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
    db.horseListing.findMany({
      where: { published: true, category: { active: true } },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    db.federationMember.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    db.aboutPhoto.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    db.historyMilestone.findMany({
      where: { published: true },
      orderBy: { year: "asc" },
    }),
    db.mediaItem.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  return {
    settings,
    articles: articles.map((article) => ({
      ...article,
      publishedAt: article.publishedAt?.toISOString() ?? null,
    })),
    tournaments: tournaments.map((tournament) => ({
      ...tournament,
      startsAt: tournament.startsAt.toISOString(),
      endsAt: tournament.endsAt.toISOString(),
    })),
    players,
    rules,
    categories,
    horses,
    members,
    aboutPhotos,
    milestones,
    mediaItems,
  };
}

// The news page shows the newest NEWS_RECENT articles, NEWS_PER_PAGE at a time; older ones form the archive.
export const NEWS_PER_PAGE = 12;
export const NEWS_RECENT = 36;

export async function getNewsPage(requestedPage: number, archive: boolean) {
  const total = await db.newsArticle.count({ where: { published: true } });
  const recentTotal = Math.min(total, NEWS_RECENT);
  const archiveTotal = Math.max(0, total - NEWS_RECENT);
  const listTotal = archive ? archiveTotal : recentTotal;
  const pageCount = Math.max(1, Math.ceil(listTotal / NEWS_PER_PAGE));
  const page = Math.min(Math.max(1, requestedPage), pageCount);
  const skip = (archive ? NEWS_RECENT : 0) + (page - 1) * NEWS_PER_PAGE;
  const take = archive ? NEWS_PER_PAGE : Math.max(0, Math.min(NEWS_PER_PAGE, recentTotal - (page - 1) * NEWS_PER_PAGE));
  const articles = take ? await db.newsArticle.findMany({
    where: { published: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    skip,
    take,
  }) : [];
  return {
    articles: articles.map((article) => ({ ...article, publishedAt: article.publishedAt?.toISOString() ?? null })),
    page,
    pageCount,
    archive,
    archiveTotal,
  };
}
