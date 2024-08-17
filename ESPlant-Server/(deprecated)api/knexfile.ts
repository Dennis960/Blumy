import type { Knex } from "knex";

const config: Record<string, Knex.Config> = {
  production: {
    client: "sqlite3",
    connection: {
      filename: "../data/sensor.sqlite",
    },
    useNullAsDefault: true,
  },
  development: {
    client: "sqlite3",
    connection: {
      filename: "../data/sensor.sqlite",
    },
    useNullAsDefault: true,
  },
  test: {
    client: "sqlite3",
    connection: {
      filename: ":memory:",
    },
    useNullAsDefault: true,
  },
};

export default config;
