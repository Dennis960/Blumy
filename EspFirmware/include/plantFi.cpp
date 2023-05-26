#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ESP8266WiFi.h>

#include "config.cpp"
#include "myserial.cpp"

#define SSID "OpenWrt"
#define PASSWORD NULL

// The ESP8266 RTC memory is arranged into blocks of 4 bytes. The access methods read and write 4 bytes at a time,
// so the RTC data structure should be padded to a 4-byte multiple.
struct
{
    uint32_t crc32;   // 4 bytes
    uint8_t channel;  // 1 byte,   5 in total
    uint8_t bssid[6]; // 6 bytes, 11 in total
    uint8_t padding;  // 1 byte,  12 in total
} rtcData;

// Function to calculate the CRC32 of the data in the RTC memory
uint32_t calculateCRC32(const uint8_t *data, size_t length)
{
    uint32_t crc = 0xffffffff;
    while (length--)
    {
        uint8_t c = *data++;
        for (uint32_t i = 0x80; i > 0; i >>= 1)
        {
            bool bit = crc & 0x80000000;
            if (c & i)
            {
                bit = !bit;
            }

            crc <<= 1;
            if (bit)
            {
                crc ^= 0x04c11db7;
            }
        }
    }

    return crc;
}

class PlantFi
{
private:
    HTTPClient http;
    WiFiClient wifiClient;

    /**
     * Checks if the RTC data is valid
     * @return True if the RTC data is valid, false otherwise
     */
    bool isRtcValid()
    {
        // Try to read WiFi settings from RTC memory
        if (ESP.rtcUserMemoryRead(0, (uint32_t *)&rtcData, sizeof(rtcData)))
        {
            // Calculate the CRC of what we just read from RTC memory, but skip the first 4 bytes as that's the checksum itself.
            uint32_t crc = calculateCRC32(((uint8_t *)&rtcData) + 4, sizeof(rtcData) - 4);
            if (crc == rtcData.crc32)
            {
                return true;
            }
        }
        return false;
    }

public:
    unsigned long connectionStartTime = 0;
    bool rtcValid = false;

    PlantFi()
    {
    }

    /**
     * Checks if the RTC data is valid
     * Sets rtcValid to true if the RTC data is valid, false otherwise
     */
    void checkRtcValdity()
    {
        rtcValid = isRtcValid();
    }

    /**
     * Connects to the WiFi network
     * @param quickConnect If true, tries to connect using the RTC data
     * If false, tries to connect without using the RTC data
     */
    void connectWifi(bool quickConnect = true)
    {
        if (quickConnect)
        {
            WiFi.begin(SSID, PASSWORD, rtcData.channel, rtcData.bssid, true);
        }
        else
        {
            WiFi.begin(SSID, PASSWORD);
        }
        connectionStartTime = millis();
    }

    /**
     * Resets the WiFi connection
     * After resetting, tries to make a regular connection with connectWifi()
     * Sets rtcValid to false
     */
    void resetWifi()
    {
        // Quick connect is not working, reset WiFi and try regular connection
        WiFi.disconnect();
        delay(10);
        WiFi.forceSleepBegin();
        delay(10);
        WiFi.forceSleepWake();
        delay(10);
        connectWifi(false);
        rtcValid = false;
    }

    /**
     * Checks if the WiFi connection is established
     * @return True if the WiFi connection is established, false otherwise
     */
    bool isWifiConnected()
    {
        return WiFi.status() == WL_CONNECTED;
    }

    /**
     * Saves the WiFi connection data to the RTC memory
     */
    void saveConnection()
    {
        rtcData.channel = WiFi.channel();
        memcpy(rtcData.bssid, WiFi.BSSID(), 6); // Copy 6 bytes of BSSID (AP's MAC address)
        rtcData.crc32 = calculateCRC32(((uint8_t *)&rtcData) + 4, sizeof(rtcData) - 4);
        ESP.rtcUserMemoryWrite(0, (uint32_t *)&rtcData, sizeof(rtcData));
    }

    /**
     * Sends the sensor data to the api
     * @param sensorAddress The address of the sensor
     * @param water The water value of the sensor
     */
    void sendData(int sensorAddress, int water, uint16_t voltage)
    {
        http.begin(wifiClient, "http://esplant.hoppingadventure.com/api/data");
        http.addHeader("Content-Type", "application/json");
        char buffer[200];
        sprintf(buffer, "{\"sensorAddress\":%d,\"water\":%d,\"duration\":%lu,\"voltage\":%d,\"rssi\":%d}", sensorAddress, water, millis(), voltage, WiFi.RSSI());
        http.POST(buffer);
        http.end();
    }
};