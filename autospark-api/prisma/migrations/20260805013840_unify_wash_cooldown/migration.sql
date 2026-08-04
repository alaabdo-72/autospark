-- Rename lastPaidWashDate to lastWashDate: the cooldown now applies
-- between any two washes (paid or free), not just paid ones.
ALTER TABLE "Subscription" RENAME COLUMN "lastPaidWashDate" TO "lastWashDate";
