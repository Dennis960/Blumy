#include <Arduino.h>

#define DEBUG

#ifndef MY_SERIAL_H
#define MY_SERIAL_H

bool isSerialInitialized = false;

void inline serialPrintf(const char *format, ...)
{
#ifdef DEBUG
    if (!isSerialInitialized)
    {
        Serial.begin(74880);
        Serial.println();
        Serial.println();
        isSerialInitialized = true;
    }
    char buf[256]; // resulting string limited to 256 chars
    va_list args;
    va_start(args, format);
    vsnprintf(buf, 256, format, args);
    va_end(args);
    Serial.printf("%04lu: ", millis());
    Serial.print(buf);
#endif
}
#endif