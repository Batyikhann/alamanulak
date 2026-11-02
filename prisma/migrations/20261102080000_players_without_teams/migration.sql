-- Players stand on their own: each keeps its team's name as its club, then the Team table goes.
ALTER TABLE "Player" ADD COLUMN "clubKy" TEXT NOT NULL DEFAULT '',
ADD COLUMN "clubRu" TEXT NOT NULL DEFAULT '';

UPDATE "Player" AS p SET "clubKy" = t."nameKy", "clubRu" = t."nameRu" FROM "Team" AS t WHERE p."teamId" = t."id";

ALTER TABLE "Player" DROP CONSTRAINT "Player_teamId_fkey";
ALTER TABLE "Player" DROP COLUMN "teamId";

DROP TABLE "Team";
