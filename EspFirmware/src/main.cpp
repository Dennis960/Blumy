#include <Arduino.h>
#include <plantFi.h>
#include <sensor.h>
#include <ESP8266WiFi.h>

const int sensorAddress = 1;

const int sensorI2CAddress = 1;

const int sensorEnablePin = 3; // RX
const int sdaPin = 2;
const int sclPin = 0;
const uint64_t SLEEP_DURATION = 3600000000; // 60 minutes

void startDeepSleep(uint64_t duration)
{
    ESP.deepSleep(duration);
    yield();
}

void setup()
{
    Wire.begin(sdaPin, sclPin);
    // Use a clock stretch limit of 4ms to prevent the esp from crashing when the sensor is not connected
    Wire.setClockStretchLimit(4000);

    PlantFi plantFi = PlantFi();
    // enable sensor
    pinMode(sensorEnablePin, OUTPUT);
    digitalWrite(sensorEnablePin, HIGH);
    // wait 80 ms for sensor to stabilize
    delay(80);
    Sensor sensor = Sensor(sensorI2CAddress);
    unsigned int water = sensor.readCapacitance(); // has a 550 ms delay
    plantFi.sendData(sensorAddress, water);
    // disable sensor
    digitalWrite(sensorEnablePin, LOW);
    // disable wifi
    WiFi.disconnect(true);
    startDeepSleep(SLEEP_DURATION);
}

void loop()
{
    // nothing to do here
}