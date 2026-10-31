-- CreateTable
CREATE TABLE "AdminAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "sessionTokenHash" TEXT,
    "sessionExpiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SiteSettings" (
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
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "addressKy" TEXT NOT NULL,
    "addressRu" TEXT NOT NULL,
    "socialUrl" TEXT NOT NULL DEFAULT '',
    "heroImageUrl" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NewsArticle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titleKy" TEXT NOT NULL,
    "titleRu" TEXT NOT NULL,
    "excerptKy" TEXT NOT NULL,
    "excerptRu" TEXT NOT NULL,
    "bodyKy" TEXT NOT NULL,
    "bodyRu" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titleKy" TEXT NOT NULL,
    "titleRu" TEXT NOT NULL,
    "locationKy" TEXT NOT NULL,
    "locationRu" TEXT NOT NULL,
    "startsAt" DATETIME NOT NULL,
    "endsAt" DATETIME NOT NULL,
    "resultSummaryKy" TEXT NOT NULL DEFAULT '',
    "resultSummaryRu" TEXT NOT NULL DEFAULT '',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nameKy" TEXT NOT NULL,
    "nameRu" TEXT NOT NULL,
    "locationKy" TEXT NOT NULL,
    "locationRu" TEXT NOT NULL,
    "descriptionKy" TEXT NOT NULL,
    "descriptionRu" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "positionKy" TEXT NOT NULL,
    "positionRu" TEXT NOT NULL,
    "number" INTEGER,
    "bioKy" TEXT NOT NULL,
    "bioRu" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Player_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RuleSection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titleKy" TEXT NOT NULL,
    "titleRu" TEXT NOT NULL,
    "bodyKy" TEXT NOT NULL,
    "bodyRu" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "HorseCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nameKy" TEXT NOT NULL,
    "nameRu" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "HorseListing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nameKy" TEXT NOT NULL,
    "nameRu" TEXT NOT NULL,
    "ageKy" TEXT NOT NULL,
    "ageRu" TEXT NOT NULL,
    "descriptionKy" TEXT NOT NULL,
    "descriptionRu" TEXT NOT NULL,
    "locationKy" TEXT NOT NULL,
    "locationRu" TEXT NOT NULL,
    "price" INTEGER,
    "imageUrl" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HorseListing_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "HorseCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContactInquiry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT '',
    "message" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'ky',
    "handled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminAccount_username_key" ON "AdminAccount"("username");
