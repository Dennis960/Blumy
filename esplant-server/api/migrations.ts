import { Knex } from "knex";

const createSensorTableStatement = `CREATE TABLE IF NOT EXISTS sensor (
  sensor_address INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL DEFAULT "new sensor"
  );`;

const createDataTableStatement = `CREATE TABLE IF NOT EXISTS data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sensor_address INTEGER NOT NULL,
  date INTEGER NOT NULL,
  water INTEGER NOT NULL,
  FOREIGN KEY (sensor_address) REFERENCES sensor(sensor_address)
  );`;

const createMigrationTableStatement = `CREATE TABLE IF NOT EXISTS migration (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  date INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`;

const migrations = [
  {
    name: "data_date_timestamp_to_integer",
    statements: [
      // migrate data table replace date timestamp with integer
      // create new table
      `CREATE TABLE IF NOT EXISTS data_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sensor_address INTEGER NOT NULL,
      date INTEGER NOT NULL,
      water INTEGER NOT NULL,
      FOREIGN KEY (sensor_address) REFERENCES sensor(sensor_address)
      );`,
      // copy data to new table
      `INSERT INTO data_new (id, sensor_address, date, water)
      SELECT id, sensor_address, strftime('%s', date), water FROM data;`,
      // drop old table
      "DROP TABLE data;",
      // rename new table
      "ALTER TABLE data_new RENAME TO data;",
    ],
  },
  {
    name: "data_date_seconds_to_milliseconds",
    statements: [
      // migrate data table replace date seconds with milliseconds
      // create new table
      `CREATE TABLE IF NOT EXISTS data_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sensor_address INTEGER NOT NULL,
      date INTEGER NOT NULL,
      water INTEGER NOT NULL,
      FOREIGN KEY (sensor_address) REFERENCES sensor(sensor_address)
      );`,
      // copy data to new table
      `INSERT INTO data_new (id, sensor_address, date, water)
      SELECT id, sensor_address, date * 1000, water FROM data;`,
      // drop old table
      "DROP TABLE data;",
      // rename new table
      "ALTER TABLE data_new RENAME TO data;",
    ],
  },
  {
    name: "data_add_voltage_and_duration_integers",
    statements: [
      // migrate data table add voltage and duration columns
      // create new table
      `CREATE TABLE IF NOT EXISTS data_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sensor_address INTEGER NOT NULL,
      date INTEGER NOT NULL,
      water INTEGER NOT NULL,
      voltage INTEGER,
      duration INTEGER,
      FOREIGN KEY (sensor_address) REFERENCES sensor(sensor_address)
      );`,
      // copy data to new table
      `INSERT INTO data_new (id, sensor_address, date, water)
      SELECT id, sensor_address, date, water FROM data;`,
      // drop old table
      "DROP TABLE data;",
      // rename new table
      "ALTER TABLE data_new RENAME TO data;",
    ],
  },
  {
    name: "data_add_rssi_integer",
    statements: [
      // migrate data table add rssi column
      // create new table
      `CREATE TABLE IF NOT EXISTS data_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sensor_address INTEGER NOT NULL,
      date INTEGER NOT NULL,
      water INTEGER NOT NULL,
      voltage INTEGER,
      duration INTEGER,
      rssi INTEGER,
      FOREIGN KEY (sensor_address) REFERENCES sensor(sensor_address)
      );`,
      // copy data to new table
      `INSERT INTO data_new (id, sensor_address, date, water, voltage, duration)
      SELECT id, sensor_address, date, water, voltage, duration FROM data;`,
      // drop old table
      "DROP TABLE data;",
      // rename new table
      "ALTER TABLE data_new RENAME TO data;",
    ],
  },
  {
    name: "data_add_measurement_duration_integer",
    statements: [
      // migrate data table add measurement_duration column
      // create new table
      `CREATE TABLE IF NOT EXISTS data_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sensor_address INTEGER NOT NULL,
      date INTEGER NOT NULL,
      water INTEGER NOT NULL,
      voltage INTEGER,
      duration INTEGER,
      rssi INTEGER,
      measurement_duration INTEGER,
      FOREIGN KEY (sensor_address) REFERENCES sensor(sensor_address)
      );`,
      // copy data to new table
      `INSERT INTO data_new (id, sensor_address, date, water, voltage, duration, rssi)
      SELECT id, sensor_address, date, water, voltage, duration, rssi FROM data;`,
      // drop old table
      "DROP TABLE data;",
      // rename new table
      "ALTER TABLE data_new RENAME TO data;",
    ],
  },
  {
    name: "all_change_snake_case_to_camel_case",
    statements: [
      // migrate sensor table change snake_case to camelCase
      // create new table
      `CREATE TABLE IF NOT EXISTS sensor_new (
      sensorAddress INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL DEFAULT "new sensor"
      );`,
      // copy data to new table
      `INSERT INTO sensor_new (sensorAddress, name)
      SELECT sensor_address, name FROM sensor;`,
      // drop old table
      "DROP TABLE sensor;",
      // rename new table
      "ALTER TABLE sensor_new RENAME TO sensor;",
      // migrate data table change snake_case to camelCase
      // create new table
      `CREATE TABLE IF NOT EXISTS data_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sensorAddress INTEGER NOT NULL,
      date INTEGER NOT NULL,
      water INTEGER NOT NULL,
      voltage INTEGER,
      duration INTEGER,
      rssi INTEGER,
      measurementDuration INTEGER,
      FOREIGN KEY (sensorAddress) REFERENCES sensor(sensorAddress)
      );`,
      // copy data to new table
      `INSERT INTO data_new (id, sensorAddress, date, water, voltage, duration, rssi, measurementDuration)
      SELECT id, sensor_address, date, water, voltage, duration, rssi, measurement_duration FROM data;`,
      // drop old table
      "DROP TABLE data;",
      // rename new table
      "ALTER TABLE data_new RENAME TO data;",
    ],
  },
  {
    name: "data_add_plantName_text",
    statements: [
      // migrate data table add plantName column
      // create new table
      `CREATE TABLE IF NOT EXISTS data_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sensorAddress INTEGER NOT NULL,
      date INTEGER NOT NULL,
      water INTEGER NOT NULL,
      voltage INTEGER,
      duration INTEGER,
      rssi INTEGER,
      measurementDuration INTEGER,
      plantName TEXT,
      FOREIGN KEY (sensorAddress) REFERENCES sensor(sensorAddress)
      );`,
      // copy data to new table
      `INSERT INTO data_new (id, sensorAddress, date, water, voltage, duration, rssi, measurementDuration)
      SELECT id, sensorAddress, date, water, voltage, duration, rssi, measurementDuration FROM data;`,
      // drop old table
      "DROP TABLE data;",
      // rename new table
      "ALTER TABLE data_new RENAME TO data;",
    ],
  },
];

export async function migrateDatabase(knex: Knex) {
  console.log("Connected to SQLite database");
  // create tables if not exist
  await knex.raw(createSensorTableStatement);
  await knex.raw(createDataTableStatement);
  await knex.raw(createMigrationTableStatement);
  console.log("Created tables");
  // migrate data table, if necessary
  for (
    let migrationIndex = 0;
    migrationIndex < migrations.length;
    migrationIndex++
  ) {
    const migration = migrations[migrationIndex];
    console.log(
      `Checking migration ${migration.name} ${migrationIndex + 1}/${
        migrations.length
      }`
    );
    const migrationExists = await knex
      .from("migration")
      .select("id")
      .where({ id: migrationIndex + 1 });
    if (!migrationExists) {
      console.log(`Migrating ${migration.name}`);
      for (const statement of migration.statements) {
        await knex.raw(statement);
      }
      await knex("migration").insert({ name: migration.name });
      console.log(`Migrated ${migration.name}`);
    }
  }
}
