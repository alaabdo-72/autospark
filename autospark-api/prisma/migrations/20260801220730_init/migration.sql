-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "emailOrPhone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "paidWashesRemaining" INTEGER NOT NULL DEFAULT 0,
    "paidWashesUsed" INTEGER NOT NULL DEFAULT 0,
    "freeWashesRemaining" INTEGER NOT NULL DEFAULT 0,
    "freeWaxRemaining" INTEGER NOT NULL DEFAULT 0,
    "lastPaidWashDate" DATETIME,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Booking" (
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
    "totalPrice" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "estimatedStartAt" DATETIME NOT NULL,
    "waitMinutes" INTEGER NOT NULL,
    "checkedInAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_emailOrPhone_key" ON "User"("emailOrPhone");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Booking_date_time_idx" ON "Booking"("date", "time");
