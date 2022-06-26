#include <Wire.h>
#include <rtcStore.h>

#define LIGHT_THRESHOLD 20000

class Sensor
{
private:
  int address;

  unsigned int lastCapacitance;
  unsigned int lastLight;
  
  unsigned long long defaultSleepDuration = 30 * 60 * 1000000; // default value: 30 minutes
  unsigned long long alertSleepDuration = 10 * 1000000; // alert value: 10 seconds, when plant is dry

  void requestI2CRead(int reg)
  {
    Wire.beginTransmission(address);
    Wire.write(reg);
    Wire.endTransmission();
  }
  unsigned int readI2CRequestedRegister()
  {
    Wire.requestFrom(address, 2);
    unsigned int t = Wire.read() << 8;
    t = t | Wire.read();
    return t;
  }

  void writeI2CRegister8bit(int value)
  {
    Wire.beginTransmission(address);
    Wire.write(value);
    Wire.endTransmission();
  }

  unsigned int readI2CRegister16bit(int reg)
  {
    requestI2CRead(reg);
    delay(550); // Sensor takes 518 ms to make value available after request
    return readI2CRequestedRegister();
  }

  void initWire()
  {
    Wire.begin();
    Wire.setClockStretchLimit(4000); // probably not neccessary but I don't know
  }

public:
  Sensor(int address)
  {
    this->address = address;
    initWire();
    Serial.println("sensor init");
  }
  Sensor()
  {
    this->address = 0x20;
    initWire();
    Serial.println("sensor init");
  }

  unsigned int readCapacitance()
  {
    lastCapacitance = readI2CRegister16bit(0);
    return lastCapacitance;
  }

  void requestLight()
  {
    writeI2CRegister8bit(3); // request light measurement
  }

  unsigned int readLight()
  {
    lastLight = readI2CRegister16bit(4); // read light register
    return lastLight;
  }

  void chirp()
  {
    writeI2CRegister8bit(9);
    delay(20);
  }

  void ledOn()
  {
    writeI2CRegister8bit(10);
  }
  void ledOff()
  {
    writeI2CRegister8bit(11);
  }

  void chirpTwice()
  {
    chirp();
    delay(100);
    chirp();
  }

  void chirpHappy()
  {
    writeI2CRegister8bit(8);
    delay(100);
  }

  void blinkLed()
  {
    ledOn();
    delay(20);
    ledOff();
  }

  void chirpIfDry()
  {
    int16_t capacitanceDifference = lastCapacitance - rtcStore.referenceCapacitance;
    if (capacitanceDifference < 3)
    {
      rtcStore.isHappy = false;
      if (lastLight < LIGHT_THRESHOLD)
      {
        chirp();
        delay(100);
      }
      else
      {
        blinkLed();
      }
    }
    else if (!rtcStore.isHappy)
    {
      rtcStore.isHappy = true;
      if (lastLight < LIGHT_THRESHOLD)
      {
        chirpHappy();
      }
      else
      {
        blinkLed();
      }
    }
  }

  void setLastCapacitanceAsReference()
  {
    Serial.println("Calibrating");
    rtcStore.referenceCapacitance = lastCapacitance;
    rtcStore.isHappy = false;
    writeToRTC();
    Serial.print("Reference capacitance: ");
    Serial.println(rtcStore.referenceCapacitance);
  }

  unsigned long long getSleepDuration()
  {
    if (rtcStore.isHappy)
    {
      return defaultSleepDuration;
    }
    else
    {
      return alertSleepDuration;
    }
  }
};