import type { Knex } from "knex";

const config: Record<string, Knex.Config> = {
  development: {
    client: "sqlite3",
    connection: {
      filename: "../data/sensor.sqlite",
    },
  },
};

export default config;
