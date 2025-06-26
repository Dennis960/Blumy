import * as schema from '$lib/server/db/schema';
import { accounts, sensorReadings, sensors, sessions, subscriptions, users } from '$lib/server/db/schema';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from "pg";

const { Pool } = pg;

const testPool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
});

const _testDb = drizzle(testPool, { schema });
await migrate(_testDb, { migrationsFolder: "migrations" });

export const testDb = _testDb;

export async function resetDatabase() {
    for (const table of [sessions, accounts, sensorReadings, subscriptions, sensors, users]) {
        await testDb.delete(table);
    }
}