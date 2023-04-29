#include <plantFi.h>
#include <sensor.h>
#include <ESP8266WiFi.h>

#define DEBUG 0

const int sdaPin = 5; // D1 on NodeMCU
const int sclPin = 4; // D2 on NodeMCU
#if DEBUG
const uint64_t SLEEP_DURATION = 10000000; // 10 seconds
#else
const uint64_t SLEEP_DURATION = 3600000000; // 60 minutes
#endif

void startDeepSleep(uint64_t duration)
{
  ESP.deepSleep(duration);
  yield();
}

void setup()
{
  #if DEBUG
  Serial.begin(115200);
  Serial.println();
  #endif

  Wire.begin(sdaPin, sclPin);
  // Use a clock stretch limit of 4ms to prevent the esp from crashing when the sensor is not connected
  Wire.setClockStretchLimit(4000);

  // Scan for sensors and save their addresses
  #if DEBUG
  Serial.println("Scanning for sensors...");
  #endif
  int sensorAddresses[127];
  int sensorCount = 0;
  for (int sensorAddress = 1; sensorAddress < 128; sensorAddress++)
  {
    Wire.beginTransmission(sensorAddress);
    if (Wire.endTransmission() == 0)
    {
      #if DEBUG
      Serial.print("Found sensor at address ");
      Serial.println(sensorAddress);
      #endif
      sensorAddresses[sensorCount] = sensorAddress;
      sensorCount++;
    }
  }
  PlantFi plantFi = PlantFi();
  #if DEBUG
  Serial.println("Starting WiFi...");
  #endif

  for (int i = 0; i < sensorCount; i++)
  {
    Sensor sensor = Sensor(sensorAddresses[i]);
    unsigned int water = sensor.readCapacitance(); // has a 550 ms delay
    #if DEBUG
    Serial.print("Sending data for sensor ");
    Serial.print(sensorAddresses[i]);
    Serial.print(" with water level ");
    Serial.println(water);
    sensor.chirp();
    #else
    plantFi.sendData(sensorAddresses[i], water);
    #endif
  }
  startDeepSleep(SLEEP_DURATION);
}

void loop()
{
  // nothing to do here
}