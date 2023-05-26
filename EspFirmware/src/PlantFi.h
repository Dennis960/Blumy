#ifndef PLANTFI_H
#define PLANTFI_H

#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ESP8266WiFi.h>

#include "Config.h"
#include "Utils.h"

#define SSID "OpenWrt"
#define PASSWORD NULL

/**
 * The data structure to store the WiFi settings in the RTC memory.
 * 
 * The ESP8266 RTC memory is arranged into blocks of 4 bytes. The access methods read and write 4 bytes at a time,
 * so the RTC data structure should be padded to a 4-byte multiple.
*/
struct RtcData
{
    uint32_t crc32;   // 4 bytes
    uint8_t channel;  // 1 byte,   5 in total
    uint8_t bssid[6]; // 6 bytes, 11 in total
    uint8_t padding;  // 1 byte,  12 in total
};

/**
 * Function to calculate the CRC32 of the data in the RTC memory.
 * 
 * @param data The data to calculate the CRC32 of
 * @param length The length of the data
*/
uint32_t calculateCRC32(const uint8_t *data, size_t length);

/**
 * The PlantFi class.
 * 
 * This class contains all the functions to connect to the WiFi network.
 * Uses rtcData to store the WiFi settings in the RTC memory.
*/
class PlantFi {
private:
    HTTPClient http;
    WiFiClient wifiClient;
    /**
     * Checks if the RTC data is valid
     * @return True if the RTC data is valid, false otherwise
     */
    bool isRtcValid();

public:
    unsigned long connectionStartTime = 0;
    bool rtcValid = false;

    PlantFi();

    /**
     * Checks if the RTC data is valid.
     * Sets rtcValid to true if the RTC data is valid, false otherwise
     */
    void checkRtcValidity();

    /**
     * Connects to the WiFi network.
     * 
     * @param quickConnect If true, tries to connect using the RTC data
     * If false, tries to connect without using the RTC data
     */
    void connectWifi(bool quickConnect = true);

    /**
     * Resets the WiFi connection.
     * After resetting, tries to make a regular connection with connectWifi()
     * Sets rtcValid to false
     */
    void resetWifi();

    /**
     * Checks if the WiFi connection is established.
     * 
     * @return True if the WiFi connection is established, false otherwise
     */
    bool isWifiConnected();

    /**
     * Saves the WiFi connection data to the RTC memory.
     */
    void saveConnection();

    /**
     * Sends the sensor data to the api.
     * 
     * @param sensorAddress The address of the sensor
     * @param water The water value of the sensor
     */
    void sendData(int sensorAddress, int water, uint16_t voltage);
};

#endif