-- Homepage photo band: the default photo is now the yurt camp at Son-Kul. A site still on the old default photo
-- switches to it; a photo the admin chose is kept.
ALTER TABLE "SiteSettings" ALTER COLUMN "bandImageUrl" SET DEFAULT '/images/band-sonkul.jpg';
UPDATE "SiteSettings" SET "bandImageUrl" = '/images/band-sonkul.jpg' WHERE "bandImageUrl" = '/images/hero-ulak.jpg';
