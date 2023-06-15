#include "Reset.h"

uint32_t resetFlag = SENSOR_FLAG;

void reset(uint32_t _resetFlag)
{
    serialPrintf("Disabling led\n");
    ledOff();
    delay(100);

    saveResetFlag(_resetFlag);
    ESP.restart();
}