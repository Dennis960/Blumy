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

#endif