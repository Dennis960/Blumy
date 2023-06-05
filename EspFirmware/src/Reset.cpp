#include "Reset.h"

void reset(uint32_t resetFlag)
{
    serialPrintf("Disabling led\n");
    ledOff();
    delay(100);

    saveResetFlag(resetFlag);
    ESP.restart();
}