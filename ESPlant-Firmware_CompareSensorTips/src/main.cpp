#include <Arduino.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"

#define LCD_SDA 19
#define LCD_SCL 18
LiquidCrystal_I2C lcd(0x27, 20, 4); // set the LCD address to 0x27 for a 16 chars and 2 line display

#define MOISTURE_SENSOR_NPPN_CLOCK 23
#define MOISTURE_SENSOR_NPPN_ANALOG 32

#define MOISTURE_SENSOR_PNNP_CLOCK 22
#define MOISTURE_SENSOR_PNNP_ANALOG 33

#define MOISTURE_SENSOR_PNDD_CLOCK 14
#define MOISTURE_SENSOR_PNDD_ANALOG 25

#define MOISTURE_SENSOR_PDDN_CLOCK 12
#define MOISTURE_SENSOR_PDDN_ANALOG 26

#define MOISTURE_SENSOR_PN_CLOCK 13
#define MOISTURE_SENSOR_PN_ANALOG 27

const unsigned long maxStabilizationTime = 500;
const int stabilizationDifference = 5;

const long frequencies[] = {100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600, 51200, 100000, 200000, 400000, 800000, 1600000, 3200000, 6400000};
const int duty_cycles[] = {1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 128, 255};

struct Sensor
{
    uint8_t clockPin;
    uint8_t analogPin;
    String name;
    int output;
    unsigned long stabilizationTime;
};

const Sensor sensors[] = {
    {MOISTURE_SENSOR_NPPN_CLOCK, MOISTURE_SENSOR_NPPN_ANALOG, "NPPN", 0, 0},
    {MOISTURE_SENSOR_PNNP_CLOCK, MOISTURE_SENSOR_PNNP_ANALOG, "PNNP", 0, 0},
    {MOISTURE_SENSOR_PNDD_CLOCK, MOISTURE_SENSOR_PNDD_ANALOG, "PNDD", 0, 0},
    {MOISTURE_SENSOR_PDDN_CLOCK, MOISTURE_SENSOR_PDDN_ANALOG, "PDDN", 0, 0},
    {MOISTURE_SENSOR_PN_CLOCK, MOISTURE_SENSOR_PN_ANALOG, "PN", 0, 0}};

const int numberOfFrequencies = sizeof(frequencies) / sizeof(frequencies[0]);
const int numberOfDutyCycles = sizeof(duty_cycles) / sizeof(duty_cycles[0]);
const int numberOfSensors = sizeof(sensors) / sizeof(sensors[0]);
const int numberOfCombinations = numberOfFrequencies * numberOfDutyCycles * numberOfSensors;
int measurements[numberOfFrequencies][numberOfDutyCycles][numberOfSensors];
int stabilizationTimes[numberOfFrequencies][numberOfDutyCycles][numberOfSensors];
bool successes[numberOfFrequencies][numberOfDutyCycles][numberOfSensors];

void setupMeasurement(int sensorId, long currentFrequency, int currentDutyCycle)
{
    // set ldec resolution based on the frequency
    int resolution = 0;
    if (currentFrequency < 1000)
    {
        resolution = 10;
    }
    else if (currentFrequency < 10000)
    {
        resolution = 9;
    }
    else if (currentFrequency < 100000)
    {
        resolution = 7;
    }
    else if (currentFrequency < 1000000)
    {
        resolution = 5;
    }
    else
    {
        resolution = 3;
    }
    ledcSetup(sensorId, currentFrequency, resolution); // Todo this returns the actual frequency, so I should use it for analysis instead
    ledcWrite(sensorId, currentDutyCycle);
}

void setupAllMeasurements(long currentFrequency, int currentDutyCycle)
{
    for (int i = 0; i < numberOfSensors; i++)
    {
        setupMeasurement(i, currentFrequency, currentDutyCycle);
    }
}

void resetToZero(int sensorId)
{
    int strength = 1;
    int analogValue = analogRead(sensors[sensorId].analogPin);
    Serial.printf("Resetting sensor %d to zero", sensorId);
    Serial.printf(", %d", analogValue);
    Sensor sensor = sensors[sensorId];
    ledcSetup(sensorId, 100, 10);
    ledcWrite(sensorId, 0);
    while (analogValue > 0 && strength <= 256)
    {
        // set moisture sensor pin to ground
        pinMode(sensor.analogPin, OUTPUT);
        digitalWrite(sensor.analogPin, LOW);

        delay(strength);
        strength *= 2;
        // set moisture sensor pin to input
        pinMode(sensor.analogPin, INPUT);
        // wait until the output is 0 again
        analogValue = analogRead(sensor.analogPin);
        Serial.printf(", %d", analogValue);
    }
    Serial.println(" Done!");
}

void resetAllToZero()
{
    for (int i = 0; i < numberOfSensors; i++)
    {
        resetToZero(i);
    }
}

int measure(Sensor &sensor, int numberOfMeasurements, int numberOfThrowaway)
{
    int measurementsTemp[numberOfMeasurements];
    for (int i = 0; i < numberOfMeasurements; i++)
    {
        int measurement = analogRead(sensor.analogPin);
        // insert sorted
        int j = i;
        while (j > 0 && measurementsTemp[j - 1] > measurement)
        {
            measurementsTemp[j] = measurementsTemp[j - 1];
            j--;
        }
        measurementsTemp[j] = measurement;
    }
    // calculate the mean of median measurements
    long measurement = 0;
    for (int i = numberOfThrowaway; i < numberOfMeasurements - numberOfThrowaway; i++)
    {
        measurement += measurementsTemp[i];
    }
    measurement /= numberOfMeasurements - 2 * numberOfThrowaway;
    return measurement;
}

bool measureStabilizedOutput(Sensor &sensor)
{
    const int numberOfMeasurements = 5;
    unsigned long measurementStartTime = millis();
    while (true)
    {
        int min = 4096;
        int max = 0;
        int sum = 0;
        for (int i = 0; i < numberOfMeasurements; i++)
        {
            int measurement = measure(sensor, 100, 10);
            if (measurement < min)
            {
                min = measurement;
            }
            if (measurement > max)
            {
                max = measurement;
            }
            sum += measurement;
        }
        int mean = sum / numberOfMeasurements;
        int difference = max - min;
        if (difference < stabilizationDifference)
        {
            sensor.stabilizationTime = millis() - measurementStartTime;
            sensor.output = mean;
            return true;
        }
        if (millis() - measurementStartTime > maxStabilizationTime)
        {
            sensor.output = mean;
            sensor.stabilizationTime = maxStabilizationTime;
            return false;
        }
    }
}

void setup()
{
    WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0); // disable brownout detector
    analogSetAttenuation(ADC_11db);
    Wire.begin(LCD_SDA, LCD_SCL);
    lcd.init(); // initialize the lcd
    lcd.backlight();
    Serial.begin(115200);

    for (int i = 0; i < numberOfSensors; i++)
    {
        ledcSetup(i, 10000, 8);
        ledcAttachPin(sensors[i].clockPin, i);
    }
    resetAllToZero();
    lcd.setCursor(0, 0);
}

int currentCombination = 0;

void updateLcd(String sensorName, long currentFrequency, int currentDutyCycle, int output, unsigned long stabilizationTime, int progress)
{
    // NPPN-f10000  d280
    lcd.setCursor(0, 0);
    lcd.clear();
    lcd.printf("%4s%6ldf %3dd", sensorName.c_str(), currentFrequency, currentDutyCycle);
    lcd.setCursor(0, 1);
    lcd.printf("o%4dt:%4lu %3d%%", output, stabilizationTime, progress);
}

void loop()
{
    for (int frequencyIndex = 0; frequencyIndex < sizeof(frequencies) / sizeof(frequencies[0]); frequencyIndex++)
    {
        for (int dutyCycleIndex = 0; dutyCycleIndex < sizeof(duty_cycles) / sizeof(duty_cycles[0]); dutyCycleIndex++)
        {
            long currentFrequency = frequencies[frequencyIndex];
            int currentDutyCycle = duty_cycles[dutyCycleIndex];
            for (int sensorId = 0; sensorId < numberOfSensors; sensorId++)
            {
                Sensor sensor = sensors[sensorId];
                resetToZero(sensorId);
                setupMeasurement(sensorId, currentFrequency, currentDutyCycle);
                bool success = measureStabilizedOutput(sensor);
                int progress = (float)currentCombination / numberOfCombinations * 100;
                updateLcd(sensor.name, currentFrequency, currentDutyCycle, sensor.output, sensor.stabilizationTime, progress);
                Serial.printf("frequency: %6ld, duty cycle: %3d, sensor: %4s, output: %4d, stabilization time: %4lu, success: %s\n", currentFrequency, currentDutyCycle, sensor.name.c_str(), sensor.output, sensor.stabilizationTime, success ? "true" : "false");
                measurements[frequencyIndex][dutyCycleIndex][sensorId] = sensor.output;
                stabilizationTimes[frequencyIndex][dutyCycleIndex][sensorId] = sensor.stabilizationTime;
                successes[frequencyIndex][dutyCycleIndex][sensorId] = success;
                currentCombination++;
            }
        }
    }
    // print the results in csv format
    for (int i = 0; i < 1000; i++)
    {
        Serial.println();
    }
    
    Serial.println("sensor_name;frequency;duty_cycle;measurement;stabilization_time;success");
    for (int sensorId = 0; sensorId < numberOfSensors; sensorId++)
    {
        for (int frequencyIndex = 0; frequencyIndex < numberOfFrequencies; frequencyIndex++)
        {
            for (int dutyCycleIndex = 0; dutyCycleIndex < numberOfDutyCycles; dutyCycleIndex++)
            {
                Serial.printf("%s;%ld;%d;%d;%lu;%d\n", sensors[sensorId].name.c_str(), frequencies[frequencyIndex], duty_cycles[dutyCycleIndex], measurements[frequencyIndex][dutyCycleIndex][sensorId], stabilizationTimes[frequencyIndex][dutyCycleIndex][sensorId], successes[frequencyIndex][dutyCycleIndex][sensorId]);
            }
        }
    }
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("100% Done!");
    lcd.setCursor(0, 1);
    lcd.printf("%lu s", millis() / 1000);
    while (true)
    {
        // wait forever
    }
}