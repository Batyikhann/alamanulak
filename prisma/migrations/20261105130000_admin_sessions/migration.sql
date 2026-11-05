-- One session per signed-in browser or device, instead of a single one on the admin's account.
CREATE TABLE "AdminSession" (
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("tokenHash")
);

ALTER TABLE "AdminAccount" DROP COLUMN "sessionTokenHash",
DROP COLUMN "sessionExpiresAt";
