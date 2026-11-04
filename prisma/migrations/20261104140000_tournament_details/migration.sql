-- Tournament pages: a photo for the tournament's card and page, and the detailed information the admin writes for
-- its own page (both languages). Empty for existing tournaments: their cards use one of the site's photos and their
-- pages show what they already have until the admin adds more.
ALTER TABLE "Tournament" ADD COLUMN "imageUrl" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Tournament" ADD COLUMN "descriptionKy" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Tournament" ADD COLUMN "descriptionRu" TEXT NOT NULL DEFAULT '';
