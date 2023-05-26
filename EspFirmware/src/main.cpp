#include <Arduino.h>
#include "Utils.h"
#include "ConfigurationMode.h"
#include "SensorMode.h"
#include "OtherTheAirMode.h"
#include "MyEeprom.h"

bool wasButtonPressed;

uint32_t resetFlag;

void setup()
{
    // Reset button check
    pinMode(RESET_INPUT_PIN, INPUT);
    wasButtonPressed = digitalRead(RESET_INPUT_PIN);
    serialPrintf("Starting\n");
    serialPrintf("Reset mode: %s\n", wasButtonPressed ? "Button" : "Automatic");
    initEEPROM();
    if (wasButtonPressed)
    {
        // button press should always result in configuration mode
        resetFlag = CONFIGURATION_FLAG;
    }
    else
    {
        resetFlag = loadResetFlag();
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
    else if (resetFlag == OTA_FLAG)
    {
        otaSetup();
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
    else if (resetFlag == OTA_FLAG)
    {
        otaLoop();
    }
}