#ifndef RESET_H
#define RESET_H

#include <Arduino.h>

#include "Utils.h"
#include "MyEeprom.h"
#include "Config.h"

/**
 * Reset the esp
 * 
 * @param resetFlag The flag to indicate in which mode the esp should reset
*/
void reset(uint32_t resetFlag);

#endif