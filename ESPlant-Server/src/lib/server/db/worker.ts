import { env } from "$env/dynamic/private";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from './schema';

const { Pool } = pg;

const pool = new Pool({
  host: env.POSTGRES_HOST,
  port: Number(env.POSTGRES_PORT),
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  database: env.POSTGRES_DB,
});

export const db = drizzle(pool, { schema });