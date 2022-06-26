#include <plantFi.h>
#include <sensor.h>

#define SENSOR_ENABLE_PIN 0

ADC_MODE(ADC_VCC);

int sensor_address = 0x20;
bool isDoubleReset = false;

void startDeepSleep(uint64_t duration)
{
  Serial.print("Sleeping for ");
  Serial.print(duration/1000000);
  Serial.println(" seconds");
  ESP.deepSleep(duration);
  yield();
}

float getVoltage()
{
  return ESP.getVcc()/1000.00;
}

void enableSensor()
{
  pinMode(SENSOR_ENABLE_PIN, OUTPUT);
  digitalWrite(SENSOR_ENABLE_PIN, HIGH); // enable sensor
}

void setup()
{
  unsigned long startTime = millis();
  Serial.begin(115200); // Serial connection

  readFromRTC();
  isDoubleReset = rtcStore.isDoubleReset;
  rtcStore.isDoubleReset = true;
  writeToRTC();

  Serial.println(rtcStore.plant_id);
  Serial.println("");
  enableSensor();

  Sensor sensor(sensor_address);
  sensor.requestLight(); // reqeust light before wifi setup to have enough time to measure
  PlantFi plantFi; // this will block any further setup if WiFi is not setup

  if (isDoubleReset)
  {
    Serial.println("Calibration reset");
    unsigned int referenceCapacitance = sensor.setReferenceCapacitance();
    sensor.chirpTwice(); // chirp twice to show that reference capacitance is measured
    plantFi.sendReferenceCapacitance(referenceCapacitance);
  }
  else
  {
    Serial.println("Deep sleep reset");
  }

  unsigned int water = sensor.readCapacitance();
  unsigned int sun = sensor.readLight();
  sensor.chirpIfDry();

  plantFi.sendMeasurement(water, sun, getVoltage());

  rtcStore.isDoubleReset = false;
  writeToRTC();

  Serial.println(millis() - startTime);
  startDeepSleep(sensor.getSleepDuration());
}

void loop()
{
  // empty currently
}