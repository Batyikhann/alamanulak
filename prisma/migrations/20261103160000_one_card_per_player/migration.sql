-- One card per player: a second yellow turns the card red, and a red replaces a yellow.
-- Existing cards are merged into each player's newest one, which becomes red if the player had a red card or
-- more than one card (two yellows make a red).
UPDATE "PlayerCard" AS c SET "color" = 'red'
FROM (
  SELECT "id",
    ROW_NUMBER() OVER (PARTITION BY "playerId" ORDER BY "date" DESC, "createdAt" DESC) AS "rank",
    COUNT(*) OVER (PARTITION BY "playerId") AS "total",
    BOOL_OR("color" = 'red') OVER (PARTITION BY "playerId") AS "anyRed"
  FROM "PlayerCard"
) AS r
WHERE c."id" = r."id" AND r."rank" = 1 AND (r."total" > 1 OR r."anyRed");

DELETE FROM "PlayerCard" WHERE "id" IN (
  SELECT "id" FROM (
    SELECT "id", ROW_NUMBER() OVER (PARTITION BY "playerId" ORDER BY "date" DESC, "createdAt" DESC) AS "rank"
    FROM "PlayerCard"
  ) AS r WHERE r."rank" > 1
);

-- DropIndex
DROP INDEX "PlayerCard_playerId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "PlayerCard_playerId_key" ON "PlayerCard"("playerId");
