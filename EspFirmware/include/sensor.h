#include <Wire.h>

class Sensor
{
private:
  int address;
public:
  /**
   * Creates a new sensor object with the given i2c address
  */
  Sensor(int address)
  {
    this->address = address;
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
    return readI2C(0);
  }
  void setAddress(uint8_t newAddress)
  {
    // Writing to 0x01 initiates a change of the address
    writeI2C(0x01);
    // Writing newAddress via i2c
    writeI2C(newAddress);
    chirp();
    reset();
  }
  /**
   * Requests a light measurement from the sensor
   * @see readLight()
  */
  void requestLight()
  {
    writeI2C(3); // request light measurement
  }

  /**
   * Reads the light value from the sensor (sunlight), has to be requested first
   * @see requestLight()
   * @return The light value between 0 and 65535
  */
  unsigned int readLight()
  {
    return readI2C(4); // read light register
  }

  /**
   * Makes the sensor emit a short beep
  */
  void chirp()
  {
    writeI2C(9);
    delay(20);
  }

  /**
   * Turns on the LED on the sensor
  */
  void ledOn()
  {
    writeI2C(10);
  }
  /**
   * Turns off the LED on the sensor
  */
  void ledOff()
  {
    writeI2C(11);
  }

  /**
   * Resets the sensor
  */
  void reset()
  {
    writeI2C(0x06);
  }
};