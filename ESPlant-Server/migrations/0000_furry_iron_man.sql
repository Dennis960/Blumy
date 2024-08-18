DO $$ BEGIN
 CREATE TYPE "public"."provider_type" AS ENUM('google');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oauth_account" (
	"user_id" text NOT NULL,
	"provider" "provider_type" NOT NULL,
	"provider_user_id" text NOT NULL,
	CONSTRAINT "oauth_account_user_id_provider_pk" PRIMARY KEY("user_id","provider")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_version" integer DEFAULT 1 NOT NULL,
	"sensor_address" integer NOT NULL,
	"date" integer NOT NULL,
	"light" integer DEFAULT -1 NOT NULL,
	"voltage" integer DEFAULT -1 NOT NULL,
	"temperature" integer DEFAULT -1 NOT NULL,
	"humidity" integer DEFAULT -1 NOT NULL,
	"is_usb_connected" boolean DEFAULT false NOT NULL,
	"moisture" integer NOT NULL,
	"moisture_stabilization_time" integer DEFAULT -1 NOT NULL,
	"is_moisture_measurement_successful" boolean DEFAULT true NOT NULL,
	"humidity_raw" integer DEFAULT -1 NOT NULL,
	"temperature_raw" integer DEFAULT -1 NOT NULL,
	"rssi" integer DEFAULT -1 NOT NULL,
	"duration" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sensor" (
	"sensor_address" integer PRIMARY KEY NOT NULL,
	"name" text DEFAULT 'new sensor' NOT NULL,
	"field_capacity" integer DEFAULT 1024 NOT NULL,
	"permanent_wilting_point" integer DEFAULT 128 NOT NULL,
	"lower_threshold" real DEFAULT 0.2 NOT NULL,
	"upper_threshold" real DEFAULT 0.8 NOT NULL,
	"image" "bytea",
	"owner" text,
	"write_token" text,
	"read_token" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscription" (
	"id" serial PRIMARY KEY NOT NULL,
	"sensor_address" integer NOT NULL,
	"last_notification" integer,
	"endpoint" text NOT NULL,
	"keys_p256dh" text NOT NULL,
	"keys_auth" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oauth_account" ADD CONSTRAINT "oauth_account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data" ADD CONSTRAINT "data_sensor_address_sensor_sensor_address_fk" FOREIGN KEY ("sensor_address") REFERENCES "public"."sensor"("sensor_address") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sensor" ADD CONSTRAINT "sensor_owner_user_id_fk" FOREIGN KEY ("owner") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscription" ADD CONSTRAINT "subscription_sensor_address_sensor_sensor_address_fk" FOREIGN KEY ("sensor_address") REFERENCES "public"."sensor"("sensor_address") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
