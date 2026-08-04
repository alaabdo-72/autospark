-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "bayNumber" INTEGER NOT NULL,
    "waxAdded" BOOLEAN NOT NULL DEFAULT false,
    "washSource" TEXT NOT NULL,
    "waxSource" TEXT,
    "washPrice" REAL NOT NULL DEFAULT 0,
    "waxPrice" REAL NOT NULL DEFAULT 0,
    "creditApplied" REAL NOT NULL DEFAULT 0,
    "totalPrice" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "estimatedStartAt" DATETIME NOT NULL,
    "waitMinutes" INTEGER NOT NULL,
    "checkedInAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("bayNumber", "checkedInAt", "createdAt", "date", "estimatedStartAt", "id", "status", "time", "totalPrice", "userId", "waitMinutes", "washPrice", "washSource", "waxAdded", "waxPrice", "waxSource") SELECT "bayNumber", "checkedInAt", "createdAt", "date", "estimatedStartAt", "id", "status", "time", "totalPrice", "userId", "waitMinutes", "washPrice", "washSource", "waxAdded", "waxPrice", "waxSource" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE INDEX "Booking_date_time_idx" ON "Booking"("date", "time");
CREATE TABLE "new_Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "paidWashesRemaining" INTEGER NOT NULL DEFAULT 0,
    "paidWashesUsed" INTEGER NOT NULL DEFAULT 0,
    "freeWashesRemaining" INTEGER NOT NULL DEFAULT 0,
    "freeWaxRemaining" INTEGER NOT NULL DEFAULT 0,
    "lastPaidWashDate" DATETIME,
    "points" INTEGER NOT NULL DEFAULT 0,
    "paygCreditJD" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Subscription" ("createdAt", "freeWashesRemaining", "freeWaxRemaining", "id", "lastPaidWashDate", "paidWashesRemaining", "paidWashesUsed", "plan", "points", "updatedAt", "userId") SELECT "createdAt", "freeWashesRemaining", "freeWaxRemaining", "id", "lastPaidWashDate", "paidWashesRemaining", "paidWashesUsed", "plan", "points", "updatedAt", "userId" FROM "Subscription";
DROP TABLE "Subscription";
ALTER TABLE "new_Subscription" RENAME TO "Subscription";
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
