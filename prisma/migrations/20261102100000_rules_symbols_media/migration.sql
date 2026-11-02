-- Rules page: a felt-panel symbol per rule.
ALTER TABLE "RuleSection" ADD COLUMN "symbol" TEXT NOT NULL DEFAULT '';

-- Media page: its own list of photos and videos.
CREATE TABLE "MediaItem" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL DEFAULT '',
    "captionKy" TEXT NOT NULL,
    "captionRu" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'federation',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaItem_pkey" PRIMARY KEY ("id")
);
