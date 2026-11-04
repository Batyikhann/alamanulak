-- Homepage first slide: the default photo is now the crowded ulak tartysh in the dust. A site still on the old default
-- photo switches to it; a photo the admin chose is kept.
UPDATE "SiteSettings" SET "heroImageUrl" = '/images/hero-kokboru-crowd.jpg' WHERE "heroImageUrl" = '/images/hero-ulak.jpg';
