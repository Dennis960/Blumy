# First Setup

to use i2c with chirp:

- nodemcu D1 to Chirp SDA
- nodemcu D2 to Chirp SCL
- GND and VCC (5 Volts or 3.3 Volts)

Chirp uses ~1.5 mA on idle and ~5 mA on measurement with 3.3V.

Follow the guide to upload the Chip firmware in ChripFirmware folder.

Remember to not connect 5V to the Chirp but only 3.3V.

Data gets sent every hour to esplant.hoppingadventure.com/api/data with the body as follows:

POST /api/data

```json
{
  "sensorAddress": 1,
  "water": 428
}
```
