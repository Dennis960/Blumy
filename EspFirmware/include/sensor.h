#include <Wire.h>

#define I2C_GET_CAPACITANCE 0x00
#define I2C_RESET 0x01
#define I2C_CHIRP_HAPPY 0x02
#define I2C_CHIRP_UNHAPPY 0x03
#define I2C_LED_ON 0x04
#define I2C_LED_OFF 0x05

class Sensor
{
private:
    int address;
    unsigned long capacitanceRequestTime = 0;
    int pin;

    /**
     * Writes a value to the sensor
     * @param value The value to write
     */
    void writeI2C(uint8_t value)
    {
        Wire.beginTransmission(address);
        Wire.write(value);
        Wire.endTransmission();
    }
    /**
     * Reads the value of the last requested register
     * @return The value of the register
     */
    unsigned int readI2CRequestedRegister()
    {
        Wire.requestFrom(address, 2);
        unsigned int t = Wire.read() << 8;
        t = t | Wire.read();
        return t;
    }

public:
    bool isMeasuring = false;
    bool isEnabled = false;
    unsigned long sensorEnableTime = 0;

    /**
     * Creates a new sensor object with the given i2c address.
     * Enables the sensor by setting the enable pin to high
     * Starts a request for the capacitance value
     */
    Sensor(int address, int enablePin)
    {
        this->address = address;
        this->pin = enablePin;
    }

    /**
     * Enables the sensor by setting the enable pin to high
    */
    void enable()
    {
        pinMode(pin, OUTPUT);
        digitalWrite(pin, HIGH);
        sensorEnableTime = millis();
        isEnabled = true;
    }

    /**
     * Checks if the sensor is active (meaning 80 ms have passed since it was enabled)
     * @return True if the sensor is active
    */
    bool isActive()
    {
        return millis() - sensorEnableTime > 80 && isEnabled;
    }

    /**
     * Requests the sensor to send the capacitance value. This value can be read with getRequestedCapacitance()
    */
    void requestCapacitance()
    {
        isMeasuring = true;
        writeI2C(I2C_GET_CAPACITANCE);
        this->capacitanceRequestTime = millis();
    }
    /**
     * Reads the capacitance value that was requested with requestCapacitance()
     * Needs to be called after requestCapacitance() with a 550 ms delay
    */
    unsigned int getRequestedCapacitance()
    {
        isMeasuring = false;
        return readI2CRequestedRegister();
    }

    /**
     * Checks if the capacitance value is available
     * @return True if the value is available, false otherwise
    */
    bool isCapacitanceAvailable()
    {
        return millis() - capacitanceRequestTime > 550;
    }

    /**
     * Makes the sensor emit a short beep
     */
    void chirp()
    {
        writeI2C(I2C_CHIRP_HAPPY);
        delay(20);
    }

    /**
     * Turns on the LED on the sensor
     */
    void ledOn()
    {
        writeI2C(I2C_LED_ON);
    }
    /**
     * Turns off the LED on the sensor
     */
    void ledOff()
    {
        writeI2C(I2C_LED_OFF);
    }

    /**
     * Resets the sensor
     */
    void reset()
    {
        writeI2C(I2C_RESET);
    }

    /**
     * Disables the sensor by setting the enable pin to LOW
    */
    void disable()
    {
        isEnabled = false;
        digitalWrite(pin, LOW);
    }
};