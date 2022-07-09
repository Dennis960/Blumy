# First Setup

follow the Chirp Firmware README to install the chirp firmware  
to programm the esp_01 connect:

- esp_01 GND to Arduino GND
- esp_01 VCC to Arduino 3.3 V
- esp_01 TX to Arduino TX
- esp_01 RX to Arduino RX
- esp_01 GPIO 0 to Arduino GND
- esp_01 RST to Arduino GND if neccessary (only for a short time and than disconnect)
- esp_01 CH_EN to Arduino 3.3 V
- Arduino Reset to Arduino GND (I don't know if this is neccessary but it worked so far)

to use i2c with chirp:

- GPIO 0 to SDA
- GPIO 2 to SCL

to prevent voltage drop on chirp:

- Chirp VCC to 3.3 V
- Chirp GND to 2222A Emitter
- esp_01 GPIO 3 to 2222A Base
- 2222A Collector to GND
- 100 uF Capacitor minus to 2222A Emitter / Chirp GND
- 100 uF Capacitor plus to 3.3 V

for debugging:

- esp_01 TX to Arduino TX
- esp_01 GND to Arduino GND
