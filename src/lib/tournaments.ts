import "server-only";
import { db } from "@/lib/db";

export async function getPublicTournaments() {
  const now = Date.now();
  const tournaments = await db.tournament.findMany({
    where: { published: true },
    orderBy: { startsAt: "asc" },
  });
  return tournaments.map((tournament) => ({
    ...tournament,
    isPast: tournament.endsAt.getTime() < now,
  }));
}