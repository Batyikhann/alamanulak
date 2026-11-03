-- Homepage: a full-width photo band between tournaments and players, edited in the admin's settings.
ALTER TABLE "SiteSettings" ADD COLUMN "bandShown" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SiteSettings" ADD COLUMN "bandImageUrl" TEXT NOT NULL DEFAULT '/images/hero-ulak.jpg';
ALTER TABLE "SiteSettings" ADD COLUMN "bandTitleKy" TEXT NOT NULL DEFAULT 'Улак тартыш — ата-бабадан калган мурас';
ALTER TABLE "SiteSettings" ADD COLUMN "bandTitleRu" TEXT NOT NULL DEFAULT 'Улак тартыш — наследие предков';
ALTER TABLE "SiteSettings" ADD COLUMN "bandTextKy" TEXT NOT NULL DEFAULT 'Тоо этегиндеги талаада чабандестер кылымдар бою ушундай чабышкан. Федерация бул салтты сактап, жаңы муунга өткөрөт.';
ALTER TABLE "SiteSettings" ADD COLUMN "bandTextRu" TEXT NOT NULL DEFAULT 'Так всадники состязались в горных долинах веками. Федерация хранит эту традицию и передаёт её новому поколению.';
ALTER TABLE "SiteSettings" ADD COLUMN "bandVideoUrl" TEXT NOT NULL DEFAULT '';
