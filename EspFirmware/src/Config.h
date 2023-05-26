#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

#define RESET_INPUT_PIN 4

//----------------- Sensor Address -----------------
/**
 * The sensorAddress value used to identify the sensor
 */
const int sensorAddress = 2;

//----------------- Measurement delays -----------------
/**
 * The sleep duration between measurements in seconds
 */
const uint64_t SLEEP_DURATION_SECONDS = 3;
/**
 * The sleep duration between measurements in microseconds
 */
const uint64_t SLEEP_DURATION = SLEEP_DURATION_SECONDS * 1000000;

//----------------- Timeouts -----------------
/**
 * The time to wait for a connection to be established using the quick connect method (bssid and channel)
 * Unit: milliseconds
 */
const unsigned long QUICK_CONNECT_TIMEOUT = 4000;
/**
 * The time to wait for a connection to be established using the regular connect method (only ssid and password)
 * Unit: milliseconds
 */
const unsigned long WIFI_TIMEOUT = 7000;
/**
 * The total timeout of the esp. After this time, the esp will be forced into deep sleep
 * Unit: milliseconds
 */
const unsigned long TOTAL_TIMEOUT = 10000;

//----------------- Reset flags -----------------
/**
 * The flag to indicate that the esp should reset into sensor mode
 */
const uint32_t SENSOR_FLAG = 0;
/**
 * The flag to indicate that the esp should reset into configuration mode
 */
const uint32_t CONFIGURATION_FLAG = 1;
/**
 * The flag to indicate that the esp should reset into OTA mode
 */
const uint32_t OTA_FLAG = 2;

//----------------- OTA -----------------
/**
 * The SSID of the OTA network.
 * If the esp is in configuration mode and finds a network with this SSID,
 * it will connect to it and wait for an OTA update
 */
#define OTA_SSID "PlantFi-OTA"

#endif