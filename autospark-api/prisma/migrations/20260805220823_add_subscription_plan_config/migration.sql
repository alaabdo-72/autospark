-- CreateTable
CREATE TABLE "SubscriptionPlanConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "washesIncluded" INTEGER NOT NULL,
    "freeWashesIncluded" INTEGER NOT NULL,
    "freeWaxIncluded" INTEGER NOT NULL,
    "minDaysBetweenWashes" INTEGER NOT NULL,
    "freePerkUnlockAfterPaidWashes" INTEGER NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlanConfig_planId_key" ON "SubscriptionPlanConfig"("planId");
