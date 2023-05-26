#ifndef OTHER_THE_AIR_MODE_H
#define OTHER_THE_AIR_MODE_H

#include <ESPAsyncWebServer.h>

#include "Config.h"
#include "Utils.h"
#include "Reset.h"

extern AsyncWebServer otaServer;

/**
 * Setup function for the ota mode
 */
void otaSetup();

/**
 * Loop function for the ota mode
 */
void otaLoop();
#endif