#include "Utils.h"
#include "Config.h"

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
    serialPrintf("Going to sleep for %llu microseconds\n", duration);
    if (disableRfAtBoot)
    {
        // Setting this flag will disable RF at boot
        // resulting in less interference when measuring moisture
        ESP.deepSleep(duration, WAKE_RF_DISABLED);
    }
    else
    {
        ESP.deepSleep(duration);
    }
    yield();
}

uint32_t calculateCRC32(const uint8_t *data, size_t length)
{
    uint32_t crc = 0xffffffff;
    while (length--)
    {
        uint8_t c = *data++;
        for (uint32_t i = 0x80; i > 0; i >>= 1)
        {
            bool bit = crc & 0x80000000;
            if (c & i)
            {
                bit = !bit;
            }

            crc <<= 1;
            if (bit)
            {
                crc ^= 0x04c11db7;
            }
        }
    }

    return crc;
}

uint32_t calculateCRC32(const String &data, size_t length)
{
    return calculateCRC32((const uint8_t *)data.c_str(), length);
}

void startConfigurationMode()
{
    serialPrintf("Starting configuration mode\n");
    pinMode(RESET_INPUT_PIN, OUTPUT);
    digitalWrite(RESET_INPUT_PIN, HIGH);
    delay(100);
    ESP.restart();
}