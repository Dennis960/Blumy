#include <Arduino.h>
#include "Utils.h"
#include "ConfigurationMode.h"
#include "SensorMode.h"

#define RESET_REMEMBER_PIN 4

bool isConfigurationMode;

void setup()
{
    // Reset button check
    pinMode(RESET_REMEMBER_PIN, INPUT);
    isConfigurationMode = digitalRead(RESET_REMEMBER_PIN);
    serialPrintf("Starting\n");
    serialPrintf("Reset mode: %s\n", isConfigurationMode ? "Button" : "Deep sleep");
    if (isConfigurationMode)
    {
        configurationSetup();
    } else {
        sensorSetup();
    }
}

void loop()
{
    if (isConfigurationMode)
    {
        configurationLoop();
    } else {
        sensorLoop();
    }
}