#include "Reset.h"

void reset(uint32_t _resetFlag)
{
    serialPrintf("Disabling led\n");
    ledOff();
    delay(100);

    saveResetFlag(_resetFlag);
    ESP.restart();
}