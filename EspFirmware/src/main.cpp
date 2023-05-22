#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <plantFi.h>
#include <sensor.h>

#include <config.h>

#define RESET_REMEMBER_PIN 4

Sensor sensor = Sensor();
PlantFi plantFi = PlantFi();

void startDeepSleep(uint64_t duration)
{
    Serial.println("Going to sleep");
    ESP.deepSleep(duration, WAKE_RF_DISABLED);
    yield();
}

void setup()
{
    // Reset button check
    pinMode(4, INPUT);
    bool isButtonReset = digitalRead(RESET_REMEMBER_PIN);
    Serial.begin(74880);
    serialPrintf("Starting\n");
    serialPrintf("Reset mode: %s\n", isButtonReset ? "Button" : "Deep sleep");

    // WiFi
    WiFi.persistent(false);
    WiFi.forceSleepBegin();
    delay(1);
    WiFi.mode(WIFI_OFF);
    delay(1);
    plantFi.checkRtcValdity();

    serialPrintf("Starting wifi connection\n");
    plantFi.connectWifi(plantFi.rtcValid);
}

int value = -1;

bool wasWifiConnectedLastCycle = false;

void loop()
{
    if (value == -1)
    {
        value = sensor.measure();
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
        if (value != -1)
        {
            serialPrintf("Measured value: %d\n", value);
            serialPrintf("Sending data\n");
            plantFi.sendData(sensorAddress, value, ESP.getVcc());
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