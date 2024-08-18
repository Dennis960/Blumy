import {
    boolean,
    customType,
    integer,
    pgEnum,
    pgTable,
    primaryKey,
    real,
    serial,
    text,
    timestamp,
} from 'drizzle-orm/pg-core';

export const providerType = pgEnum("provider_type", ["google"]);

/**
 * Custom type for bytea columns, which are used to store binary data such as images.
 */
const bytea = customType<{ data: string; notNull: false; default: false }>({
    dataType() {
        return "bytea";
    },
    toDriver(val) {
        let newVal = val;
        if (val.startsWith("0x")) {
            newVal = val.slice(2);
        }

        return Buffer.from(newVal, "hex");
    },
    fromDriver(val) {
        //@ts-expect-error val is a Buffer
        return val.toString("hex");
    },
});

// User table, used by Lucia
export const users = pgTable("user", {
    id: text("id").primaryKey(),
    createdAt: timestamp("created_at", {
        withTimezone: true,
        mode: "date",
    }).defaultNow(),
});

// OAuth accounts, used by Lucia
export const oauthAccounts = pgTable("oauth_account", {
    userId: text("user_id")
        .notNull()
        .references(() => users.id),
    provider: providerType("provider").notNull(),
    providerUserId: text("provider_user_id").notNull(),
}, (table) => {
    return {
        pk: primaryKey({
            columns: [table.userId, table.provider]
        })
    }
});

// Sessions table, used by Lucia
export const sessions = pgTable("session", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id),
    expiresAt: timestamp("expires_at", {
        withTimezone: true,
        mode: "date",
    }).notNull(),
});

export const sensors = pgTable("sensor", {
    sensorAddress: serial("sensor_address").primaryKey().notNull(),
    name: text("name").notNull().default("new sensor"),
    fieldCapacity: integer("field_capacity").notNull().default(1024),
    permanentWiltingPoint: integer("permanent_wilting_point").notNull().default(128),
    lowerThreshold: real("lower_threshold").notNull().default(0.2),
    upperThreshold: real("upper_threshold").notNull().default(0.8),
    image: bytea("image"),
    owner: text("owner").references(() => users.id),
    writeToken: text("write_token"),
    readToken: text("read_token"),
});

export const sensorReadings = pgTable("data", {
    id: serial("id").primaryKey(),
    clientVersion: integer("client_version").notNull().default(1),
    sensorAddress: integer("sensor_address")
        .notNull()
        .references(() => sensors.sensorAddress),
    date: integer("date").notNull(),
    light: integer("light").notNull().default(-1),
    voltage: integer("voltage").notNull().default(-1),
    temperature: integer("temperature").notNull().default(-1),
    humidity: integer("humidity").notNull().default(-1),
    isUsbConnected: boolean("is_usb_connected").notNull().default(false),
    moisture: integer("moisture").notNull(),
    moistureStabilizationTime: integer("moisture_stabilization_time")
        .notNull()
        .default(-1),
    isMoistureMeasurementSuccessful: boolean("is_moisture_measurement_successful")
        .notNull()
        .default(true),
    humidityRaw: integer("humidity_raw").notNull().default(-1),
    temperatureRaw: integer("temperature_raw").notNull().default(-1),
    rssi: integer("rssi").notNull().default(-1),
    duration: integer("duration").notNull(),
});

export const subscriptions = pgTable("subscription", {
    id: serial("id").primaryKey(),
    sensorAddress: integer("sensor_address")
        .notNull()
        .references(() => sensors.sensorAddress),
    lastNotification: integer("last_notification"),
    endpoint: text("endpoint").notNull(),
    keysP256dh: text("keys_p256dh").notNull(),
    keysAuth: text("keys_auth").notNull(),
});
