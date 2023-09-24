#include <Arduino.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"

LiquidCrystal_I2C lcd(0x27, 20, 4); // set the LCD address to 0x27 for a 16 chars and 2 line display

#define MOISTURE_SENSOR_PIN 13
#define MOISTURE_SENSOR_CLOCK_PIN 12
#define SETTINGS_PIN_1 34
#define SETTINGS_PIN_2 25

const unsigned long maxStabilizationTime = 2000;
const int stabilizationDifference = 5;

const long frequencies[] = {100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600, 51200, 100000, 200000, 400000, 800000, 1600000, 3200000, 6400000};
const int duty_cycles[] = {1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 128, 255};

const int totalFrequencies = sizeof(frequencies) / sizeof(frequencies[0]);
const int totalDutyCycles = sizeof(duty_cycles) / sizeof(duty_cycles[0]);
const int totalCombinations = totalFrequencies * totalDutyCycles;
int currentCombination = 0;

int measurements[totalFrequencies][totalDutyCycles];
int stabilizationTimes[totalFrequencies][totalDutyCycles];

unsigned long stabilizationTime = 0;

void setupMeasurement(long currentFrequency, int currentDutyCycle)
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
    ledcSetup(0, currentFrequency, resolution);
    ledcWrite(0, currentDutyCycle);
}

void resetToZero()
{
    ledcWrite(0, 0);
    // set moisture sensor pin to ground
    pinMode(MOISTURE_SENSOR_PIN, OUTPUT);
    digitalWrite(MOISTURE_SENSOR_PIN, LOW);
    delay(10);
    // set moisture sensor pin to input
    pinMode(MOISTURE_SENSOR_PIN, INPUT);
    while (analogRead(MOISTURE_SENSOR_PIN) > 0)
    {
        // wait until the output is 0 again
    }
}

int measure(int numberOfMeasurements, int numberOfThrowaway)
{
    int measurementsTemp[numberOfMeasurements];
    for (int i = 0; i < numberOfMeasurements; i++)
    {
        int measurement = analogRead(MOISTURE_SENSOR_PIN);
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

int measureStabilizedOutput()
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
            int measurement = measure(100, 10);
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
        lcd.setCursor(0, 1);
        lcd.printf("o: %4d, d: %4d", mean, difference);
        if (difference < stabilizationDifference)
        {
            stabilizationTime = millis() - measurementStartTime;
            return mean;
        }
        if (millis() - measurementStartTime > maxStabilizationTime)
        {
            return 4096;
        }
    }
}

void setup()
{
    WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0); // disable brownout detector
    lcd.init();                                // initialize the lcd
    lcd.backlight();
    Serial.begin(115200);

    ledcAttachPin(MOISTURE_SENSOR_CLOCK_PIN, 0);
    setupMeasurement(25600, 5);
}

void loop()
{
    if (analogRead(SETTINGS_PIN_1) > 2000)
    {

        int output = measureStabilizedOutput();
        lcd.setCursor(0, 0);
        lcd.printf("o: %4d, t: %4lu", output, stabilizationTime);
    }
    else
    {

        for (int frequencyIndex = 0; frequencyIndex < sizeof(frequencies) / sizeof(frequencies[0]); frequencyIndex++)
        {
            for (int dutyCycleIndex = 0; dutyCycleIndex < sizeof(duty_cycles) / sizeof(duty_cycles[0]); dutyCycleIndex++)
            {
                long currentFrequency = frequencies[frequencyIndex];
                int currentDutyCycle = duty_cycles[dutyCycleIndex];
                // show the progress on the LCD
                lcd.setCursor(0, 0);
                int progress = (float)currentCombination / totalCombinations * 100;
                lcd.printf("%2d%%%8ldf%3dd", progress, currentFrequency, currentDutyCycle);

                setupMeasurement(currentFrequency, currentDutyCycle);
                int output = measureStabilizedOutput();
                resetToZero();
                measurements[frequencyIndex][dutyCycleIndex] = output;
                stabilizationTimes[frequencyIndex][dutyCycleIndex] = stabilizationTime;

                currentCombination++;
            }
        }
        // print the results in csv format
        Serial.println("frequency,duty_cycle,measurement,stabilization_time");
        for (int frequencyIndex = 0; frequencyIndex < totalFrequencies; frequencyIndex++)
        {
            for (int dutyCycleIndex = 0; dutyCycleIndex < totalDutyCycles; dutyCycleIndex++)
            {
                Serial.printf("%ld,%d,%d,%lu|", frequencies[frequencyIndex], duty_cycles[dutyCycleIndex], measurements[frequencyIndex][dutyCycleIndex], stabilizationTimes[frequencyIndex][dutyCycleIndex]);
            }
        }
        Serial.println("Done");
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
}