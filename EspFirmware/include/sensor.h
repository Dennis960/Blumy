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

public:
    /**
     * Creates a new sensor object with the given i2c address.
     * Enables the sensor by setting the enable pin to high
     * Starts a request for the capacitance value
     */
    Sensor(int address, int enablePin)
    {
        this->address = address;
        this->pin = enablePin;
        // enable sensor
        pinMode(pin, OUTPUT);
        digitalWrite(pin, HIGH);
        delay(80);
        requestCapacitance();
    }

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
    /**
     * Reads a value from the sensor
     * @param reg The register to read from
     * @return The value of the register
     */
    unsigned int readI2C(uint8_t reg)
    {
        writeI2C(reg);
        delay(550); // Sensor takes 518 ms to make value available after request
        return readI2CRequestedRegister();
    }
    /**
     * Reads the humidity value of the soil the sensor is in
     * @return The humidity value between ~250 and ~1000
     */
    unsigned int readCapacitance()
    {
        return readI2C(I2C_GET_CAPACITANCE);
    }

    /**
     * Requests the sensor to send the capacitance value. This value can be read with getRequestedCapacitance()
    */
    void requestCapacitance()
    {
        writeI2C(I2C_GET_CAPACITANCE);
        this->capacitanceRequestTime = millis();
    }
    /**
     * Reads the capacitance value that was requested with requestCapacitance()
     * Needs to be called after requestCapacitance() with a 550 ms delay
    */
    unsigned int getRequestedCapacitance()
    {
        while (millis() - capacitanceRequestTime < 550)
        {
            delay(1);
        }
        return readI2CRequestedRegister();
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
        digitalWrite(pin, LOW);
    }
};