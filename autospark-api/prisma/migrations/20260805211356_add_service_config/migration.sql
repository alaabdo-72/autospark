-- CreateTable
CREATE TABLE "ServiceConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "washName" TEXT NOT NULL DEFAULT 'Basic Wash',
    "exteriorMinutes" INTEGER NOT NULL DEFAULT 7,
    "interiorMinutes" INTEGER NOT NULL DEFAULT 8,
    "paygWashPriceJD" REAL NOT NULL DEFAULT 3.5,
    "waxName" TEXT NOT NULL DEFAULT 'Wax',
    "waxPriceJD" REAL NOT NULL DEFAULT 4,
    "updatedAt" DATETIME NOT NULL
);
