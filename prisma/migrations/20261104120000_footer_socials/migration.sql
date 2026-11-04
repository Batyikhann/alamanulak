-- Footer social links: WhatsApp (a phone number), Instagram and Facebook (page links). Empty until the admin adds them;
-- the footer shows only the ones that are set.
ALTER TABLE "SiteSettings" ADD COLUMN "whatsappNumber" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SiteSettings" ADD COLUMN "instagramUrl" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SiteSettings" ADD COLUMN "facebookUrl" TEXT NOT NULL DEFAULT '';
