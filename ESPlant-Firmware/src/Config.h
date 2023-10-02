#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

#define RESET_INPUT_PIN 4

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

/**
 * The timeout for ota updates.
 * If the update process takes longer than this timeout, the update gets cancelled.
*/
const unsigned long UPDATE_TIMEOUT = 10000;

//----------------- Reset flags -----------------
/**
 * The flag to indicate that the esp should reset into sensor mode
 */
const uint32_t SENSOR_FLAG = 0;
/**
 * The flag to indicate that the esp should reset into configuration mode
 */
const uint32_t CONFIGURATION_FLAG = 1;

#endif