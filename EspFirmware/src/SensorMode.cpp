#include "SensorMode.h"

Sensor sensor = Sensor();
PlantFi plantFi = PlantFi("", "", "", 0, "", "", "", "");

int sensorValue = -1;
bool wasConnectedLastCycle = false;

void sensorSetup()
{
    if (!isEEPROMValid())
    {
        serialPrintf("EEPROM not valid, starting configuration mode\n");
        startConfigurationMode();
    }

    String ssid;
    String password;

    loadWiFiCredentials(ssid, password);

    plantFi = PlantFi(ssid, password, "schneefux.xyz", 1883, "esplant", "Ma9BdqVcKyxTgJm3", "esplant", "sensor-1");
    plantFi.checkRtcValidity();

    serialPrintf("Starting connection\n");
    plantFi.connect(plantFi.rtcValid);
}

void sensorLoop()
{
    if (sensorValue == -1)
    {
        sensorValue = sensor.measure();
    }
    // Check connection
    if (plantFi.isConnected())
    {
        if (!wasConnectedLastCycle)
        {
            serialPrintf("Connected\n");
            wasConnectedLastCycle = true;
        }
        if (!plantFi.rtcValid)
        {
            serialPrintf("Saving connection\n");
            plantFi.saveConnection();
            plantFi.rtcValid = true;
        }
        if (sensorValue != -1)
        {
            serialPrintf("Measured value: %d\n", sensorValue);
            serialPrintf("Sending data\n");
            plantFi.sendData(sensorAddress, sensorValue, ESP.getVcc());
            plantFi.disconnect();
            startDeepSleep(SLEEP_DURATION);
        }
    }
    else
    {
        if (plantFi.rtcValid)
        {
            if (millis() - plantFi.connectionStartTime > QUICK_CONNECT_TIMEOUT)
            {
                serialPrintf("Quick connect failed, resetting wifi\n");
                plantFi.reset(); // sets rtcValid to false
            }
        }
        else
        {
            if (millis() - plantFi.connectionStartTime > WIFI_TIMEOUT)
            {
                serialPrintf("Regular connect failed, giving up\n");
                startDeepSleep(SLEEP_DURATION);
            }
        }
    }

    // Total timeout
    if (millis() - plantFi.connectionStartTime > TOTAL_TIMEOUT)
    {
        serialPrintf("Total timeout\n");
        startDeepSleep(SLEEP_DURATION);
    }
}