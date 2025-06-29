import {
	boolean,
	integer,
	pgEnum,
	pgTable,
	real,
	serial,
	text,
	timestamp
} from 'drizzle-orm/pg-core';

export const providerType = pgEnum('provider_type', ['google']);

// Used by lucia
export const users = pgTable('user', {
	id: text('id').primaryKey(),
	email: text('email').unique(),
	hashedPassword: text('hashed_password'),
	createdAt: timestamp('created_at', {
		withTimezone: true,
		mode: 'date'
	}).defaultNow()
});

// Used by lucia
export const sessions = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	expiresAt: timestamp('expires_at', {
		withTimezone: true,
		mode: 'date'
	}).notNull()
});

export const accounts = pgTable('account', {
	id: serial('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	provider: providerType('provider').notNull(),
	providerUserId: text('provider_user_id').notNull(),
	createdAt: timestamp('created_at', {
		withTimezone: true,
		mode: 'date'
	}).defaultNow()
});

export const sensors = pgTable('sensor', {
	sensorAddress: serial('sensor_address').primaryKey().notNull(),
	name: text('name').notNull().default('new sensor'),
	fieldCapacity: integer('field_capacity').notNull().default(1024),
	permanentWiltingPoint: integer('permanent_wilting_point').notNull().default(128),
	lowerThreshold: real('lower_threshold').notNull().default(0.2),
	upperThreshold: real('upper_threshold').notNull().default(0.8),
	imageBase64: text('image_base64'),
	owner: text('owner').references(() => users.id),
	writeToken: text('write_token').notNull(),
	readToken: text('read_token').notNull()
});

export const sensorReadings = pgTable('data', {
	id: serial('id').primaryKey(),
	firmwareVersion: integer('firmware_version').notNull().default(0),
	sensorAddress: integer('sensor_address')
		.notNull()
		.references(() => sensors.sensorAddress),
	date: timestamp('date', {
		withTimezone: true,
		mode: 'date'
	})
		.notNull()
		.defaultNow(),
	light: real('light').notNull().default(-1),
	voltage: real('voltage').notNull().default(-1),
	temperature: real('temperature').notNull().default(-1),
	humidity: real('humidity').notNull().default(-1),
	isUsbConnected: boolean('is_usb_connected').notNull().default(false),
	moisture: integer('moisture').notNull(),
	moistureStabilizationTime: integer('moisture_stabilization_time').notNull().default(-1),
	isMoistureMeasurementSuccessful: boolean('is_moisture_measurement_successful')
		.notNull()
		.default(true),
	humidityRaw: integer('humidity_raw').notNull().default(-1),
	temperatureRaw: integer('temperature_raw').notNull().default(-1),
	rssi: integer('rssi').notNull().default(-1),
	duration: integer('duration').notNull()
});

export const subscriptions = pgTable('subscription', {
	id: serial('id').primaryKey(),
	sensorAddress: integer('sensor_address')
		.notNull()
		.references(() => sensors.sensorAddress),
	lastNotification: timestamp('last_notification', {
		withTimezone: true,
		mode: 'date'
	}),
	endpoint: text('endpoint').notNull(),
	keysP256dh: text('keys_p256dh').notNull(),
	keysAuth: text('keys_auth').notNull()
});

/**
 * Waitlist table for users who want to be notified when the product is available.
 */
export const waitlist = pgTable('waitlist', {
	id: serial('id').primaryKey(),
	email: text('email').notNull().unique(),
	createdAt: timestamp('created_at', {
		withTimezone: true,
		mode: 'date'
	}).defaultNow()
});
