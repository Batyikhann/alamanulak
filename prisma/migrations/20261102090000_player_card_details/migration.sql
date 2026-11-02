-- Player card details: city on the front, birth year and achievements on the back.
ALTER TABLE "Player" ADD COLUMN "cityKy" TEXT NOT NULL DEFAULT '',
ADD COLUMN "cityRu" TEXT NOT NULL DEFAULT '',
ADD COLUMN "birthYear" INTEGER,
ADD COLUMN "achievementsKy" TEXT NOT NULL DEFAULT '',
ADD COLUMN "achievementsRu" TEXT NOT NULL DEFAULT '';

-- Demo players get their club's home city (only these demo club names, only where no city is set).
UPDATE "Player" SET "cityKy" = 'Бишкек', "cityRu" = 'Бишкек' WHERE "clubKy" = 'Ала-Тоо' AND "cityKy" = '';
UPDATE "Player" SET "cityKy" = 'Нарын', "cityRu" = 'Нарын' WHERE "clubKy" = 'Нарын' AND "cityKy" = '';
UPDATE "Player" SET "cityKy" = 'Каракол', "cityRu" = 'Каракол' WHERE "clubKy" = 'Ысык-Көл' AND "cityKy" = '';
UPDATE "Player" SET "cityKy" = 'Ош', "cityRu" = 'Ош' WHERE "clubKy" = 'Ош' AND "cityKy" = '';
UPDATE "Player" SET "cityKy" = 'Талас', "cityRu" = 'Талас' WHERE "clubKy" = 'Талас' AND "cityKy" = '';
UPDATE "Player" SET "cityKy" = 'Баткен', "cityRu" = 'Баткен' WHERE "clubKy" = 'Баткен' AND "cityKy" = '';
