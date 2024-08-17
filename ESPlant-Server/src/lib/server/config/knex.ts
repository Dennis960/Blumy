import Knex from "knex";
import knexfile from "../../../../api/knexfile.js";
export const knex = Knex(knexfile[process.env.NODE_ENV ?? "development"]);