#include "SensorMode.h"

Sensor sensor = Sensor();
PlantFi plantFi = PlantFi("", "");

int sensorValue = -1;
bool wasWifiConnectedLastCycle = false;

void sensorSetup()
{
    // WiFi
    WiFi.persistent(false);
    WiFi.forceSleepBegin();
    delay(1);
    WiFi.mode(WIFI_OFF);
    delay(1);

    if (!isEEPROMValid())
    {
        serialPrintf("EEPROM not valid, starting configuration mode\n");
        startConfigurationMode();
    }

    String ssid;
    String password;

    loadWiFiCredentials(ssid, password);

    plantFi = PlantFi(ssid, password);
    plantFi.checkRtcValidity();

    serialPrintf("Starting wifi connection\n");
    plantFi.connectWifi(plantFi.rtcValid);
}

void sensorLoop()
{
    if (sensorValue == -1)
    {
        sensorValue = sensor.measure();
    }
    // Check wifi connection
    if (plantFi.isWifiConnected())
    {
        if (!wasWifiConnectedLastCycle)
        {
            serialPrintf("Wifi connected\n");
            wasWifiConnectedLastCycle = true;
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
                plantFi.resetWifi(); // sets rtcValid to false
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