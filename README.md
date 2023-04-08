# First Setup

to use i2c with chirp:

- nodemcu D1 to Chirp SDA
- nodemcu D2 to Chirp SCL
- GND and VCC (5 Volts or 3.3 Volts)

Chirp uses ~1.5 mA on idle and ~5 mA on measurement with 3.3V.
NodeMCU uses ~5 mA in deep sleep mode and ~70 mA when connected to wifi with 5V.
