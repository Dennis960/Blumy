#include <Sensor.h>

Sensor::Sensor()
{
    analogWriteFreq(40000);
    pinMode(CLOCK_PIN, OUTPUT);
    pinMode(ANALOG_PIN, INPUT);
    analogWrite(CLOCK_PIN, 1);
}

int Sensor::measure()
{
    // measure analog voltage
    value = analogRead(ANALOG_PIN);
    sum = sum - values[counter] + value;
    values[counter] = value;
    counter = (counter + 1) % numberOfValues;
    int average = sum / numberOfValues;
    // calculate standard deviation
    int sumOfSquares = 0;
    for (int i = 0; i < numberOfValues; i++)
    {
        int diff = values[i] - average;
        sumOfSquares += diff * diff;
    }
    int standardDeviation = sqrt(sumOfSquares / numberOfValues);
    if (standardDeviation < 50 && values[numberOfValues - 1] != 0)
    {
        analogWrite(CLOCK_PIN, 0);
        return 1024 - value; // invert -> now 0 is dry and 1024 is wet
    }
    return -1;
}