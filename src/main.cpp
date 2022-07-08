#include <plantFi.h>
#include <sensor.h>

#ifdef ESP_01
#define SENSOR_ENABLE_PIN 3
#else
#define SENSOR_ENABLE_PIN 0
#endif

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

void disableSensor()
{
  digitalWrite(SENSOR_ENABLE_PIN, LOW); // disable sensor
}

void setup()
{
  unsigned long startTime = millis();
  enableSensor(); // enable as early as possible to have as little delay as possible
  Serial.begin(115200); // Serial connection

  readFromRTC();
  isDoubleReset = rtcStore.isDoubleReset;
  rtcStore.isDoubleReset = true;
  writeToRTC();

  Serial.println(rtcStore.plant_id);
  Serial.println("");
  PlantFi plantFi; // this will start to setup a WiFi connection, it takes at least 1.5 seconds async before wifi is connected, init method takes 4 ms
  Sensor sensor(sensor_address);
  while (millis() - startTime < 80) // Sensor takes 70 ms to boot after getting power
  {
    delay(1);
  }
  sensor.requestLight(); // reqeust light before wifi setup to have enough time to measure
  unsigned int water = sensor.readCapacitance(); // has a 550 ms delay

  unsigned int sun = sensor.readLight(); // has a 550 ms delay
  sensor.chirpIfDry();
  // by now 1500 - 1600 ms have passed
  disableSensor(); // disable sensor pin to maybe save tiny amounts of power for the next 2 seconds

  if (!plantFi.waitUntilWifiConnected()) // after getting all sensor data, wait for the wifi connection to finish
  {
    
    startPlantServer(); // this should set ssid and password
    plantFi.startWifiConnection();
    plantFi.waitUntilWifiConnected();
    if (!isPlantIdInit) {
        rtcStore.plant_id = plantFi.initPlantId();
    }
  }
  
  if (isDoubleReset)
  {
    Serial.println("Calibration reset");
    sensor.setLastCapacitanceAsReference();
    sensor.chirpTwice(); // chirp twice to show that reference capacitance is measured
    plantFi.sendReferenceCapacitance(water);
  }
  else
  {
    Serial.println("Deep sleep reset");
  }

  plantFi.sendMeasurement(water, sun, getVoltage());

  rtcStore.isDoubleReset = false;
  writeToRTC();

  Serial.print("Cycle took: ");
  Serial.println(millis() - startTime);
  startDeepSleep(sensor.getSleepDuration());
}

void loop()
{
  // empty currently
}