#ifndef RESET_H
#define RESET_H

#include <Arduino.h>

#include "Utils.h"
#include "MyEeprom.h"
#include "Config.h"
#include "Utils.h"

/**
 * The flag to indicate in which mode the esp should reset
*/
extern uint32_t resetFlag;

/**
 * Reset the esp
 * 
 * @param _resetFlag The flag to indicate in which mode the esp should reset
*/
void reset(uint32_t _resetFlag);

#endif