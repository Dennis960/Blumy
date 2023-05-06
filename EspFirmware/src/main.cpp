#include <Arduino.h>
#include <plantFi.h>
#include <sensor.h>
#include <ESP8266WiFi.h>
#include "myserial.h"

// this is the address that should be changed for each sensor
const int sensorAddress = 1;

#define DEBUG

const int sensorI2CAddress = 1;

const int sensorEnablePin = 3; // RX
const int sdaPin = 2;
const int sclPin = 0;
const uint64_t SLEEP_DURATION = 10000000; // 10 seconds

ADC_MODE(ADC_VCC);

void startDeepSleep(uint64_t duration)
{
    serialPrintf("Going to sleep for %llu us\n", duration);
    ESP.deepSleep(duration);
    yield();
}

void setup()
{
#ifdef DEBUG
    Serial.begin(9600);
    Serial.println();
#endif
    serialPrintf("Starting...\n");
    Wire.begin(sdaPin, sclPin);
    Wire.setTimeout(1000);
    Wire.setClockStretchLimit(100000);

    Sensor sensor = Sensor(sensorI2CAddress, sensorEnablePin);
    serialPrintf("Sensor enabled\n");

    PlantFi plantFi = PlantFi();
    if (!plantFi.startWifiConnection())
    {
        serialPrintf("Wifi connection failed\n");
        startDeepSleep(SLEEP_DURATION);
    }

    serialPrintf("Wifi connected\n");
    unsigned int water = sensor.getRequestedCapacitance();;
    int tries = 0;

    while (water >= 65535 && tries++ < 10)
    {
        serialPrintf("Reading water\n");
        water = sensor.readCapacitance();
        serialPrintf("Water: %u\n", water);
    }

    // disable sensor
    sensor.disable();

    // send data
    serialPrintf("Sending data\n");
    plantFi.sendData(sensorAddress, water, ESP.getVcc(), tries);
    serialPrintf("Data sent\n");
    WiFi.disconnect(true);
    delay(1);
    WiFi.mode(WIFI_OFF);
    delay(1);
    startDeepSleep(SLEEP_DURATION);
}

void loop()
{
    // nothing to do here
}