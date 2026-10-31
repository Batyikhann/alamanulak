import "server-only";
import { db } from "@/lib/db";
import { getPublicTournaments } from "@/lib/tournaments";

export async function getPublicData() {
  const [settings, articles, tournaments, teams, rules, categories, horses, members, aboutPhotos, milestones] = await Promise.all([
    db.siteSettings.findUnique({ where: { id: "main" } }),
    db.newsArticle.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: 12,
    }),
    getPublicTournaments(),
    db.team.findMany({
      where: { published: true },
      include: { players: { where: { published: true }, orderBy: { number: "asc" } } },
      orderBy: { nameKy: "asc" },
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
    teams,
    rules,
    categories,
    horses,
    members,
    aboutPhotos,
    milestones,
  };
}