#include <Arduino.h>
#include "Utils.h"
#include "ConfigurationMode.h"
#include "SensorMode.h"

bool isConfigurationMode;

void setup()
{
    // Reset button check
    pinMode(RESET_INPUT_PIN, INPUT);
    isConfigurationMode = digitalRead(RESET_INPUT_PIN);
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