-- Admin profile: the name and photo shown in the site header for a signed-in admin.
-- AlterTable
ALTER TABLE "AdminAccount" ADD COLUMN     "displayName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "photoUrl" TEXT NOT NULL DEFAULT '';

