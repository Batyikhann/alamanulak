-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'main',
    "brandName" TEXT NOT NULL DEFAULT 'Alaman Ulak',
    "heroTitleKy" TEXT NOT NULL,
    "heroTitleRu" TEXT NOT NULL,
    "heroTextKy" TEXT NOT NULL,
    "heroTextRu" TEXT NOT NULL,
    "aboutTitleKy" TEXT NOT NULL,
    "aboutTitleRu" TEXT NOT NULL,
    "aboutTextKy" TEXT NOT NULL,
    "aboutTextRu" TEXT NOT NULL,
    "calendarTitleKy" TEXT NOT NULL DEFAULT 'Кийинки беттештер',
    "calendarTitleRu" TEXT NOT NULL DEFAULT 'Ближайшие матчи',
    "teamTitleKy" TEXT NOT NULL DEFAULT 'Ат үстүндөгү биримдик',
    "teamTitleRu" TEXT NOT NULL DEFAULT 'Единство в седле',
    "newsTitleKy" TEXT NOT NULL DEFAULT 'Акыркы жаңылыктар',
    "newsTitleRu" TEXT NOT NULL DEFAULT 'Последние события',
    "rulesTitleKy" TEXT NOT NULL DEFAULT 'Эреже жана тартип',
    "rulesTitleRu" TEXT NOT NULL DEFAULT 'Правила и порядок',
    "horsesTitleKy" TEXT NOT NULL DEFAULT 'Ат каталогу',
    "horsesTitleRu" TEXT NOT NULL DEFAULT 'Каталог лошадей',
    "contactTitleKy" TEXT NOT NULL DEFAULT 'Сурооңуз барбы?',
    "contactTitleRu" TEXT NOT NULL DEFAULT 'Есть вопрос?',
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "addressKy" TEXT NOT NULL,
    "addressRu" TEXT NOT NULL,
    "socialUrl" TEXT NOT NULL DEFAULT '',
    "heroImageUrl" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SiteSettings" ("aboutTextKy", "aboutTextRu", "aboutTitleKy", "aboutTitleRu", "addressKy", "addressRu", "brandName", "contactEmail", "contactPhone", "heroImageUrl", "heroTextKy", "heroTextRu", "heroTitleKy", "heroTitleRu", "id", "socialUrl", "updatedAt") SELECT "aboutTextKy", "aboutTextRu", "aboutTitleKy", "aboutTitleRu", "addressKy", "addressRu", "brandName", "contactEmail", "contactPhone", "heroImageUrl", "heroTextKy", "heroTextRu", "heroTitleKy", "heroTitleRu", "id", "socialUrl", "updatedAt" FROM "SiteSettings";
DROP TABLE "SiteSettings";
ALTER TABLE "new_SiteSettings" RENAME TO "SiteSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
