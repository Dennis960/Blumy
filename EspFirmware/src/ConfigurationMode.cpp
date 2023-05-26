#include "ConfigurationMode.h"

void configurationSetup()
{
    serialPrintf("Enabling led\n");
    pinMode(RESET_INPUT_PIN, OUTPUT);
    analogWrite(RESET_INPUT_PIN, 60);

    delay(1000);

    serialPrintf("Disabling led\n");
    analogWrite(RESET_INPUT_PIN, 0);
    delay(100);

    startDeepSleep(1000000, false);
}

void configurationLoop()
{
}