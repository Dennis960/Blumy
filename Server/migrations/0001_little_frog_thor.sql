ALTER TABLE "subscription" DROP COLUMN "last_notification";
ALTER TABLE "subscription" ADD COLUMN "last_notification" timestamp with time zone;