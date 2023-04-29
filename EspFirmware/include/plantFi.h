#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ESP8266WiFi.h>

#include <ArduinoJson.h>

class PlantFi
{
private:
    HTTPClient http;
    WiFiClientSecure wifiClient;

    String dataUrl = "https://esplant.hoppingadventure.com/api/data";

public:
    PlantFi()
    {
        startWifiConnection();
    }

    /**
     * Waits until the wifi connection is established or a timeout occurs.
     * @return True if the connection was established, false if a timeout occurred.
     */
    bool waitUntilWifiConnected()
    {
        unsigned long startTime = millis();
        wl_status_t wifiStatus = WiFi.status();
        while (wifiStatus != WL_CONNECTED) // Wait for the WiFI connection completion
        {
            wifiStatus = WiFi.status();
            if (millis() - startTime > 6000 || wifiStatus == WL_IDLE_STATUS || wifiStatus == WL_CONNECT_FAILED) // timeout after 6 seconds or on no connection found
            {
                return false;
            }
            delay(1); // delay to prevent esp watchdog errors
        }
        return true;
    }

    /**
     * Starts the wifi connection and waits until it is connected.
     * Uses the SSID and PASSWORD defined in system environment variables as PIO_PASSWORD and PIO_SSID.
     */
    void startWifiConnection()
    {
        wifiClient.setInsecure();
        const char *ssid = WIFI_SSID;
        const char *password = WIFI_PASSWORD;
        WiFi.begin(ssid, password); // ssid and password are defined in system environment variables as PIO_PASSWORD and PIO_SSID
        waitUntilWifiConnected();
    }

    /**
     * Sends the sensor data to the api
     * @param sensorAddress The address of the sensor
     * @param water The water value of the sensor
     */
    void sendData(int sensorAddress, int water)
    {
        http.begin(wifiClient, dataUrl);
        http.addHeader("Content-Type", "application/json");
        StaticJsonDocument<200> doc;
        doc["sensorAddress"] = sensorAddress;
        doc["water"] = water;
        String payload;
        serializeJson(doc, payload);
        http.POST(payload);
        http.end();
    }
};