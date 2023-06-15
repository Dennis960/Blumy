#include <Arduino.h>
#include "Utils.h"
#include "ConfigurationMode.h"
#include "SensorMode.h"
#include "MyEeprom.h"
#include "Reset.h"

bool wasButtonPressed;

void setup()
{
    // Reset button check
    pinMode(RESET_INPUT_PIN, INPUT);
    wasButtonPressed = digitalRead(RESET_INPUT_PIN);
    serialPrintf("Starting sensor id %d\n", String(loadSensorId()));
    serialPrintf("Reset mode: %s\n", wasButtonPressed ? "Button" : "Automatic");
    initEEPROM();

    // disable wifi
    WiFi.persistent(false);
    WiFi.forceSleepBegin();
    delay(1);
    WiFi.mode(WIFI_OFF);
    delay(1);

    resetFlag = loadResetFlag();
    if (wasButtonPressed)
    {
        if (resetFlag == SENSOR_FLAG) {
            resetFlag = CONFIGURATION_FLAG;
        } else if (resetFlag == CONFIGURATION_FLAG) {
            serialPrintf("Double reset detected, setting to sensor mode\n");
            resetFlag = SENSOR_FLAG;
            ledOff();
        }
        saveResetFlag(resetFlag);
    }
    serialPrintf("Reset flag: %d\n", resetFlag);
    if (resetFlag == SENSOR_FLAG)
    {
        sensorSetup();
    }
    else if (resetFlag == CONFIGURATION_FLAG)
    {
        configurationSetup();
    }
    else
    {
        serialPrintf("Unknown reset flag, resetting\n");
        reset(SENSOR_FLAG);
    }
}

void loop()
{
    if (resetFlag == SENSOR_FLAG)
    {
        sensorLoop();
    }
    else if (resetFlag == CONFIGURATION_FLAG)
    {
        configurationLoop();
    }
}