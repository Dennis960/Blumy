#include <plantFi.h>
#include <sensor.h>
#include <ESP8266WiFi.h>

const int sdaPin = 5;
const int sclPin = 4;
const uint64_t SLEEP_DURATION = 3600000000; // 60 minutes
#define DEFAULT_ADDRESS 127

void startDeepSleep(uint64_t duration)
{
  ESP.deepSleep(duration);
  yield();
}

void setup()
{
  PlantFi plantFi = PlantFi();

  Wire.begin(sdaPin, sclPin);
  // Use a clock stretch limit of 4ms to prevent the esp from crashing when the sensor is not connected
  Wire.setClockStretchLimit(4000);

  // Scan for sensors and save their addresses
  int sensorAddresses[127];
  int sensorCount = 0;
  int highestAddress = 0;
  for (int sensorAddress = 1; sensorAddress < 128; sensorAddress++)
  {
    Wire.beginTransmission(sensorAddress);
    if (Wire.endTransmission() == 0)
    {
      sensorAddresses[sensorCount] = sensorAddress;
      if (sensorAddress == DEFAULT_ADDRESS)
      {
        // The default address is used by new sensors, so we need to change it
        Sensor sensor = Sensor(sensorAddress);
        sensor.setAddress(highestAddress + 1);
      }
      if (sensorAddress > highestAddress)
      {
        highestAddress = sensorAddress;
      }
      sensorCount++;
    }
  }

  for (int i = 0; i < sensorCount; i++)
  {
    Sensor sensor = Sensor(sensorAddresses[i]);
    unsigned int water = sensor.readCapacitance(); // has a 550 ms delay
    plantFi.sendData(sensorAddresses[i], water);
  }
  startDeepSleep(SLEEP_DURATION);
}

void loop()
{
  // nothing to do here
}