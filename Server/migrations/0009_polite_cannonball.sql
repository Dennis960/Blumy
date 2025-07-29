CREATE TABLE "sensor_image" (
	"id" serial PRIMARY KEY NOT NULL,
	"sensor_address" integer NOT NULL,
	"image_base64" text NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Migrate existing image_base64 data to sensor_image
INSERT INTO "sensor_image" ("sensor_address", "image_base64", "uploaded_at")
SELECT
	s."sensor_address",
	s."image_base64",
	COALESCE(
		(
			SELECT MIN(d."date")
			FROM "data" d
			WHERE d."sensor_address" = s."sensor_address"
		),
		now()
	) AS "uploaded_at"
FROM "sensor" s
WHERE s."image_base64" IS NOT NULL;

--> statement-breakpoint

ALTER TABLE "sensor_image" ADD CONSTRAINT "sensor_image_sensor_address_sensor_sensor_address_fk" FOREIGN KEY ("sensor_address") REFERENCES "public"."sensor"("sensor_address") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "sensor" DROP COLUMN "image_base64";