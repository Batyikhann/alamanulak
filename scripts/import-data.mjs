import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

// One-time copy of a JSON export (made from the old SQLite database) into the database in
// DATABASE_URL. Refuses to run if that database already has content.
// Usage: npm run db:import -- ../alaman-ulak-data-export.json

const file = process.argv[2] ?? "../alaman-ulak-data-export.json";
const prisma = new PrismaClient();

// Parents before children, so relations resolve.
const order = [
  "adminAccount", "siteSettings", "newsArticle", "tournament", "player", "ruleSection",
  "horseCategory", "horseListing", "federationMember", "aboutPhoto", "historyMilestone",
];
const dateFields = new Set(["createdAt", "updatedAt", "publishedAt", "startsAt", "endsAt"]);

function revive(row) {
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, dateFields.has(key) && value ? new Date(value) : value]));
}

async function main() {
  const data = JSON.parse(readFileSync(file, "utf8"));
  const existing = await prisma.siteSettings.count() + await prisma.adminAccount.count();
  if (existing) throw new Error("The target database already has content; nothing was imported.");

  // Older exports have a separate team list; players take their team's name as their club.
  const teams = new Map((data.team ?? []).map((team) => [team.id, team]));
  data.player = (data.player ?? []).map(({ teamId, ...player }) => ({ clubKy: teams.get(teamId)?.nameKy ?? "", clubRu: teams.get(teamId)?.nameRu ?? "", ...player }));

  await prisma.$transaction(order.map((model) => {
    // Sessions from the old database are not carried over: the admin signs in again.
    const rows = (data[model] ?? []).map(revive).map((row) => {
      // Exports from before sessions had their own table
      if (model === "adminAccount") { delete row.sessionTokenHash; delete row.sessionExpiresAt; }
      return row;
    });
    return prisma[model].createMany({ data: rows });
  }));
  console.log(order.map((model) => `${model}: ${(data[model] ?? []).length}`).join("\n"));
}

main()
  .catch((error) => {
    console.error(error.message ?? error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
