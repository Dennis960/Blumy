#ifndef UTILS_H
#define UTILS_H

#include <Arduino.h>

#define DEBUG

extern bool isSerialInitialized;

/**
 * Prints a formatted string to the serial port, if DEBUG is defined.
 */
void serialPrintf(const char *format, ...);

/**
 * Starts the deep sleep mode for the given duration.
 *
 * @param duration The duration in microseconds
 * @param disableRfAtBoot Whether to disable the RF at boot
 */
void startDeepSleep(uint64_t duration, bool disableRfAtBoot = true);

/**
 * Calculates the CRC32 checksum for the given data.
 *
 * @param data The data to calculate the checksum for
 * @param length The length of the data
 * @return The CRC32 checksum
 */
uint32_t calculateCRC32(const uint8_t *data, size_t length);

/**
 * Calculates the CRC32 checksum for the given data.
 *
 * @param data The data to calculate the checksum for
 * @param length The length of the data
 * @return The CRC32 checksum
 */
uint32_t calculateCRC32(const String &data, size_t length);

/**
 * Starts the configuration mode by imitating pressing the reset button.
 */
void startConfigurationMode();

#endif