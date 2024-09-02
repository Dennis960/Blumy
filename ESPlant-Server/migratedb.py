import argparse
import sqlite3
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime
import base64
from PIL import Image
from io import BytesIO

# Set up argument parser
parser = argparse.ArgumentParser(description='SQLite to PostgreSQL data transfer script.')

# SQLite database argument
parser.add_argument('--sqlite-db', type=str, required=True, help='Path to the SQLite database file.')

# PostgreSQL database arguments
parser.add_argument('--pg-dbname', type=str, required=True, help='PostgreSQL database name.')
parser.add_argument('--pg-user', type=str, required=True, help='PostgreSQL username.')
parser.add_argument('--pg-password', type=str, required=True, help='PostgreSQL password.')
parser.add_argument('--pg-host', type=str, default='localhost', help='PostgreSQL host.')
parser.add_argument('--pg-port', type=str, default='5432', help='PostgreSQL port.')

# Parse the arguments
args = parser.parse_args()

# Connect to SQLite database
sqlite_conn = sqlite3.connect(args.sqlite_db)
sqlite_cursor = sqlite_conn.cursor()

# Connect to PostgreSQL database
postgres_conn = psycopg2.connect(
    dbname=args.pg_dbname,
    user=args.pg_user,
    password=args.pg_password,
    host=args.pg_host,
    port=args.pg_port
)
postgres_cursor = postgres_conn.cursor()

# delete all data from the tables
postgres_cursor.execute("DELETE FROM data")
postgres_cursor.execute("DELETE FROM sensor")
postgres_cursor.execute("DELETE FROM oauth_account")
postgres_cursor.execute("DELETE FROM session")
postgres_cursor.execute("DELETE FROM \"user\"")

# Migrate 'user' table
sqlite_cursor.execute("SELECT id, googleId FROM user")
users = sqlite_cursor.fetchall()
for user in users:
    user_id, google_id = user
    # Insert into the 'user' table in PostgreSQL
    postgres_cursor.execute(
        """
        INSERT INTO "user" (id) 
        VALUES (%s)
        ON CONFLICT DO NOTHING
        """,
        (user_id,)
    )
    # Insert into the 'oauth_account' table in PostgreSQL
    postgres_cursor.execute(
        """
        INSERT INTO oauth_account (user_id, provider, provider_user_id)
        VALUES (%s, %s, %s)
        """,
        (user_id, 'google', google_id)
    )

# Migrate 'sensor' table
sqlite_cursor.execute("SELECT sensorAddress, name, fieldCapacity, permanentWiltingPoint, lowerThreshold, upperThreshold, image, owner, writeToken, readToken FROM sensor")
sensors = sqlite_cursor.fetchall()
for sensor in sensors:
    sensor_address, name, field_capacity, permanent_wilting_point, lower_threshold, upper_threshold, image, owner, write_token, read_token = sensor
    # load image bytes using PIL
    if image is not None:
        image = Image.open(BytesIO(image))
        # convert image to base64
        buffered = BytesIO()
        image.save(buffered, format="PNG")
        image_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
    else:
        image_base64 = None
    postgres_cursor.execute(
        """
        INSERT INTO sensor (sensor_address, name, field_capacity, permanent_wilting_point, lower_threshold, upper_threshold, image_base64, owner, write_token, read_token)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (sensor_address, name, field_capacity, permanent_wilting_point, lower_threshold, upper_threshold, image_base64, owner, write_token, read_token)
    )

# Migrate 'data' table
sqlite_cursor.execute("SELECT id, clientVersion, sensorAddress, date, light, voltage, temperature, humidity, isUsbConnected, moisture, moistureStabilizationTime, isMoistureMeasurementSuccessful, humidityRaw, temperatureRaw, rssi, duration FROM data")
data_rows = sqlite_cursor.fetchall()

# Prepare insert statement for batch insertion
insert_query = """
    INSERT INTO data (id, client_version, sensor_address, date, light, voltage, temperature, humidity, is_usb_connected, moisture, moisture_stabilization_time, is_moisture_measurement_successful, humidity_raw, temperature_raw, rssi, duration)
    VALUES %s
"""

def date_ms_to_iso(date):
    return datetime.utcfromtimestamp(date / 1000).strftime('%Y-%m-%d %H:%M:%S')

# Convert each row as needed (e.g., converting date from INTEGER to TIMESTAMP)
data_values = [
    (
        id_,
        client_version,
        sensor_address,
        date_ms_to_iso(date),
        light,
        voltage,
        temperature,
        humidity,
        is_usb_connected == 1,
        moisture,
        moisture_stabilization_time,
        is_moisture_measurement_successful == 1,
        humidity_raw,
        temperature_raw,
        rssi,
        duration
    )
    for id_, client_version, sensor_address, date, light, voltage, temperature, humidity, is_usb_connected, moisture, moisture_stabilization_time, is_moisture_measurement_successful, humidity_raw, temperature_raw, rssi, duration in data_rows
    if sensor_address < 100 # small hack because some data has invalid sensor address
]

# Execute batch insert
execute_values(postgres_cursor, insert_query, data_values)

# Commit the transactions
postgres_conn.commit()

# Close the connections
sqlite_conn.close()
postgres_conn.close()
