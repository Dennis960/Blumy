#ifndef MYEEPROM_H
#define MYEEPROM_H

#include <Arduino.h>
#include <EEPROM.h>

#include "Utils.h"

#define SSID_ADDRESS 0            // char[32] (32 bytes) max
#define PASSWORD_ADDRESS 32       // char[64] (64 bytes) max
#define WIFI_CHECKSUM_ADDRESS 96  // uint32_t (4 bytes) exact
#define RESET_FLAG_ADDRESS 100    // uint32_t (4 bytes) exact
#define SENSOR_ID_ADDRESS 104     // uint32_t (4 bytes) exact
#define MQTT_SERVER_ADDRESS 108   // char[32] (32 bytes) may overflow
#define MQTT_PORT_ADDRESS 140     // uint32_t (4 bytes) exact
#define MQTT_USER_ADDRESS 144     // char[32] (32 bytes) may overflow
#define MQTT_PASSWORD_ADDRESS 176 // char[32] (32 bytes) may overflow
#define MQTT_CHECKSUM_ADDRESS 208 // uint32_t (4 bytes) exact

#define EEPROM_SIZE 512

/**
 * Initialize the EEPROM
 */
void initEEPROM();

/**
 * Write a string to the EEPROM
 * @param addrOffset The address offset to start writing to
 * @param data The string to write
 */
void writeStringToEEPROM(int addrOffset, const String &data);

/**
 * Write a uint32_t to the EEPROM
 * @param addrOffset The address offset to start writing to
 * @param data The uint32_t to write
 */
void writeUint32_tToEEPROM(int addrOffset, uint32_t data);

/**
 * Read a string from the EEPROM
 * @param addrOffset The address offset to start reading from
 * @return The string read from the EEPROM
 */
String readStringFromEEPROM(int addrOffset);

/**
 * Read a uint32_t from the EEPROM
 * @param addrOffset The address offset to start reading from
 * @return The uint32_t read from the EEPROM
 */
uint32_t readUint32_tFromEEPROM(int addrOffset);

/**
 * Calculate the checksum for the WiFi credentials
 * @return The checksum
 */
uint32_t calculateWifiChecksum();

/**
 * Check if the WiFi credentials are correctly stored in the EEPROM
 * @return True if the credentials are valid, false otherwise
 */
bool isWifiChecksumValid();

/**
 * Save the WiFi credentials to the EEPROM
 * @param ssid The SSID to save
 * @param password The password to save
 */
void saveWiFiCredentials(const String &ssid, const String &password);

/**
 * Load the WiFi credentials from the EEPROM
 * @param ssid String to store the SSID in
 * @param password String to store the password in
 */
void loadWiFiCredentials(String &ssid, String &password);

/**
 * Save the reset flag to the EEPROM
 * @param flag The flag to save
 */
void saveResetFlag(uint32_t flag);

/**
 * Load the reset flag from the EEPROM
 * @return The reset flag
 */
uint32_t loadResetFlag();

/**
 * Save the sensor ID to the EEPROM
 * @param sensorId The sensor ID to save
 */
void saveSensorId(uint32_t sensorId);

/**
 * Load the sensor ID from the EEPROM
 * @return The sensor ID
 */
uint32_t loadSensorId();

/**
 * Calculate the checksum for the MQTT credentials
 * @return The checksum
 */
uint32_t calculateMqttChecksum();

/**
 * Check if the MQTT credentials are correctly stored in the EEPROM
 * @return True if the credentials are valid, false otherwise
 */
bool isMqttChecksumValid();

/**
 * Save the MQTT credentials to the EEPROM
 * @param mqttServer The MQTT server to save
 * @param mqttPort The MQTT port to save
 * @param mqttUser The MQTT user to save
 * @param mqttPassword The MQTT password to save
 */
void saveMqttCredentials(String mqttServer, int mqttPort, String mqttUser, String mqttPassword);

/**
 * Load the MQTT credentials from the EEPROM
 * @param mqttServer String to store the MQTT server in
 * @param mqttPort Integer to store the MQTT port in
 * @param mqttUser String to store the MQTT user in
 * @param mqttPassword String to store the MQTT password in
 */
void loadMqttCredentials(String &mqttServer, int &mqttPort, String &mqttUser, String &mqttPassword);

#endif