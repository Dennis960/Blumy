#include "Utils.h"

bool isSerialInitialized = false;

void serialPrintf(const char *format, ...)
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

void startDeepSleep(uint64_t duration, bool disableRfAtBoot)
{
    Serial.println("Going to sleep");
    if (disableRfAtBoot)
    {
        ESP.deepSleep(duration, WAKE_RF_DISABLED);
    } else {
        ESP.deepSleep(duration);
    }
    yield();
}