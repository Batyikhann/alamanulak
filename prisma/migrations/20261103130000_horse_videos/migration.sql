-- Bazaar listings become videos (a YouTube link) with the seller's contact options; the photo is optional.
ALTER TABLE "HorseListing" ADD COLUMN "videoUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN "sellerWhatsapp" TEXT NOT NULL DEFAULT '',
ADD COLUMN "sellerTelegram" TEXT NOT NULL DEFAULT '',
ADD COLUMN "sellerInstagram" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "imageUrl" SET DEFAULT '';
