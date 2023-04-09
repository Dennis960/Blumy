import sqlite3 from 'sqlite3';

export type Sensor = {
  sensor_address: number;
  name: string;
};
export type Data = {
  id: number;
  sensor_address: number;
  date: Date;
  water: number;
};

type DatabaseObject = Sensor | Data;

const create_sensor_table_statement = `CREATE TABLE IF NOT EXISTS sensor (
  sensor_address INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL DEFAULT "new sensor"
  );`;

const create_data_table_statement = `CREATE TABLE IF NOT EXISTS data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sensor_address INTEGER NOT NULL,
  date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  water INTEGER NOT NULL,
  FOREIGN KEY (sensor_address) REFERENCES sensor(sensor_address)
  );`;


const DB_SOURCE = '../data/sensor.sqlite';


/**
 * The database connection.
 */
const db = new sqlite3.Database(DB_SOURCE, async (err) => {
  if (err) {
    console.log(err.message);
    throw err;
  } else {
    console.log('Connected to SQLite database');
    // create sensor table if not exists
    dbRun(create_sensor_table_statement, []).catch((err) => {
      console.log(err.message);
    });
    // create data table if not exists
    dbRun(create_data_table_statement, []).catch((err) => {
      console.log(err.message);
    });
  }
});

/**
 * Execute a query and return one row.
 * @param query The query to execute.
 * @param params The parameters to use in the query.
 * @returns One row or null if query fails.
 */
function dbGet<T extends DatabaseObject>(query: string, params: unknown[]): Promise<T | null> {
  return new Promise((resolve) => {
    db.get(query, params, (err, row) => {
      if (err) {
        resolve(null);
      } else {
        resolve(row as T);
      }
    });
  });
}

/**
 * Execute a query and return all rows.
 * @param query The query to execute.
 * @param params The parameters to use in the query.
 * @returns List of rows or error if query fails.
 */
function dbAll<T extends DatabaseObject>(query: string, params: unknown[]): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows as T[]);
      }
    });
  });
}

/**
 * Execute a query and return the last inserted id.
 * @param query The query to execute.
 * @param params The parameters to use in the query.
 * @returns Last inserted id or error if query fails.
 */
function dbInsert(query: string, params: unknown[]): Promise<number> {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
}

/**
 * Execute a query and return nothing.
 * Used to create tables.
 * @param query The query to execute.
 * @param params The parameters to use in the query.
 * @returns Nothing or error if query fails.
 */
function dbRun(query: string, params: unknown[]): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(query, params, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Get sensor by address.
 * @param sensorAddress The address of the sensor.
 * @returns The sensor or throws an error if the sensor does not exist.
 */
export function getSensor(sensorAddress: number) {
  return dbGet<Sensor>('SELECT * FROM sensor WHERE sensor_address = ?', [sensorAddress]);
}

/**
 * Get all sensors.
 * @returns All sensors.
 */
export function getSensors() {
  return dbAll<Sensor>('SELECT * FROM sensor', []);
}

/**
 * 
 * @param sensorAddress The address of the sensor.
 * @param name The name of the sensor.
 * @returns The row id or throws an error if the sensor already exists.
 */
export async function createSensor(sensorAddress: number, name = 'new sensor') {
  const sensor = await getSensor(sensorAddress);
  if (sensor) {
    return Promise.reject('Sensor already exists');
  }
  return await dbInsert('INSERT INTO sensor (sensor_address, name) VALUES (?, ?)', [sensorAddress, name]);
}

/**
 * Add data to the database.
 * @param sensorAddress The address of the sensor.
 * @param water The water level.
 * @returns The id of the inserted data or throws an error if the sensor does not exist.
 */
export function addData(sensorAddress: number, water: number) {
  return dbInsert('INSERT INTO data (sensor_address, water) VALUES (?, ?)', [sensorAddress, water]);
}

/**
 * Get data by sensor address.
 * @param sensorAddress The address of the sensor.
 * @returns The data or an empty list if sensor does not exist.
 */
export function getData(sensorAddress: number) {
  return dbAll<Data>('SELECT * FROM data WHERE sensor_address = ?', [sensorAddress]);
}

export function updateSensor(sensorAddress: number, name: string) {
  return dbRun('UPDATE sensor SET name = ? WHERE sensor_address = ?', [name, sensorAddress]);
}

/**
 * Delete data by sensor address.
 * @param sensorAddress The address of the sensor.
 */
export function deleteDataBySensorAddress(sensorAddress: number) {
  dbRun('DELETE FROM data WHERE sensor_address = ?', [sensorAddress]).catch((err) => {
    console.log(err.message);
  });
}

/**
 * Delete data by id.
 * @param id The id of the data.
 */
export function deleteDataById(id: number) {
  dbRun('DELETE FROM data WHERE id = ?', [id]).catch((err) => {
    console.log(err.message);
  });
}

/**
 * Delete sensor by sensor address.
 * @param sensorAddress The address of the sensor.
 */
export function deleteSensor(sensorAddress: number) {
  dbRun('DELETE FROM sensor WHERE sensor_address = ?', [sensorAddress]).catch((err) => {
    console.log(err.message);
  });
}