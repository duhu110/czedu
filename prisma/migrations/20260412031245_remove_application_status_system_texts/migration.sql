-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE IF NOT EXISTS "ApplicationAccessAttempt" (
    "applicationId" TEXT NOT NULL PRIMARY KEY,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" DATETIME,
    "lastFailedAt" DATETIME,
    "lastSuccessAt" DATETIME,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "new_ApplicationAccessAttempt" (
    "applicationId" TEXT NOT NULL PRIMARY KEY,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" DATETIME,
    "lastFailedAt" DATETIME,
    "lastSuccessAt" DATETIME,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ApplicationAccessAttempt" ("applicationId", "failedCount", "lastFailedAt", "lastSuccessAt", "lockedUntil", "updatedAt") SELECT "applicationId", "failedCount", "lastFailedAt", "lastSuccessAt", "lockedUntil", "updatedAt" FROM "ApplicationAccessAttempt";
DROP TABLE "ApplicationAccessAttempt";
ALTER TABLE "new_ApplicationAccessAttempt" RENAME TO "ApplicationAccessAttempt";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
