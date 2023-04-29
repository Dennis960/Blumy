#include <Arduino.h>
#include <plantFi.h>
#include <sensor.h>
#include <ESP8266WiFi.h>

// this is the address that should be changed for each sensor
const int sensorAddress = 1;

const int sensorI2CAddress = 1;

const int sensorEnablePin = 3; // RX
const int sdaPin = 2;
const int sclPin = 0;
const uint64_t SLEEP_DURATION = 3600000000; // 60 minutes

ADC_MODE(ADC_VCC);

void startDeepSleep(uint64_t duration)
{
    ESP.deepSleep(duration);
    yield();
}

void setup()
{
    unsigned long start = millis();
    Wire.begin(sdaPin, sclPin);
    Wire.setTimeout(1000);
    Wire.setClockStretchLimit(4000);

    // enable sensor (needs 80ms to start)
    unsigned int sensorStartTime = millis();
    pinMode(sensorEnablePin, OUTPUT);
    digitalWrite(sensorEnablePin, HIGH);
    PlantFi plantFi = PlantFi();
    if (plantFi.startWifiConnection())
    {
        unsigned int water = 65535;
        Sensor sensor = Sensor(sensorI2CAddress);
        // wait at least 80 ms for the sensor to start
        while (millis() - sensorStartTime < 80)
        {
            delay(1);
        }
        int tries = 0;
        while ((water == 65535 || water == -1) && tries++ < 10)
        {
            water = sensor.readCapacitance(); // has a 550 ms delay
        }
        // disable sensor
        digitalWrite(sensorEnablePin, LOW);
        // send data
        plantFi.sendData(sensorAddress, water, start, ESP.getVcc());
        // disable wifi
        WiFi.disconnect(true);
    }
    startDeepSleep(SLEEP_DURATION);
}

void loop()
{
    // nothing to do here
}