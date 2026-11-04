-- Horse market: a listing can have several photos (shown on the horse's own page), besides its main photo.
ALTER TABLE "HorseListing" ADD COLUMN "photoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
