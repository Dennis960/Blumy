#include "Reset.h"

void reset(uint32_t resetFlag)
{
    serialPrintf("Disabling led\n");
    analogWrite(RESET_INPUT_PIN, 0);
    delay(100);

    saveResetFlag(resetFlag);
    ESP.restart();
}