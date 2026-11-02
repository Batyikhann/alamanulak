-- The former teams heading becomes the players page heading (only if it still has the old default text).
UPDATE "SiteSettings" SET "teamTitleKy" = 'Оюнчулар' WHERE "teamTitleKy" IN ('Командалар', 'Ат үстүндөгү биримдик');
UPDATE "SiteSettings" SET "teamTitleRu" = 'Игроки' WHERE "teamTitleRu" IN ('Команды', 'Единство в седле');
