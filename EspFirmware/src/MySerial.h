#ifndef MYSERIAL_H
#define MYSERIAL_H

#include <Arduino.h>

#define DEBUG

extern bool isSerialInitialized;

/**
 * Prints a formatted string to the serial port, if DEBUG is defined.
*/
void serialPrintf(const char *format, ...);

#endif