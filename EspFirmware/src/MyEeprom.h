#ifndef MYEEPROM_H
#define MYEEPROM_H

#include <Arduino.h>
#include <EEPROM.h>

#include "Utils.h"

#define SSID_ADDRESS 0
#define PASSWORD_ADDRESS 32
#define CHECKSUM_ADDRESS 64

/**
 * Initialize the EEPROM
 */
void initEEPROM();

/**
 * Check if the EEPROM is valid
 * @return True if the EEPROM is valid, false otherwise
 */
bool isEEPROMValid();

/**
 * Write a string to the EEPROM
 * @param addrOffset The address offset to start writing to
 * @param data The string to write
 */
void writeStringToEEPROM(int addrOffset, const String &data);

/**
 * Read a string from the EEPROM
 * @param addrOffset The address offset to start reading from
 * @return The string read from the EEPROM
 */
String readStringFromEEPROM(int addrOffset);

/**
 * Write a uint32_t to the EEPROM
 * @param addrOffset The address offset to start writing to
 * @param data The uint32_t to write
 */
void writeUint32_tToEEPROM(int addrOffset, uint32_t data);

/**
 * Read a uint32_t from the EEPROM
 * @param addrOffset The address offset to start reading from
 * @return The uint32_t read from the EEPROM
 */
uint32_t readUint32_tFromEEPROM(int addrOffset);

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

#endif