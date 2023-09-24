#ifndef SensorMode_H
#define SensorMode_H

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

#include "PlantFi.h"
#include "Sensor.h"
#include "Config.h"
#include "Utils.h"
#include "MyEeprom.h"

extern PlantFi plantFi;

extern int sensorValue;
extern bool wasWifiConnectedLastCycle;

/**
 * Setup function for the sensor mode
 */
void sensorSetup();

/**
 * Loop function for the sensor mode
 */
void sensorLoop();

#endif