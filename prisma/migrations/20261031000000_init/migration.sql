-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "AdminAccount" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "sessionTokenHash" TEXT,
    "sessionExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'main',
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsArticle" (
    "id" TEXT NOT NULL,
    "titleKy" TEXT NOT NULL,
    "titleRu" TEXT NOT NULL,
    "excerptKy" TEXT NOT NULL,
    "excerptRu" TEXT NOT NULL,
    "bodyKy" TEXT NOT NULL,
    "bodyRu" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL,
    "titleKy" TEXT NOT NULL,
    "titleRu" TEXT NOT NULL,
    "locationKy" TEXT NOT NULL,
    "locationRu" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "resultSummaryKy" TEXT NOT NULL DEFAULT '',
    "resultSummaryRu" TEXT NOT NULL DEFAULT '',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "nameKy" TEXT NOT NULL,
    "nameRu" TEXT NOT NULL,
    "locationKy" TEXT NOT NULL,
    "locationRu" TEXT NOT NULL,
    "descriptionKy" TEXT NOT NULL,
    "descriptionRu" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "positionKy" TEXT NOT NULL,
    "positionRu" TEXT NOT NULL,
    "number" INTEGER,
    "bioKy" TEXT NOT NULL,
    "bioRu" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuleSection" (
    "id" TEXT NOT NULL,
    "titleKy" TEXT NOT NULL,
    "titleRu" TEXT NOT NULL,
    "bodyKy" TEXT NOT NULL,
    "bodyRu" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RuleSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HorseCategory" (
    "id" TEXT NOT NULL,
    "nameKy" TEXT NOT NULL,
    "nameRu" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HorseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HorseListing" (
    "id" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HorseListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactInquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT '',
    "message" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'ky',
    "handled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FederationMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roleKy" TEXT NOT NULL,
    "roleRu" TEXT NOT NULL,
    "bioKy" TEXT NOT NULL DEFAULT '',
    "bioRu" TEXT NOT NULL DEFAULT '',
    "photoUrl" TEXT NOT NULL DEFAULT '',
    "kind" TEXT NOT NULL DEFAULT 'board',
    "region" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FederationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutPhoto" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "captionKy" TEXT NOT NULL,
    "captionRu" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoryMilestone" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "titleKy" TEXT NOT NULL,
    "titleRu" TEXT NOT NULL,
    "textKy" TEXT NOT NULL DEFAULT '',
    "textRu" TEXT NOT NULL DEFAULT '',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HistoryMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminAccount_username_key" ON "AdminAccount"("username");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HorseListing" ADD CONSTRAINT "HorseListing_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "HorseCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

